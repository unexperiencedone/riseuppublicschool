import mongoose from 'mongoose';
import { ADMISSION_STATUS, CLASS_LEVELS, STREAMS } from '../utils/constants.js';

/** Covers BOTH the lightweight enquiry and the full online application. */
const admissionSchema = new mongoose.Schema(
  {
    applicationNo: { type: String, unique: true, index: true },       // RUPS/2026/000123
    type: { type: String, enum: ['enquiry', 'application'], default: 'enquiry', index: true },
    session: { type: String, default: '2026-27', index: true },

    student: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, trim: true },
      dob: Date,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      classApplyingFor: { type: String, enum: CLASS_LEVELS, required: true, index: true },
      stream: { type: String, enum: STREAMS, default: 'NA' },
      previousSchool: String,
      previousClassPassed: String,
      previousPercentage: Number,
    },

    parent: {
      fatherName: String,
      motherName: String,
      guardianName: { type: String, required: true, trim: true },
      relation: { type: String, default: 'Father' },
      phone: { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'] },
      altPhone: String,
      email: { type: String, lowercase: true, trim: true },
      occupation: String,
    },

    address: { line1: String, village: String, city: String, district: String, state: { type: String, default: 'Uttar Pradesh' }, pincode: String },

    documents: [{
      type: { type: String, enum: ['birth_certificate', 'transfer_certificate', 'report_card', 'aadhaar', 'photo', 'caste_certificate', 'other'] },
      name: String, url: String, publicId: String, uploadedAt: { type: Date, default: Date.now },
    }],

    message: { type: String, maxlength: 1000 },
    source: { type: String, enum: ['website', 'walk_in', 'phone', 'referral', 'social_media'], default: 'website' },

    status: { type: String, enum: ADMISSION_STATUS, default: 'new', index: true },
    statusHistory: [{ status: String, note: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
    followUpAt: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internalNotes: String,

    // Application fee (optional, when online payment enabled)
    applicationFee: {
      required: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    },

    consent: { type: Boolean, default: false },   // DPDP Act 2023 consent capture
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

admissionSchema.index({ createdAt: -1 });
admissionSchema.index({ 'parent.phone': 1 });

admissionSchema.pre('save', async function genApplicationNo(next) {
  if (this.applicationNo) return next();
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
  this.applicationNo = `RUPS/${year}/${String(count + 1).padStart(5, '0')}`;
  return next();
});

export default mongoose.model('Admission', admissionSchema);
