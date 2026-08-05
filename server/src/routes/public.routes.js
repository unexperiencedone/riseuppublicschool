import { Router } from 'express';
import * as content from '../controllers/content.controller.js';
import * as admission from '../controllers/admission.controller.js';
import * as portal from '../controllers/portal.controller.js';
import validate from '../middleware/validate.js';
import { publicFormLimiter } from '../middleware/rateLimiter.js';
import { uploadDocument } from '../middleware/upload.js';
import { listQuery, slugParam } from '../validators/common.validator.js';
import { enquirySchema } from '../validators/admission.validator.js';
import { contactSchema, testimonialSchema } from '../validators/content.validator.js';

const router = Router();

/* Site config & CMS pages */
router.get('/settings', content.getSettings);
router.get('/pages/:key', content.getPage);

/* Notices */
router.get('/notices', validate({ query: listQuery }), content.listNotices);
router.get('/notices/:slug', validate({ params: slugParam }), content.getNotice);

/* Events & academic calendar */
router.get('/events', validate({ query: listQuery }), content.listEvents);
router.get('/events/upcoming', content.upcomingEvents);
router.get('/events/:slug', validate({ params: slugParam }), content.getEvent);

/* Gallery */
router.get('/gallery', validate({ query: listQuery }), content.listAlbums);
router.get('/gallery/:slug', validate({ params: slugParam }), content.getAlbum);

/* Faculty */
router.get('/staff', content.listStaff);

/* Downloads & mandatory disclosure */
router.get('/downloads', content.listDownloads);

/* Fee transparency */
router.get('/fees/structure', portal.publicFeeStructure);

/* Testimonials */
router.get('/testimonials', content.listTestimonials);
router.post('/testimonials', publicFormLimiter, validate({ body: testimonialSchema }), content.submitTestimonial);

/* Admission enquiry + full application */
router.post('/admissions/enquiry', publicFormLimiter, validate({ body: enquirySchema }), admission.createEnquiry);
router.post('/admissions/apply', publicFormLimiter, uploadDocument.array('documents', 8), admission.createApplication);
router.get('/admissions/track/:applicationNo', admission.trackApplication);

/* Contact */
router.post('/contact', publicFormLimiter, validate({ body: contactSchema }), content.createContactMessage);

export default router;
