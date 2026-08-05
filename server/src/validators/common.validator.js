import { z } from 'zod';
import { CLASS_LEVELS } from '../utils/constants.js';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
export const pincode = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code');
export const email = z.string().email('Enter a valid email address');
export const classLevel = z.enum(CLASS_LEVELS);
export const session = z.string().regex(/^\d{4}-\d{2}$/, 'Session must look like 2026-27');

export const idParam = z.object({ id: objectId });
export const slugParam = z.object({ slug: z.string().min(1) });

/**
 * Shape of a file already uploaded straight from the browser to Cloudinary
 * (see web/lib/upload.js). Used to validate the JSON-body upload variants —
 * see docs/ARCHITECTURE.md § Serverless considerations for why those exist.
 */
export const fileDescriptorSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  mime: z.string().optional(),
  sizeKb: z.coerce.number().nonnegative().optional(),
  width: z.coerce.number().nonnegative().optional(),
  height: z.coerce.number().nonnegative().optional(),
  name: z.string().optional(),
});

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
  search: z.string().trim().max(120).optional(),
  category: z.string().optional(),
  session: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).passthrough();
