import mongoose from 'mongoose';
import { CLASS_LEVELS, STREAMS } from '../utils/constants.js';

const classSchema = new mongoose.Schema(
  {
    level: { type: String, enum: CLASS_LEVELS, required: true },
    section: { type: String, default: 'A', uppercase: true },
    stream: { type: String, enum: STREAMS, default: 'NA' },
    session: { type: String, default: '2026-27', index: true },
    stage: { type: String, enum: ['pre_primary', 'primary', 'middle', 'secondary', 'senior_secondary'], required: true, index: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    subjects: [{ name: String, code: String, teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' } }],
    capacity: { type: Number, default: 40 },
    room: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.index({ level: 1, section: 1, session: 1 }, { unique: true });

export default mongoose.model('AcademicClass', classSchema);
