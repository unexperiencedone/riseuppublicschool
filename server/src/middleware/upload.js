import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { nanoid } from 'nanoid';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const uploadRoot = path.resolve(process.cwd(), env.storage.dir);
fs.mkdirSync(uploadRoot, { recursive: true });

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
  storage: env.storage.driver === 'cloudinary' ? memory : disk,
  limits: { fileSize: env.storage.maxMb * 1024 * 1024, files: 20 },
  fileFilter: fileFilter(allowed),
});

export const uploadImage = makeUploader(IMAGE);
export const uploadDocument = makeUploader(new RegExp(`${IMAGE.source}|${DOC.source}`));
export const UPLOAD_ROOT = uploadRoot;
