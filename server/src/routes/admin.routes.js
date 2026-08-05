import { Router } from 'express';
import * as content from '../controllers/content.controller.js';
import * as admission from '../controllers/admission.controller.js';
import * as portal from '../controllers/portal.controller.js';
import * as student from '../controllers/student.controller.js';
import * as payment from '../controllers/payment.controller.js';
import { adminDashboard } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';
import { ROLES, CMS_ROLES } from '../utils/constants.js';
import { listQuery, idParam } from '../validators/common.validator.js';
import { noticeSchema, eventSchema, albumSchema, staffSchema } from '../validators/content.validator.js';
import { updateAdmissionStatusSchema } from '../validators/admission.validator.js';
import { markAttendanceSchema, upsertResultSchema, homeworkSchema } from '../validators/portal.validator.js';

const router = Router();
router.use(requireAuth);

const cms = requireRole(CMS_ROLES);
const staffOnly = requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER]);
const finance = requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT]);

/* Dashboard */
router.get('/dashboard', cms, adminDashboard);

/* Notices */
router.post('/notices', cms, uploadDocument.array('attachments', 5), validate({ body: noticeSchema }), content.createNotice);
router.patch('/notices/:id', cms, uploadDocument.array('attachments', 5), validate({ params: idParam }), content.updateNotice);
router.delete('/notices/:id', cms, validate({ params: idParam }), content.deleteNotice);

/* Events */
router.post('/events', cms, uploadImage.single('cover'), validate({ body: eventSchema }), content.createEvent);
router.patch('/events/:id', cms, uploadImage.single('cover'), validate({ params: idParam }), content.updateEvent);
router.delete('/events/:id', cms, validate({ params: idParam }), content.deleteEvent);

/* Gallery */
router.post('/gallery', cms, uploadImage.array('photos', 20), validate({ body: albumSchema }), content.createAlbum);
router.post('/gallery/:id/photos', cms, uploadImage.array('photos', 20), validate({ params: idParam }), content.addAlbumPhotos);
router.delete('/gallery/:id/photos/:photoId', cms, content.deleteAlbumPhoto);
router.delete('/gallery/:id', cms, validate({ params: idParam }), content.deleteAlbum);

/* Staff */
router.post('/staff', cms, uploadImage.single('photo'), validate({ body: staffSchema }), content.createStaff);
router.patch('/staff/:id', cms, uploadImage.single('photo'), validate({ params: idParam }), content.updateStaff);
router.delete('/staff/:id', cms, validate({ params: idParam }), content.deleteStaff);

/* Pages, downloads, testimonials, settings */
router.put('/pages/:key', cms, content.upsertPage);
router.post('/downloads', cms, uploadDocument.single('file'), content.createDownload);
router.delete('/downloads/:id', cms, validate({ params: idParam }), content.deleteDownload);
router.patch('/testimonials/:id', cms, validate({ params: idParam }), content.moderateTestimonial);
router.patch('/settings', requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]), content.updateSettings);

/* Admissions CRM */
router.get('/admissions', cms, validate({ query: listQuery }), admission.listAdmissions);
router.get('/admissions/stats', cms, admission.admissionStats);
router.get('/admissions/:id', cms, validate({ params: idParam }), admission.getAdmission);
router.patch('/admissions/:id/status', cms, validate({ params: idParam, body: updateAdmissionStatusSchema }), admission.updateAdmissionStatus);
router.delete('/admissions/:id', requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]), validate({ params: idParam }), admission.deleteAdmission);

/* Contact inbox */
router.get('/messages', cms, validate({ query: listQuery }), content.listContactMessages);
router.patch('/messages/:id', cms, validate({ params: idParam }), content.updateContactMessage);

/* Students */
router.get('/students', staffOnly, validate({ query: listQuery }), student.listStudents);
router.get('/students/:id', staffOnly, validate({ params: idParam }), student.getStudent);
router.post('/students', cms, uploadImage.single('photo'), student.createStudent);
router.patch('/students/:id', cms, uploadImage.single('photo'), validate({ params: idParam }), student.updateStudent);
router.delete('/students/:id', requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]), validate({ params: idParam }), student.deleteStudent);
router.post('/students/:id/portal-access', cms, validate({ params: idParam }), student.grantPortalAccess);
router.post('/students/from-admission/:admissionId', cms, student.enrolFromAdmission);

/* Attendance */
router.get('/attendance/register', staffOnly, portal.attendanceRegister);
router.post('/attendance', staffOnly, validate({ body: markAttendanceSchema }), portal.markAttendance);

/* Results */
router.post('/results', staffOnly, validate({ body: upsertResultSchema }), portal.upsertResult);
router.patch('/results/publish', cms, portal.publishResults);

/* Homework */
router.post('/homework', staffOnly, validate({ body: homeworkSchema }), portal.createHomework);
router.delete('/homework/:id', staffOnly, validate({ params: idParam }), portal.deleteHomework);

/* Fees & payments */
router.post('/fees/invoices/generate', finance, portal.generateInvoices);
router.get('/payments', finance, payment.listPayments);
router.post('/payments/:id/refund', requireRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]), validate({ params: idParam }), payment.refundPayment);

export default router;
