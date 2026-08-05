import mongoose from 'mongoose';
import { EXAM_TYPES } from '../utils/constants.js';

const subjectMarkSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    maxMarks: { type: Number, default: 100 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    grade: String,
    remark: String,
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    session: { type: String, default: '2026-27', index: true },
    classLevel: { type: String, required: true },
    section: String,
    examType: { type: String, enum: EXAM_TYPES, required: true, index: true },
    examName: String,
    subjects: { type: [subjectMarkSchema], default: [] },
    totalMax: Number,
    totalObtained: Number,
    percentage: Number,
    grade: String,
    rank: Number,
    attendancePercent: Number,
    classTeacherRemark: String,
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, session: 1, examType: 1 }, { unique: true });

resultSchema.pre('save', function computeTotals(next) {
  if (this.subjects?.length) {
    this.totalMax = this.subjects.reduce((s, x) => s + (x.maxMarks || 0), 0);
    this.totalObtained = this.subjects.reduce((s, x) => s + (x.obtainedMarks || 0), 0);
    this.percentage = this.totalMax ? Number(((this.totalObtained / this.totalMax) * 100).toFixed(2)) : 0;
    this.grade = gradeFor(this.percentage);
  }
  next();
});

function gradeFor(p) {
  if (p >= 91) return 'A1';
  if (p >= 81) return 'A2';
  if (p >= 71) return 'B1';
  if (p >= 61) return 'B2';
  if (p >= 51) return 'C1';
  if (p >= 41) return 'C2';
  if (p >= 33) return 'D';
  return 'E';
}

export default mongoose.model('Result', resultSchema);
