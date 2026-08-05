import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../utils/constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classLevel: { type: String, required: true },
    section: { type: String, default: 'A' },
    session: { type: String, default: '2026-27', index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    remark: String,
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ classLevel: 1, section: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
