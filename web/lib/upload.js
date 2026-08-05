import { API_URL } from './config';

/**
 * Direct browser → Cloudinary upload. Vercel's Node runtime caps request
 * bodies at 4.5 MB, well under what an album photo or a scanned document
 * needs, so files never pass through our API at all — only a short-lived
 * signature does. See docs/ARCHITECTURE.md § Serverless considerations.
 */
async function getSignature({ folder, token } = {}) {
  const isAdmin = Boolean(token);
  const path = isAdmin ? '/admin/uploads/signature' : '/admissions/upload-signature';
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(isAdmin && folder ? { folder } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Could not prepare the upload. Please try again.');
  return json.data; // { timestamp, signature, apiKey, cloudName, folder }
}

/**
 * uploadFile(file, { folder, token, onProgress })
 *   folder     — admin uploads only: 'gallery' | 'notices' | 'events' | 'staff' | 'downloads' | 'students'
 *   token      — pass the admin accessToken; omit for the public admissions flow
 *   onProgress — (percent: number) => void
 * Resolves to { url, publicId, width, height, mime, sizeKb, name } — the same
 * descriptor shape the API's own saveFile() returns, so it can be sent
 * straight back as JSON to the JSON-variant upload routes.
 */
export function uploadFile(file, { folder, token, onProgress } = {}) {
  return getSignature({ folder, token }).then((sig) => new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('signature', sig.signature);
    form.append('folder', sig.folder);
    form.append('allowed_formats', sig.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let body = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* fall through to the error branch below */ }

      if (xhr.status >= 200 && xhr.status < 300 && body) {
        resolve({
          url: body.secure_url,
          publicId: body.public_id,
          width: body.width,
          height: body.height,
          mime: body.resource_type && body.format ? `${body.resource_type}/${body.format}` : file.type,
          sizeKb: body.bytes ? Math.round(body.bytes / 1024) : undefined,
          name: file.name,
        });
      } else {
        reject(new Error(body?.error?.message || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed — check your connection and try again.'));
    xhr.send(form);
  }));
}

/** Uploads files one at a time (keeps a single, simple progress % per file) and returns their descriptors in order. */
export async function uploadFiles(files, { folder, token, onProgress } = {}) {
  const descriptors = [];
  for (let i = 0; i < files.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- sequential on purpose: one progress bar, predictable order
    const descriptor = await uploadFile(files[i], {
      folder,
      token,
      onProgress: onProgress ? (pct) => onProgress(i, pct) : undefined,
    });
    descriptors.push(descriptor);
  }
  return descriptors;
}
