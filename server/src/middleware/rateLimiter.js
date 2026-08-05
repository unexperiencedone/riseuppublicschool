import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
};

export const apiLimiter = rateLimit({
  ...base,
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.max,
});

/** Tight limit for unauthenticated public forms (enquiry, contact). */
export const publicFormLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  max: env.rateLimit.publicFormMax,
  message: { success: false, message: 'Too many submissions from this device. Please try again after an hour.', code: 'RATE_LIMITED' },
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' },
});
