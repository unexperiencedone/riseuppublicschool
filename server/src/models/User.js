import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true, match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'] },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT, index: true },
    avatar: { url: String, publicId: String },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
    // Linkage to domain records
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },   // for role=student
    wards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],   // for role=parent
    refreshTokens: { type: [{ token: String, createdAt: { type: Date, default: Date.now } }], select: false, default: [] },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const { _id, name, email, phone, role, avatar, isActive, mustChangePassword, student, wards, lastLoginAt } = this;
  return { id: _id, name, email, phone, role, avatar, isActive, mustChangePassword, student, wards, lastLoginAt };
};

export default mongoose.model('User', userSchema);
