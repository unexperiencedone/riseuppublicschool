import { API_URL, REVALIDATE } from './config';

/**
 * Server-side fetch helper.
 * The site must render correctly even when the API is unreachable (first deploy,
 * cold Render instance, DB outage), so every call falls back to static content.
 */
export async function apiGet(path, { revalidate = REVALIDATE, fallback = null, tags = [] } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate, tags },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
    const json = await res.json();
    const data = json?.data;
    if (data === undefined || data === null) return fallback;
    if (Array.isArray(data) && data.length === 0 && fallback) return fallback;
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[apiGet] ${path} → ${err.message}; using fallback content`);
    }
    return fallback;
  }
}

/** Client-side mutation helper used by forms. */
export async function apiPost(path, body, { token, isFormData = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.errors = json.errors;
    throw err;
  }
  return json;
}

export async function apiAuthed(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return json;
}
