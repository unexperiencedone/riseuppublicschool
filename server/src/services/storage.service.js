import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Storage abstraction.
 *  - driver=local      → files served from /uploads by express.static
 *  - driver=cloudinary → streams buffer to Cloudinary, returns secure_url + public_id
 * Swapping drivers requires no controller changes.
 */
let cloudinary = null;
export async function getCloudinary() {
  if (cloudinary) return cloudinary;
  const mod = await import('cloudinary');
  cloudinary = mod.v2;
  cloudinary.config({
    cloud_name: env.storage.cloudinary.cloudName,
    api_key: env.storage.cloudinary.apiKey,
    api_secret: env.storage.cloudinary.apiSecret,
    secure: true,
  });
  return cloudinary;
}

export async function saveFile(file, folder = 'misc') {
  if (!file) return null;

  if (env.storage.driver === 'cloudinary') {
    const cld = await getCloudinary();
    const b64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const res = await cld.uploader.upload(b64, {
      folder: `${env.storage.cloudinary.folder}/${folder}`,
      resource_type: 'auto',
    });
    return {
      url: res.secure_url, publicId: res.public_id, mime: file.mimetype,
      sizeKb: Math.round(res.bytes / 1024), width: res.width, height: res.height, name: file.originalname,
    };
  }

  // local driver — multer already wrote the file to disk
  return {
    url: `/uploads/${file.filename}`,
    publicId: file.filename,
    mime: file.mimetype,
    sizeKb: Math.round(file.size / 1024),
    name: file.originalname,
  };
}

export async function saveMany(files = [], folder = 'misc') {
  return Promise.all(files.map((f) => saveFile(f, folder)));
}

const IMAGE_FORMATS = 'jpg,jpeg,png,webp,avif';
const DOCUMENT_FORMATS = `${IMAGE_FORMATS},pdf,doc,docx`;
const DOCUMENT_FOLDERS = new Set(['notices', 'downloads', 'admissions']);

/**
 * Signed-upload payload for direct browser → Cloudinary uploads (see
 * web/lib/upload.js). We sign server-side with CLOUDINARY_API_SECRET — the
 * secret never reaches the client — and `folder` + `allowed_formats` are
 * baked into the signature, so a caller cannot redirect the upload to a
 * different folder or a different file type after the fact (this replaces
 * the MIME allowlist multer used to enforce for the multipart path).
 *
 * NOT covered here: a per-file size cap. Cloudinary's plain signed-upload
 * endpoint has no signable "max bytes" parameter the way an upload preset
 * does — enforcing one requires setting a file-size limit on the Cloudinary
 * account/product-environment itself (Settings → Upload). Do that before
 * relying on this path in production; see docs/ARCHITECTURE.md § Serverless considerations.
 */
export async function createUploadSignature(folder) {
  const cld = await getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `${env.storage.cloudinary.folder}/${folder}`;
  const allowedFormats = DOCUMENT_FOLDERS.has(folder) ? DOCUMENT_FORMATS : IMAGE_FORMATS;
  const signature = cld.utils.api_sign_request(
    { timestamp, folder: fullFolder, allowed_formats: allowedFormats },
    env.storage.cloudinary.apiSecret
  );
  return {
    timestamp,
    signature,
    apiKey: env.storage.cloudinary.apiKey,
    cloudName: env.storage.cloudinary.cloudName,
    folder: fullFolder,
    allowedFormats,
  };
}

export async function deleteFile(publicId) {
  if (!publicId) return;
  try {
    if (env.storage.driver === 'cloudinary') {
      const cld = await getCloudinary();
      await cld.uploader.destroy(publicId);
    } else {
      await fs.unlink(path.resolve(process.cwd(), env.storage.dir, publicId));
    }
  } catch (err) {
    logger.warn(`deleteFile(${publicId}) failed: ${err.message}`);
  }
}
