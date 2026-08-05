import { z } from 'zod';
import { classLevel, indianMobile, pincode } from './common.validator.js';

export const enquirySchema = z.object({
  student: z.object({
    firstName: z.string().min(2, 'Student name is required').max(60),
    lastName: z.string().max(60).optional(),
    dob: z.coerce.date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    classApplyingFor: classLevel,
    stream: z.enum(['Science', 'Commerce', 'Arts', 'NA']).default('NA'),
    previousSchool: z.string().max(160).optional(),
  }),
  parent: z.object({
    guardianName: z.string().min(2, "Parent/guardian name is required").max(80),
    relation: z.string().max(30).default('Father'),
    phone: indianMobile,
    altPhone: indianMobile.optional(),
    email: z.string().email().optional().or(z.literal('')),
    occupation: z.string().max(80).optional(),
  }),
  address: z.object({
    line1: z.string().max(200).optional(),
    village: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    district: z.string().max(80).optional(),
    state: z.string().max(80).default('Uttar Pradesh'),
    pincode: pincode.optional(),
  }).optional(),
  message: z.string().max(1000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy consent to continue' }) }),
  // honeypot — must stay empty; bots fill it
  website: z.string().max(0).optional(),
});

export const updateAdmissionStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'documents_pending', 'shortlisted', 'admitted', 'rejected', 'withdrawn']),
  note: z.string().max(500).optional(),
  followUpAt: z.coerce.date().optional(),
});
