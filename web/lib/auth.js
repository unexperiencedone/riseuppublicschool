'use client';

import { API_URL } from './config';

const KEY = 'rups.auth';

export const saveSession = (session) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(session));
};

export const readSession = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') sessionStorage.removeItem(KEY);
};

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Sign-in failed');
  saveSession({ token: json.data.accessToken, user: json.data.user });
  return json.data;
}

export async function logout() {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* ignore */ }
  clearSession();
}

/** Fetch with the stored access token; transparently refreshes once on 401. */
export async function authedFetch(path, options = {}) {
  const session = readSession();
  const call = (token) => fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let res = await call(session?.token);

  if (res.status === 401) {
    const r = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (r.ok) {
      const json = await r.json();
      saveSession({ token: json.data.accessToken, user: json.data.user });
      res = await call(json.data.accessToken);
    } else {
      clearSession();
      throw new Error('Your session has expired. Please sign in again.');
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}
