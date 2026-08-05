import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { Student, Staff, Admission, Notice, Event, Payment, FeeInvoice, ContactMessage, GalleryAlbum } from '../models/index.js';

/** GET /admin/dashboard — one round-trip for the whole admin home screen. */
export const adminDashboard = asyncHandler(async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    students, staff, newEnquiries, totalEnquiries, notices, upcoming,
    collection, outstanding, unreadMessages, albums, byClass,
  ] = await Promise.all([
    Student.countDocuments({ status: 'active' }),
    Staff.countDocuments({ isActive: true }),
    Admission.countDocuments({ status: 'new' }),
    Admission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Notice.countDocuments({ isPublished: true }),
    Event.find({ isPublished: true, startDate: { $gte: new Date() } }).sort('startDate').limit(5).lean(),
    Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    FeeInvoice.aggregate([
      { $match: { status: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } }, count: { $sum: 1 } } },
    ]),
    ContactMessage.countDocuments({ status: 'new' }),
    GalleryAlbum.countDocuments({ isPublished: true }),
    Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$classLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return ok(res, {
    counters: {
      students, staff, newEnquiries, enquiriesLast30Days: totalEnquiries,
      notices, albums, unreadMessages,
      collectedLast30Days: collection[0]?.total || 0,
      paymentsLast30Days: collection[0]?.count || 0,
      outstandingFees: outstanding[0]?.total || 0,
      outstandingInvoices: outstanding[0]?.count || 0,
    },
    upcomingEvents: upcoming,
    studentsByClass: byClass,
  });
});
