import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created, paginated } from '../utils/ApiResponse.js';
import { getPagination, buildSort } from '../utils/pagination.js';
import Admission from '../models/Admission.js';
import { saveMany } from '../services/storage.service.js';
import { notifyAdmissionReceived } from '../services/notification.service.js';
import recordAudit from '../middleware/audit.js';
import Setting from '../models/Setting.js';

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

/** POST /admissions/apply — full application with document upload. */
export const createApplication = asyncHandler(async (req, res) => {
  const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
  const settings = await Setting.get();

  const files = await saveMany(req.files || [], 'admissions');
  const admission = await Admission.create({
    ...payload,
    type: 'application',
    session: settings.currentSession,
    documents: files.map((f, i) => ({ type: (payload.documentTypes || [])[i] || 'other', ...f })),
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
