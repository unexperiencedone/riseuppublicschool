import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { Payment, FeeInvoice, Admission } from '../models/index.js';
import { createOrder, verifyCheckoutSignature, verifyWebhookSignature, fetchPayment, refund } from '../services/payment.service.js';
import { notifyPaymentSuccess } from '../services/notification.service.js';
import recordAudit from '../middleware/audit.js';

/** POST /payments/order — step 1: create a gateway order and a local 'created' Payment. */
export const initiatePayment = asyncHandler(async (req, res) => {
  const { invoiceId, admissionId, amount, purpose, payerName, payerPhone, payerEmail } = req.body;

  let invoice = null;
  if (invoiceId) {
    invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    if (invoice.status === 'paid') throw ApiError.conflict('This invoice is already paid');
    const balance = invoice.totalAmount - invoice.amountPaid;
    if (amount > balance) throw ApiError.badRequest(`Amount exceeds the outstanding balance of ₹${balance}`);
  }

  const payment = await Payment.create({
    purpose, amount, invoice: invoiceId, admission: admissionId,
    student: invoice?.student, payerName, payerPhone, payerEmail,
    gateway: env.payments.driver === 'razorpay' ? 'razorpay' : 'mock',
    status: 'created',
  });

  const order = await createOrder({
    amount,
    receipt: payment.receiptNo,
    notes: { paymentId: String(payment._id), purpose, invoiceId: invoiceId || '', school: 'Rise UP Public School' },
  });

  payment.gatewayOrderId = order.id;
  await payment.save();

  return created(res, {
    paymentId: payment._id,
    receiptNo: payment.receiptNo,
    order: { id: order.id, amount: order.amount, currency: order.currency },
    keyId: env.payments.keyId || 'rzp_test_mock',
    prefill: { name: payerName, contact: payerPhone, email: payerEmail },
  }, 'Order created');
});

/** POST /payments/verify — step 2: browser callback. Signature-verified, then reconciled. */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;

  const isValid = verifyCheckoutSignature({ orderId, paymentId, signature });
  if (!isValid) throw ApiError.badRequest('Payment signature verification failed');

  const payment = await Payment.findOne({ gatewayOrderId: orderId });
  if (!payment) throw ApiError.notFound('Payment record not found');
  if (payment.status === 'paid') return ok(res, payment, 'Payment already recorded');

  const gwPayment = await fetchPayment(paymentId);
  await settlePayment(payment, { paymentId, signature, method: gwPayment.method });

  return ok(res, { receiptNo: payment.receiptNo, status: payment.status, amount: payment.amount }, 'Payment successful');
});

/** POST /payments/webhook — source of truth. Raw body + HMAC verified. Idempotent. */
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.get('x-razorpay-signature');
  if (!verifyWebhookSignature(req.rawBody, signature)) {
    logger.warn('Rejected Razorpay webhook: bad signature');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;
  const entity = event?.payload?.payment?.entity;
  logger.info(`Razorpay webhook: ${event.event}`);

  if (entity) {
    const payment = await Payment.findOne({ gatewayOrderId: entity.order_id });
    if (payment) {
      if (event.event === 'payment.captured' && payment.status !== 'paid') {
        await settlePayment(payment, { paymentId: entity.id, method: entity.method, raw: event });
      } else if (event.event === 'payment.failed') {
        payment.status = 'failed';
        payment.failureReason = entity.error_description;
        payment.rawWebhookEvent = event;
        await payment.save();
      }
    }
  }
  // Always 200 quickly — Razorpay retries on non-2xx.
  return res.status(200).json({ success: true });
});

/** Shared settlement: marks paid, reconciles the invoice, fires notifications. */
async function settlePayment(payment, { paymentId, signature, method, raw }) {
  payment.status = 'paid';
  payment.gatewayPaymentId = paymentId;
  if (signature) payment.gatewaySignature = signature;
  payment.method = method;
  payment.paidAt = new Date();
  if (raw) payment.rawWebhookEvent = raw;
  await payment.save();

  if (payment.invoice) {
    const invoice = await FeeInvoice.findById(payment.invoice);
    if (invoice) {
      invoice.amountPaid += payment.amount;
      invoice.payments.push(payment._id);
      invoice.status = invoice.amountPaid >= invoice.totalAmount ? 'paid' : 'partial';
      await invoice.save();
    }
  }
  if (payment.admission) {
    await Admission.findByIdAndUpdate(payment.admission, { 'applicationFee.payment': payment._id });
  }
  notifyPaymentSuccess(payment).catch(() => {});
}

/** GET /payments/:receiptNo */
export const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ receiptNo: decodeURIComponent(req.params.receiptNo) })
    .populate('student', 'firstName lastName admissionNo classLevel section')
    .populate('invoice', 'invoiceNo period totalAmount').lean();
  if (!payment) throw ApiError.notFound('Receipt not found');
  return ok(res, payment);
});

/** GET /admin/payments */
export const listPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.purpose) filter.purpose = req.query.purpose;
  const items = await Payment.find(filter).sort('-createdAt').limit(200)
    .populate('student', 'firstName lastName admissionNo classLevel').lean();
  const totalCollected = items.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  return ok(res, { items, totalCollected });
});

/** POST /admin/payments/:id/refund */
export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'paid') throw ApiError.badRequest('Only captured payments can be refunded');

  const amount = req.body.amount || payment.amount;
  const result = await refund(payment.gatewayPaymentId, amount, req.body.reason);
  payment.status = 'refunded';
  payment.refund = { amount, refundId: result.id, at: new Date(), reason: req.body.reason };
  await payment.save();

  await recordAudit(req, { action: 'payment.refund', entity: 'Payment', entityId: payment._id, after: payment.refund });
  return ok(res, payment, 'Refund initiated');
});
