// Small helpers that work both on Vercel functions and in the local Vite dev server.

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export async function readJson(req, limit = 6_000_000) {
  if (req.body !== undefined && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function getQuery(req) {
  if (req.query && Object.keys(req.query).length) return req.query;
  return Object.fromEntries(new URL(req.url, 'http://x').searchParams);
}

export function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// Wraps a handler so thrown errors become JSON responses instead of crashes.
export const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error(e);
    send(res, status, { error: status >= 500 && !e.status ? 'Server error' : e.message });
  }
};

export const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

// Trims a value to a string of at most `max` characters.
export const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
export const int = (v, min = 0, max = 10_000_000) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
};
