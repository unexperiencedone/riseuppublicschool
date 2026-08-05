import mongoose from 'mongoose';
import { CLASS_LEVELS, STREAMS } from '../utils/constants.js';

const studentSchema = new mongoose.Schema(
  {
    admissionNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    rollNo: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bloodGroup: String,
    photo: { url: String, publicId: String },

    classLevel: { type: String, enum: CLASS_LEVELS, required: true, index: true },
    section: { type: String, default: 'A', uppercase: true, trim: true },
    stream: { type: String, enum: STREAMS, default: 'NA' },
    session: { type: String, required: true, default: '2026-27', index: true }, // academic year

    father: { name: String, occupation: String, phone: String, email: String },
    mother: { name: String, occupation: String, phone: String, email: String },
    guardian: { name: String, relation: String, phone: String },

    address: {
      line1: String, village: String, city: { type: String, default: 'Aurai' },
      district: { type: String, default: 'Sant Ravidas Nagar (Bhadohi)' },
      state: { type: String, default: 'Uttar Pradesh' }, pincode: { type: String, default: '221301' },
    },

    transport: { opted: { type: Boolean, default: false }, route: String, stop: String },
    house: { type: String, enum: ['Ganga', 'Yamuna', 'Saraswati', 'Narmada', 'NA'], default: 'NA' },

    aadhaarLast4: String,          // never store full Aadhaar
    apaarId: String,               // APAAR / ABC ID (NEP 2020)
    admissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'alumni', 'transferred', 'inactive'], default: 'active', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

studentSchema.virtual('fullName').get(function fullName() {
  return [this.firstName, this.lastName].filter(Boolean).join(' ');
});

studentSchema.index({ classLevel: 1, section: 1, session: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', admissionNo: 'text' });

export default mongoose.model('Student', studentSchema);
