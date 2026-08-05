import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { nanoid } from 'nanoid';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// Vercel/Lambda bundle root (/var/task) is read-only. This used to run
// unconditionally at import time and crashed every invocation before any
// route handler could execute.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const useLocalDisk = env.storage.driver === 'local' && !isServerless;

const uploadRoot = useLocalDisk
  ? path.resolve(process.cwd(), env.storage.dir)
  : path.join(os.tmpdir(), 'rups-uploads');   // /tmp is the only writable path

if (useLocalDisk) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const memory = multer.memoryStorage();
const disk = multer.diskStorage({
  destination(_req, _file, cb) { cb(null, uploadRoot); },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  },
});

const IMAGE = /^image\/(jpeg|jpg|png|webp|avif)$/;
const DOC = /^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

const fileFilter = (allowed) => (_req, file, cb) => {
  if (allowed.test(file.mimetype)) return cb(null, true);
  return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
};

const makeUploader = (allowed) => multer({
  storage: useLocalDisk ? disk : memory,
  limits: { fileSize: env.storage.maxMb * 1024 * 1024, files: 20 },
  fileFilter: fileFilter(allowed),
});

export const uploadImage = makeUploader(IMAGE);
export const uploadDocument = makeUploader(new RegExp(`${IMAGE.source}|${DOC.source}`));
export const UPLOAD_ROOT = uploadRoot;
export const USE_LOCAL_DISK = useLocalDisk;

/**
 * Wraps a multer middleware so it only runs for multipart requests. JSON
 * requests (already-uploaded Cloudinary descriptors — see
 * docs/ARCHITECTURE.md § Serverless considerations) skip multer entirely and
 * fall through to the controller, which reads the descriptor(s) from
 * req.body instead of req.file(s). This keeps one route per resource instead
 * of doubling the route table for local-dev-multipart vs. direct-upload-JSON.
 */
export const conditionalUpload = (multerMiddleware) => (req, res, next) => {
  if (req.is('application/json')) return next();
  return multerMiddleware(req, res, next);
};
