// In production the API is served from the same origin (single-service deploy),
// so BASE is empty. In dev the client (5173) and API (4000) are separate.
const BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

// Local development convenience: use the sample host key automatically
// unless the user has explicitly saved one in localStorage.
const DEV_HOST_KEY = import.meta.env.PROD ? '' : 'change-me-host-key';

// The host key gates host-only endpoints. Stored in localStorage so the host
// only enters it once on this browser. (v1 auth — replace with real auth later.)
export const hostKey = {
  get: () => localStorage.getItem('hostKey') || DEV_HOST_KEY,
  set: (v) => localStorage.setItem('hostKey', v),
  clear: () => localStorage.removeItem('hostKey'),
};

async function req(path, { method = 'GET', body, host = false, _retried = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (host) headers['x-host-key'] = hostKey.get();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If a stale key is saved in localStorage, self-heal in dev by restoring
  // the sample key and retrying once so the host sign-in screen doesn't loop.
  if (!import.meta.env.PROD && host && res.status === 401 && !_retried) {
    hostKey.set(DEV_HOST_KEY);
    return req(path, { method, body, host, _retried: true });
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// --- host endpoints ---
export const api = {
  health: () => req('/api/health'),
  listWebinars: () => req('/api/webinars', { host: true }),
  createWebinar: (b) => req('/api/webinars', { method: 'POST', body: b, host: true }),
  getWebinar: (id) => req(`/api/webinars/${id}`, { host: true }),
  setStatus: (id, status) =>
    req(`/api/webinars/${id}`, { method: 'PATCH', body: { status }, host: true }),
  deleteWebinar: (id) => req(`/api/webinars/${id}`, { method: 'DELETE', host: true }),
  sendInvites: (id, emails) =>
    req(`/api/webinars/${id}/invites`, { method: 'POST', body: { emails }, host: true }),
  hostToken: (id, name) =>
    req(`/api/webinars/${id}/host-token`, { method: 'POST', body: { name }, host: true }),
  setPublish: (id, identity, canPublish) =>
    req(`/api/webinars/${id}/participants/${identity}/publish`, {
      method: 'POST', body: { canPublish }, host: true,
    }),
  removeParticipant: (id, identity) =>
    req(`/api/webinars/${id}/participants/${identity}`, { method: 'DELETE', host: true }),

  // --- public (student) endpoints ---
  getInvite: (token) => req(`/api/join/${token}`),
  studentToken: (token, name) =>
    req(`/api/join/${token}/token`, { method: 'POST', body: { name } }),
};
