import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { fail, parseCookies } from './http.js';

const COOKIE = 'tb_admin';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function password() {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) fail(503, 'ADMIN_PASSWORD is not set');
  return p;
}

// The signing key comes from the password, so changing the password logs everyone out.
const key = () => createHash('sha256').update(`tabigi-bal:${password()}`).digest();
const sign = (payload) => createHmac('sha256', key()).update(payload).digest('base64url');

const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(input) {
  const a = createHash('sha256').update(String(input || '')).digest();
  const b = createHash('sha256').update(password()).digest();
  return timingSafeEqual(a, b);
}

export function sessionCookie(req) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = `${exp}.${sign(String(exp))}`;
  const secure = (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${secure}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(exp));
}

export function requireAdmin(req) {
  if (!isAdmin(req)) fail(401, 'Not logged in');
}
