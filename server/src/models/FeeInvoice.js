import mongoose from 'mongoose';

const feeInvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    session: { type: String, default: '2026-27', index: true },
    period: { type: String, required: true },              // "2026-04" or "Q1-2026"
    lineItems: [{ label: String, amount: Number }],
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    dueDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ['unpaid', 'partial', 'paid', 'waived', 'cancelled'], default: 'unpaid', index: true },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

feeInvoiceSchema.virtual('balance').get(function bal() { return Math.max(0, this.totalAmount - this.amountPaid); });

feeInvoiceSchema.pre('save', async function genInvoiceNo(next) {
  if (this.invoiceNo) return next();
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments({});
  this.invoiceNo = `INV/${year}/${String(count + 1).padStart(6, '0')}`;
  return next();
});

export default mongoose.model('FeeInvoice', feeInvoiceSchema);
