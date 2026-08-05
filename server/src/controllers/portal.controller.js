import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created, paginated } from '../utils/ApiResponse.js';
import { getPagination } from '../utils/pagination.js';
import { Student, Attendance, Result, Homework, FeeInvoice, FeeStructure, Notice } from '../models/index.js';
import { notifyResultPublished } from '../services/notification.service.js';
import recordAudit from '../middleware/audit.js';

/** Resolves which student ids the caller is allowed to read. */
const scopeStudentIds = (user) => {
  if (['super_admin', 'admin', 'principal', 'teacher', 'accountant'].includes(user.role)) return null; // no scope
  if (user.role === 'student') return [String(user.student)];
  if (user.role === 'parent') return (user.wards || []).map(String);
  return [];
};

const assertAccess = (user, studentId) => {
  const scope = scopeStudentIds(user);
  if (scope === null) return;
  if (!scope.includes(String(studentId))) throw ApiError.forbidden('You can only access your own records');
};

/** GET /portal/dashboard */
export const dashboard = asyncHandler(async (req, res) => {
  const scope = scopeStudentIds(req.user);
  const studentId = scope?.[0];
  if (!studentId) return ok(res, { role: req.user.role, message: 'Use the admin dashboard' });

  const student = await Student.findById(studentId).lean();
  if (!student) throw ApiError.notFound('Student record not linked to this account');

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [attendance, latestResult, homework, invoices, notices] = await Promise.all([
    Attendance.aggregate([
      { $match: { student: student._id, date: { $gte: monthStart } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Result.findOne({ student: student._id, isPublished: true }).sort('-createdAt').lean(),
    Homework.find({ classLevel: student.classLevel, section: student.section, isPublished: true })
      .sort('-assignedOn').limit(5).lean(),
    FeeInvoice.find({ student: student._id, status: { $in: ['unpaid', 'partial'] } }).sort('dueDate').lean(),
    Notice.find({ isPublished: true, publishAt: { $lte: new Date() } }).sort('-publishAt').limit(5)
      .select('title slug category publishAt').lean(),
  ]);

  const present = attendance.find((a) => a._id === 'present')?.count || 0;
  const totalMarked = attendance.reduce((s, a) => s + a.count, 0);

  return ok(res, {
    student: {
      id: student._id, name: `${student.firstName} ${student.lastName || ''}`.trim(),
      admissionNo: student.admissionNo, classLevel: student.classLevel, section: student.section, photo: student.photo,
    },
    attendanceThisMonth: { present, totalMarked, percent: totalMarked ? Number(((present / totalMarked) * 100).toFixed(1)) : null },
    latestResult,
    homework,
    pendingInvoices: invoices,
    dues: invoices.reduce((s, i) => s + Math.max(0, i.totalAmount - i.amountPaid), 0),
    notices,
  });
});

/* ---------------- attendance ---------------- */

/** GET /portal/students/:studentId/attendance?from&to */
export const getAttendance = asyncHandler(async (req, res) => {
  assertAccess(req.user, req.params.studentId);
  const { from, to } = req.query;
  const filter = { student: req.params.studentId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const records = await Attendance.find(filter).sort('date').lean();
  const summary = records.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const workingDays = records.filter((r) => r.status !== 'holiday').length;
  return ok(res, {
    records,
    summary,
    percent: workingDays ? Number((((summary.present || 0) + (summary.late || 0)) / workingDays * 100).toFixed(2)) : null,
  });
});

/** POST /admin/attendance — bulk mark for a class. Idempotent per student+date. */
export const markAttendance = asyncHandler(async (req, res) => {
  const { classLevel, section, date, entries } = req.body;
  const day = new Date(date); day.setHours(0, 0, 0, 0);

  const ops = entries.map((e) => ({
    updateOne: {
      filter: { student: e.student, date: day },
      update: { $set: { ...e, classLevel, section, date: day, markedBy: req.user._id } },
      upsert: true,
    },
  }));
  const result = await Attendance.bulkWrite(ops, { ordered: false });
  await recordAudit(req, { action: 'attendance.mark', entity: 'Attendance', entityId: `${classLevel}-${section}-${date}` });
  return ok(res, { matched: result.matchedCount, upserted: result.upsertedCount, modified: result.modifiedCount }, 'Attendance saved');
});

/** GET /admin/attendance/register?classLevel&section&date */
export const attendanceRegister = asyncHandler(async (req, res) => {
  const { classLevel, section = 'A', date } = req.query;
  const day = new Date(date || Date.now()); day.setHours(0, 0, 0, 0);
  const students = await Student.find({ classLevel, section, status: 'active' })
    .sort('rollNo firstName').select('firstName lastName admissionNo rollNo photo').lean();
  const marks = await Attendance.find({ classLevel, section, date: day }).lean();
  const map = Object.fromEntries(marks.map((m) => [String(m.student), m]));
  return ok(res, students.map((s) => ({ ...s, attendance: map[String(s._id)] || null })));
});

/* ---------------- results ---------------- */

/** GET /portal/students/:studentId/results */
export const getResults = asyncHandler(async (req, res) => {
  assertAccess(req.user, req.params.studentId);
  const filter = { student: req.params.studentId, isPublished: true };
  if (req.query.session) filter.session = req.query.session;
  const items = await Result.find(filter).sort('-createdAt').lean();
  return ok(res, items);
});

/** POST /admin/results — create or update one student's exam result. */
export const upsertResult = asyncHandler(async (req, res) => {
  const { student, session, examType } = req.body;
  let doc = await Result.findOne({ student, session, examType });
  if (doc) Object.assign(doc, req.body);
  else doc = new Result(req.body);
  await doc.save();
  await recordAudit(req, { action: 'result.upsert', entity: 'Result', entityId: doc._id });
  return created(res, doc, 'Result saved');
});

/** PATCH /admin/results/publish — publish a whole exam for a class and notify parents. */
export const publishResults = asyncHandler(async (req, res) => {
  const { classLevel, section, session, examType } = req.body;
  const filter = { classLevel, session, examType, ...(section ? { section } : {}) };

  const results = await Result.find(filter).populate('student');
  await Result.updateMany(filter, { isPublished: true, publishedAt: new Date(), publishedBy: req.user._id });

  results.forEach((r) => { if (r.student) notifyResultPublished(r.student, r).catch(() => {}); });
  await recordAudit(req, { action: 'result.publish', entity: 'Result', entityId: `${classLevel}-${examType}` });
  return ok(res, { published: results.length }, `${results.length} result(s) published`);
});

/* ---------------- homework ---------------- */

export const listHomework = asyncHandler(async (req, res) => {
  const q = req.validatedQuery || req.query;
  const { page, limit, skip } = getPagination(q, { defaultLimit: 20 });
  const filter = { isPublished: true };

  const scope = scopeStudentIds(req.user);
  if (scope !== null) {
    const studentIds = scope;
    const students = await Student.find({ _id: { $in: studentIds } }).select('classLevel section').lean();
    filter.$or = students.map((s) => ({ classLevel: s.classLevel, section: s.section }));
  } else if (q.classLevel) {
    filter.classLevel = q.classLevel;
    if (q.section) filter.section = q.section;
  }

  const [items, total] = await Promise.all([
    Homework.find(filter).sort('-assignedOn').skip(skip).limit(limit).populate('assignedBy', 'name designation').lean(),
    Homework.countDocuments(filter),
  ]);
  return paginated(res, items, { page, limit, total });
});

export const createHomework = asyncHandler(async (req, res) => {
  const item = await Homework.create({ ...req.body, assignedBy: req.user.staff });
  return created(res, item, 'Homework assigned');
});

export const deleteHomework = asyncHandler(async (req, res) => {
  const item = await Homework.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Homework not found');
  return ok(res, null, 'Homework deleted');
});

/* ---------------- fees ---------------- */

/** GET /fees/structure — public fee transparency (CBSE mandatory disclosure). */
export const publicFeeStructure = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.session) filter.session = req.query.session;
  const items = await FeeStructure.find(filter).sort({ createdAt: 1 }).lean();
  return ok(res, items);
});

/** GET /portal/students/:studentId/invoices */
export const getInvoices = asyncHandler(async (req, res) => {
  assertAccess(req.user, req.params.studentId);
  const items = await FeeInvoice.find({ student: req.params.studentId })
    .sort('-dueDate').populate('payments', 'receiptNo amount status paidAt method').lean();
  return ok(res, items.map((i) => ({ ...i, balance: Math.max(0, i.totalAmount - i.amountPaid) })));
});

/** POST /admin/fees/invoices/generate — bulk-generate a period's invoices for a class. */
export const generateInvoices = asyncHandler(async (req, res) => {
  const { classLevel, session, period, dueDate } = req.body;
  const structure = await FeeStructure.findOne({ classLevel, session });
  if (!structure) throw ApiError.notFound(`No fee structure defined for ${classLevel} (${session})`);

  const students = await Student.find({ classLevel, session, status: 'active' }).lean();
  const lineItems = [
    { label: 'Tuition fee', amount: structure.tuitionFeeMonthly },
    ...(structure.transportFeeMonthly ? [{ label: 'Transport fee', amount: structure.transportFeeMonthly }] : []),
  ];
  const subTotal = lineItems.reduce((s, l) => s + l.amount, 0);

  const docs = [];
  for (const s of students) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await FeeInvoice.exists({ student: s._id, period, session });
    if (exists) continue;
    const items = s.transport?.opted ? lineItems : lineItems.filter((l) => l.label !== 'Transport fee');
    const total = items.reduce((sum, l) => sum + l.amount, 0);
    // eslint-disable-next-line no-await-in-loop
    docs.push(await FeeInvoice.create({
      student: s._id, session, period, lineItems: items, subTotal: total, totalAmount: total,
      dueDate, issuedBy: req.user._id,
    }));
  }
  await recordAudit(req, { action: 'fee.generate', entity: 'FeeInvoice', entityId: `${classLevel}-${period}` });
  return created(res, { generated: docs.length, skipped: students.length - docs.length, subTotal }, `${docs.length} invoice(s) generated`);
});
