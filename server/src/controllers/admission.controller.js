import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created, paginated } from '../utils/ApiResponse.js';
import { getPagination, buildSort } from '../utils/pagination.js';
import Admission from '../models/Admission.js';
import { saveMany, createUploadSignature } from '../services/storage.service.js';
import { notifyAdmissionReceived } from '../services/notification.service.js';
import recordAudit from '../middleware/audit.js';
import Setting from '../models/Setting.js';
import env from '../config/env.js';
import { fileDescriptorSchema } from '../validators/common.validator.js';

const documentDescriptorSchema = fileDescriptorSchema.extend({
  type: z.enum(['birth_certificate', 'transfer_certificate', 'report_card', 'aadhaar', 'photo', 'caste_certificate', 'other']).optional(),
});
function parseDocuments(raw) {
  const result = z.array(documentDescriptorSchema).safeParse(raw || []);
  if (!result.success) throw ApiError.unprocessable('Invalid upload descriptor', result.error.issues);
  return result.data;
}

/**
 * POST /admissions/upload-signature — public, rate-limited. Unlike the admin
 * signature endpoint this needs no auth (an applicant is, by definition, not
 * signed in yet), so the folder is hardcoded to 'admissions' rather than
 * client-selectable — the caller cannot redirect uploads anywhere else. We
 * chose a signed upload over an unsigned Cloudinary preset because a preset
 * lives in the Cloudinary dashboard, outside code review, and — once its name
 * leaks — accepts uploads from anyone indefinitely; a signature (a) is minted
 * fresh per request, (b) is already behind the same publicFormLimiter as
 * /admissions/apply, and (c) keeps every upload path server-signed and
 * consistent with the admin flow instead of a second, differently-configured mechanism.
 */
export const createAdmissionUploadSignature = asyncHandler(async (req, res) => {
  if (env.storage.driver !== 'cloudinary') {
    throw ApiError.badRequest('Direct uploads require STORAGE_DRIVER=cloudinary');
  }
  return ok(res, await createUploadSignature('admissions'));
});

/** POST /admissions/enquiry — public, rate-limited, honeypot-protected. */
export const createEnquiry = asyncHandler(async (req, res) => {
  if (req.body.website) throw ApiError.badRequest('Submission rejected');   // bot trap
  const settings = await Setting.get();

  const admission = await Admission.create({
    ...req.body,
    type: 'enquiry',
    session: settings.currentSession,
    source: 'website',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    statusHistory: [{ status: 'new', note: 'Submitted via website' }],
  });

  // Notifications are best-effort and must never fail the request.
  notifyAdmissionReceived(admission).catch(() => {});

  return created(res, {
    applicationNo: admission.applicationNo,
    id: admission._id,
  }, 'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.');
});

/**
 * POST /admissions/apply — full application. Either `multipart/form-data`
 * (local dev — `data` is a JSON string field alongside the `documents` files)
 * or `application/json` with documents already uploaded to Cloudinary.
 */
export const createApplication = asyncHandler(async (req, res) => {
  const isJson = req.is('application/json');
  const payload = isJson ? req.body : (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body);
  const settings = await Setting.get();

  let documents;
  if (isJson) {
    documents = parseDocuments(payload.documents).map((d) => ({ type: d.type || 'other', ...d }));
  } else {
    const files = await saveMany(req.files || [], 'admissions');
    documents = files.map((f, i) => ({ type: (payload.documentTypes || [])[i] || 'other', ...f }));
  }

  const admission = await Admission.create({
    ...payload,
    type: 'application',
    session: settings.currentSession,
    documents,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    statusHistory: [{ status: 'new', note: 'Online application submitted' }],
  });

  notifyAdmissionReceived(admission).catch(() => {});
  return created(res, { applicationNo: admission.applicationNo, id: admission._id }, 'Application submitted successfully');
});

/** GET /admissions/track/:applicationNo — public status lookup (phone-verified). */
export const trackApplication = asyncHandler(async (req, res) => {
  const { applicationNo } = req.params;
  const { phone } = req.query;
  const admission = await Admission.findOne({ applicationNo: decodeURIComponent(applicationNo), 'parent.phone': phone })
    .select('applicationNo status student.firstName student.classApplyingFor createdAt followUpAt');
  if (!admission) throw ApiError.notFound('No application found for that number and mobile combination');
  return ok(res, admission);
});

/* ---------------- admin ---------------- */

/** GET /admin/admissions */
export const listAdmissions = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q, { defaultLimit: 20 });
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.type) filter.type = q.type;
  if (q.session) filter.session = q.session;
  if (q.classLevel) filter['student.classApplyingFor'] = q.classLevel;
  if (q.search) {
    filter.$or = [
      { applicationNo: new RegExp(q.search, 'i') },
      { 'student.firstName': new RegExp(q.search, 'i') },
      { 'parent.guardianName': new RegExp(q.search, 'i') },
      { 'parent.phone': new RegExp(q.search, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    Admission.find(filter).sort(buildSort(q.sort)).skip(skip).limit(limit).lean(),
    Admission.countDocuments(filter),
  ]);
  return paginated(res, items, { page, limit, total });
});

/** GET /admin/admissions/:id */
export const getAdmission = asyncHandler(async (req, res) => {
  const item = await Admission.findById(req.params.id).populate('assignedTo', 'name email');
  if (!item) throw ApiError.notFound('Admission record not found');
  return ok(res, item);
});

/** PATCH /admin/admissions/:id/status */
export const updateAdmissionStatus = asyncHandler(async (req, res) => {
  const admission = await Admission.findById(req.params.id);
  if (!admission) throw ApiError.notFound('Admission record not found');

  const before = { status: admission.status };
  admission.status = req.body.status;
  if (req.body.followUpAt) admission.followUpAt = req.body.followUpAt;
  admission.statusHistory.push({ status: req.body.status, note: req.body.note, by: req.user._id });
  await admission.save();

  await recordAudit(req, { action: 'admission.status', entity: 'Admission', entityId: admission._id, before, after: { status: admission.status } });
  return ok(res, admission, 'Status updated');
});

/** DELETE /admin/admissions/:id */
export const deleteAdmission = asyncHandler(async (req, res) => {
  const item = await Admission.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Admission record not found');
  await recordAudit(req, { action: 'admission.delete', entity: 'Admission', entityId: req.params.id, before: item.toObject() });
  return ok(res, null, 'Admission record deleted');
});

/** GET /admin/admissions/stats */
export const admissionStats = asyncHandler(async (req, res) => {
  const [byStatus, byClass, monthly] = await Promise.all([
    Admission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Admission.aggregate([{ $group: { _id: '$student.classApplyingFor', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Admission.aggregate([
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } }, { $limit: 24 },
    ]),
  ]);
  return ok(res, { byStatus, byClass, monthly, total: byStatus.reduce((s, x) => s + x.count, 0) });
});
