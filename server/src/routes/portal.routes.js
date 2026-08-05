import { Router } from 'express';
import * as portal from '../controllers/portal.controller.js';
import * as payment from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { listQuery, idParam } from '../validators/common.validator.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/portal.validator.js';

const router = Router();
router.use(requireAuth);   // every route below needs a signed-in user

router.get('/dashboard', portal.dashboard);
router.get('/students/:studentId/attendance', portal.getAttendance);
router.get('/students/:studentId/results', portal.getResults);
router.get('/students/:studentId/invoices', portal.getInvoices);
router.get('/homework', validate({ query: listQuery }), portal.listHomework);

/* Online payments */
router.post('/payments/order', validate({ body: createOrderSchema }), payment.initiatePayment);
router.post('/payments/verify', validate({ body: verifyPaymentSchema }), payment.verifyPayment);
router.get('/payments/:receiptNo', payment.getReceipt);

export default router;
