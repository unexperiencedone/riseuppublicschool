import mongoose from 'mongoose';
import { EVENT_CATEGORIES } from '../utils/constants.js';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    category: { type: String, enum: EVENT_CATEGORIES, default: 'academic', index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: Date,
    allDay: { type: Boolean, default: true },
    venue: { type: String, default: 'School Campus' },
    session: { type: String, default: '2026-27', index: true },
    isHoliday: { type: Boolean, default: false },
    cover: { url: String, publicId: String },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

eventSchema.index({ session: 1, startDate: 1 });

export default mongoose.model('Event', eventSchema);
