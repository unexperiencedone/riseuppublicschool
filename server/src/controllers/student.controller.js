import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created, paginated } from '../utils/ApiResponse.js';
import { getPagination, buildSort } from '../utils/pagination.js';
import { Student, User, Admission } from '../models/index.js';
import { saveFile } from '../services/storage.service.js';
import sendEmail from '../services/email.service.js';
import env from '../config/env.js';
import recordAudit from '../middleware/audit.js';
import { nanoid } from 'nanoid';

/** GET /admin/students */
export const listStudents = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q, { defaultLimit: 25 });
  const filter = {};
  if (q.classLevel) filter.classLevel = q.classLevel;
  if (q.section) filter.section = q.section;
  if (q.session) filter.session = q.session;
  if (q.status) filter.status = q.status;
  if (q.search) {
    filter.$or = [
      { firstName: new RegExp(q.search, 'i') },
      { lastName: new RegExp(q.search, 'i') },
      { admissionNo: new RegExp(q.search, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    Student.find(filter).sort(buildSort(q.sort, 'classLevel rollNo')).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
  ]);
  return paginated(res, items, { page, limit, total });
});

export const getStudent = asyncHandler(async (req, res) => {
  const item = await Student.findById(req.params.id).populate('user', 'email role isActive').lean();
  if (!item) throw ApiError.notFound('Student not found');
  return ok(res, item);
});

export const createStudent = asyncHandler(async (req, res) => {
  const photo = req.file ? await saveFile(req.file, 'students') : undefined;
  const student = await Student.create({ ...req.body, photo });
  await recordAudit(req, { action: 'student.create', entity: 'Student', entityId: student._id });
  return created(res, student, 'Student enrolled');
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');
  Object.assign(student, req.body);
  if (req.file) student.photo = await saveFile(req.file, 'students');
  await student.save();
  return ok(res, student, 'Student updated');
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
  if (!student) throw ApiError.notFound('Student not found');
  await recordAudit(req, { action: 'student.deactivate', entity: 'Student', entityId: req.params.id });
  return ok(res, null, 'Student marked inactive');
});

/** POST /admin/students/:id/portal-access — creates parent + student logins. */
export const grantPortalAccess = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw ApiError.notFound('Student not found');

  const parentEmail = (req.body.parentEmail || student.father?.email || student.mother?.email || '').toLowerCase();
  if (!parentEmail) throw ApiError.badRequest('A parent email is required to create portal access');

  const tempPassword = `Rups@${nanoid(6)}`;
  let parent = await User.findOne({ email: parentEmail });
  if (!parent) {
    parent = await User.create({
      name: student.father?.name || student.guardian?.name || 'Parent',
      email: parentEmail,
      phone: student.father?.phone || student.guardian?.phone,
      password: tempPassword,
      role: 'parent',
      mustChangePassword: true,
      wards: [student._id],
    });
  } else if (!parent.wards.map(String).includes(String(student._id))) {
    parent.wards.push(student._id);
    await parent.save();
  }

  student.user = parent._id;
  await student.save();

  await sendEmail({
    to: parentEmail,
    subject: 'Your Rise UP Public School parent portal login',
    template: 'portal-credentials',
    data: { name: parent.name, email: parentEmail, password: tempPassword, portalUrl: `${env.clientUrl}/portal/login` },
  });

  await recordAudit(req, { action: 'student.portal_access', entity: 'Student', entityId: student._id });
  return ok(res, { parentId: parent._id, email: parentEmail }, 'Portal access created and credentials emailed');
});

/** POST /admin/students/from-admission/:admissionId — converts an admitted application into a student. */
export const enrolFromAdmission = asyncHandler(async (req, res) => {
  const admission = await Admission.findById(req.params.admissionId);
  if (!admission) throw ApiError.notFound('Admission record not found');
  if (admission.status !== 'admitted') throw ApiError.badRequest('Mark the application as "admitted" first');

  const year = new Date().getFullYear();
  const count = await Student.countDocuments({});
  const student = await Student.create({
    admissionNo: `RUPS${year}${String(count + 1).padStart(4, '0')}`,
    firstName: admission.student.firstName,
    lastName: admission.student.lastName,
    dob: admission.student.dob,
    gender: admission.student.gender || 'other',
    classLevel: admission.student.classApplyingFor,
    stream: admission.student.stream,
    session: admission.session,
    father: { name: admission.parent.fatherName, phone: admission.parent.phone, email: admission.parent.email, occupation: admission.parent.occupation },
    mother: { name: admission.parent.motherName },
    guardian: { name: admission.parent.guardianName, relation: admission.parent.relation, phone: admission.parent.phone },
    address: admission.address,
  });

  await recordAudit(req, { action: 'student.enrol_from_admission', entity: 'Student', entityId: student._id });
  return created(res, student, `Enrolled as ${student.admissionNo}`);
});
