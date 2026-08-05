import mongoose from 'mongoose';
import { NOTICE_CATEGORIES } from '../utils/constants.js';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    body: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    category: { type: String, enum: NOTICE_CATEGORIES, default: 'general', index: true },
    audience: { type: [String], enum: ['all', 'students', 'parents', 'staff'], default: ['all'] },
    classLevels: [String],                          // empty = all classes
    attachments: [{ name: String, url: String, publicId: String, mime: String, sizeKb: Number }],
    pinned: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    publishAt: { type: Date, default: Date.now, index: true },
    expiresAt: Date,
    views: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

noticeSchema.index({ isPublished: 1, publishAt: -1 });
noticeSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('Notice', noticeSchema);
