import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true, index: true },
    purpose: { type: String, enum: ['fee', 'admission_application', 'transport', 'other'], default: 'fee', index: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeInvoice' },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
    payerName: String,
    payerPhone: String,
    payerEmail: String,

    amount: { type: Number, required: true },              // in rupees
    currency: { type: String, default: 'INR' },
    gateway: { type: String, enum: ['razorpay', 'cash', 'cheque', 'upi_manual', 'mock'], default: 'razorpay' },

    gatewayOrderId: { type: String, index: true },         // razorpay order_xxx
    gatewayPaymentId: { type: String, index: true },       // razorpay pay_xxx
    gatewaySignature: String,
    method: String,                                        // upi / card / netbanking

    status: { type: String, enum: PAYMENT_STATUS, default: 'created', index: true },
    paidAt: Date,
    failureReason: String,
    refund: { amount: Number, refundId: String, at: Date, reason: String },
    rawWebhookEvent: { type: mongoose.Schema.Types.Mixed, select: false },
    idempotencyKey: { type: String, index: true, sparse: true },
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function genReceiptNo(next) {
  if (this.receiptNo) return next();
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments({});
  this.receiptNo = `RCPT/${year}/${String(count + 1).padStart(6, '0')}`;
  return next();
});

export default mongoose.model('Payment', paymentSchema);
