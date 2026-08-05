import { z } from 'zod';
import { NOTICE_CATEGORIES, EVENT_CATEGORIES } from '../utils/constants.js';
import { fileDescriptorSchema } from './common.validator.js';

export const noticeSchema = z.object({
  title: z.string().min(4).max(200),
  body: z.string().min(4),
  excerpt: z.string().max(300).optional(),
  category: z.enum(NOTICE_CATEGORIES).default('general'),
  audience: z.array(z.enum(['all', 'students', 'parents', 'staff'])).default(['all']),
  classLevels: z.array(z.string()).optional(),
  pinned: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
  publishAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  // JSON-body variant only — ignored for multipart requests (files arrive via req.files instead).
  attachments: z.array(fileDescriptorSchema).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(4000).optional(),
  category: z.enum(EVENT_CATEGORIES).default('academic'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  allDay: z.coerce.boolean().default(true),
  venue: z.string().max(160).optional(),
  session: z.string().optional(),
  isHoliday: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
  // JSON-body variant only.
  cover: fileDescriptorSchema.optional(),
});

export const albumSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional(),
  category: z.enum(['campus', 'academics', 'cultural', 'sports', 'celebration', 'trip', 'ceremony', 'other']).default('other'),
  eventDate: z.coerce.date().optional(),
  isPublished: z.coerce.boolean().default(true),
  displayOrder: z.coerce.number().default(100),
  // JSON-body variant only.
  photos: z.array(fileDescriptorSchema).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  subject: z.string().max(160).default('General enquiry'),
  message: z.string().min(10, 'Please write at least 10 characters').max(2000),
  category: z.enum(['admission', 'academic', 'transport', 'fee', 'complaint', 'career', 'general']).default('general'),
  website: z.string().max(0).optional(),   // honeypot
});

export const staffSchema = z.object({
  name: z.string().min(2).max(120),
  designation: z.string().min(2).max(120),
  department: z.enum(['management', 'administration', 'primary', 'middle', 'secondary', 'senior_secondary', 'sports', 'arts', 'support']).default('administration'),
  category: z.enum(['teaching', 'non_teaching', 'management']).default('teaching'),
  qualifications: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
  experienceYears: z.coerce.number().min(0).max(60).default(0),
  adminExperienceYears: z.coerce.number().min(0).max(60).default(0),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().max(1500).optional(),
  displayOrder: z.coerce.number().default(100),
  showOnWebsite: z.coerce.boolean().default(true),
  // JSON-body variant only.
  photo: fileDescriptorSchema.optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.string().max(40).default('Parent'),
  relation: z.string().max(120).optional(),
  message: z.string().min(20).max(800),
  rating: z.coerce.number().min(1).max(5).default(5),
});
