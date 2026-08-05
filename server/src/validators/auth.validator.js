import { z } from 'zod';
import { email, indianMobile } from './common.validator.js';

const strongPassword = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email,
  phone: indianMobile.optional(),
  password: strongPassword,
  role: z.enum(['teacher', 'accountant', 'student', 'parent']).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: strongPassword,
});
