import mongoose from 'mongoose';
import { CLASS_LEVELS } from '../utils/constants.js';

const feeStructureSchema = new mongoose.Schema(
  {
    session: { type: String, default: '2026-27', index: true },
    classLevel: { type: String, enum: CLASS_LEVELS, required: true },
    admissionFee: { type: Number, default: 0 },
    tuitionFeeMonthly: { type: Number, default: 0 },
    examFeePerTerm: { type: Number, default: 0 },
    transportFeeMonthly: { type: Number, default: 0 },
    otherCharges: [{ label: String, amount: Number, frequency: { type: String, enum: ['one_time', 'monthly', 'quarterly', 'annual'], default: 'annual' } }],
    currency: { type: String, default: 'INR' },
    effectiveFrom: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true },
    notes: String,
  },
  { timestamps: true }
);

feeStructureSchema.index({ session: 1, classLevel: 1 }, { unique: true });

export default mongoose.model('FeeStructure', feeStructureSchema);
