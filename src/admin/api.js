export class AuthError extends Error {}

// Calls /api/admin?a=<action>. GET when there is no body, POST with JSON otherwise.
export async function api(action, body, query = {}) {
  const qs = new URLSearchParams({ a: action, ...query }).toString();
  const res = await fetch(`/api/admin?${qs}`, body === undefined
    ? { credentials: 'same-origin' }
    : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (res.status === 401 && action !== 'login') throw new AuthError(data.error || 'Not logged in');
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

// Shrinks a photo on the phone before upload: max 1400px, WebP (JPEG on Safari).
export async function compressImage(file, maxSide = 1400) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Не удалось открыть фото. Попробуйте JPG или PNG'));
      i.src = url;
    });
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * k);
    canvas.height = Math.round(img.naturalHeight * k);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    let type = 'image/webp';
    let dataUrl = canvas.toDataURL(type, 0.85);
    if (!dataUrl.startsWith('data:image/webp')) { type = 'image/jpeg'; dataUrl = canvas.toDataURL(type, 0.85); }
    for (let q = 0.75; dataUrl.length > 3_500_000 && q > 0.4; q -= 0.15) dataUrl = canvas.toDataURL(type, q);
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const nf = new Intl.NumberFormat('ru-RU');
export const money = (n) => `${nf.format(n || 0)} ₸`;

const dtf = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Almaty', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const when = (d) => dtf.format(new Date(d));
