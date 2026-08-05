import { z } from 'zod';
import { objectId, classLevel } from './common.validator.js';
import { EXAM_TYPES, ATTENDANCE_STATUS } from '../utils/constants.js';

export const markAttendanceSchema = z.object({
  classLevel,
  section: z.string().default('A'),
  date: z.coerce.date(),
  entries: z.array(z.object({
    student: objectId,
    status: z.enum(ATTENDANCE_STATUS),
    remark: z.string().max(200).optional(),
  })).min(1),
});

export const upsertResultSchema = z.object({
  student: objectId,
  session: z.string().default('2026-27'),
  classLevel,
  section: z.string().optional(),
  examType: z.enum(EXAM_TYPES),
  examName: z.string().max(120).optional(),
  subjects: z.array(z.object({
    subject: z.string().min(1),
    maxMarks: z.coerce.number().min(1).default(100),
    obtainedMarks: z.coerce.number().min(0),
    remark: z.string().max(200).optional(),
  })).min(1),
  attendancePercent: z.coerce.number().min(0).max(100).optional(),
  classTeacherRemark: z.string().max(500).optional(),
  isPublished: z.coerce.boolean().default(false),
});

export const homeworkSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(3000).optional(),
  subject: z.string().min(1),
  classLevel,
  section: z.string().default('A'),
  dueDate: z.coerce.date().optional(),
});

export const createOrderSchema = z.object({
  invoiceId: objectId.optional(),
  admissionId: objectId.optional(),
  amount: z.coerce.number().min(1).max(500000),
  purpose: z.enum(['fee', 'admission_application', 'transport', 'other']).default('fee'),
  payerName: z.string().min(2).max(80),
  payerPhone: z.string().regex(/^[6-9]\d{9}$/),
  payerEmail: z.string().email().optional().or(z.literal('')),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature: z.string().min(3),
});
