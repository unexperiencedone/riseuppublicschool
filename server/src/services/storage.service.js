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
async function getCloudinary() {
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
