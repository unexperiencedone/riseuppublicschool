import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import env from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

let razorpay = null;
async function getRazorpay() {
  if (razorpay) return razorpay;
  const { default: Razorpay } = await import('razorpay');
  razorpay = new Razorpay({ key_id: env.payments.keyId, key_secret: env.payments.keySecret });
  return razorpay;
}

/** Creates a gateway order. Amount is in RUPEES; Razorpay wants paise. */
export async function createOrder({ amount, receipt, notes = {} }) {
  if (env.payments.driver !== 'razorpay') {
    return { id: `order_mock_${nanoid(12)}`, amount: amount * 100, currency: 'INR', receipt, status: 'created', mock: true };
  }
  const rp = await getRazorpay();
  return rp.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt, notes, payment_capture: 1 });
}

/** Verifies the checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  if (env.payments.driver !== 'razorpay') return true;
  const expected = crypto
    .createHmac('sha256', env.payments.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)));
}

/** Verifies the webhook signature over the RAW request body. */
export function verifyWebhookSignature(rawBody, signature) {
  if (env.payments.driver !== 'razorpay') return true;
  const expected = crypto.createHmac('sha256', env.payments.webhookSecret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)));
  } catch {
    return false;
  }
}

export async function fetchPayment(paymentId) {
  if (env.payments.driver !== 'razorpay') return { id: paymentId, status: 'captured', method: 'upi', mock: true };
  const rp = await getRazorpay();
  return rp.payments.fetch(paymentId);
}

export async function refund(paymentId, amount, reason = 'requested_by_customer') {
  if (env.payments.driver !== 'razorpay') return { id: `rfnd_mock_${nanoid(10)}`, amount: amount * 100, status: 'processed' };
  const rp = await getRazorpay();
  try {
    return await rp.payments.refund(paymentId, { amount: Math.round(amount * 100), notes: { reason } });
  } catch (err) {
    logger.error(`Refund failed for ${paymentId}: ${err.message}`);
    throw ApiError.badRequest(`Refund failed: ${err.message}`);
  }
}
