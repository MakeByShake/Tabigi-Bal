import { put, del } from '@vercel/blob';
import { ensureSchema, getSettings, query, saveSetting, DEFAULT_SETTINGS, PRODUCT_COLS } from '../server/db.js';
import { checkPassword, clearCookie, isAdmin, requireAdmin, sessionCookie } from '../server/auth.js';
import { fail, getQuery, handle, int, readJson, send, str } from '../server/http.js';
import { notifyOrder, tgCall } from '../server/telegram.js';

// Older Blob connections give a BLOB_READ_WRITE_TOKEN (maybe with a custom prefix);
// newer ones give BLOB_STORE_ID and the SDK signs in with Vercel's OIDC token on its own.
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN
  || Object.entries(process.env).find(([k]) => k.endsWith('_READ_WRITE_TOKEN'))?.[1];
const blobConnected = () => !!(blobToken() || process.env.BLOB_STORE_ID);

const CATEGORIES = ['honey', 'bee', 'comb'];
const STOCK = ['in', 'low', 'out'];
const ORDER_STATUS = ['new', 'confirmed', 'done', 'cancelled'];

function cleanProduct(b) {
  const name = str(b.name, 120);
  if (!name) fail(400, 'Введите название');
  const price = int(b.price, 0);
  if (price === null) fail(400, 'Введите цену');
  return {
    name,
    description: str(b.description, 2000),
    category: CATEGORIES.includes(b.category) ? b.category : 'honey',
    price,
    old_price: b.old_price ? int(b.old_price, 0) : null,
    price_note: str(b.price_note, 40) || null,
    unit: str(b.unit, 40) || null,
    image: str(b.image, 1000) || null,
    badge: str(b.badge, 30) || null,
    stock: STOCK.includes(b.stock) ? b.stock : 'in',
    visible: b.visible !== false,
  };
}

async function storeImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || '');
  if (!m) fail(400, 'Нужна картинка JPG, PNG или WEBP');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4_000_000) fail(413, 'Фото слишком большое');
  const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
  const name = `products/${Date.now()}.${ext}`;
  if (globalThis.__TB_DEV_PUT__) return globalThis.__TB_DEV_PUT__(name, buf);
  if (!blobConnected()) fail(503, 'Хранилище фото не подключено (Vercel Blob)');
  const token = blobToken();
  const blob = await put(name, buf, { access: 'public', contentType: m[1], addRandomSuffix: true, cacheControlMaxAge: 31536000, token });
  return blob.url;
}

async function dropImage(url) {
  if (!url || !/blob\.vercel-storage\.com/.test(url) || !blobConnected()) return;
  try { await del(url, { token: blobToken() }); } catch (e) { console.error('blob delete failed', e.message); }
}

const maskToken = (t) => (t ? `${t.slice(0, 6)}…${t.slice(-4)}` : '');

const actions = {
  // ---------- session ----------
  async login(req, res) {
    const { password } = await readJson(req, 10_000);
    if (!checkPassword(password)) {
      await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
      fail(401, 'Неверный пароль');
    }
    send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req) });
  },
  async logout(req, res) {
    send(res, 200, { ok: true }, { 'Set-Cookie': clearCookie() });
  },
  async me(req, res) {
    send(res, 200, { admin: isAdmin(req) });
  },

  // ---------- products ----------
  async products(req, res) {
    requireAdmin(req);
    const rows = await query(`SELECT ${PRODUCT_COLS} FROM products ORDER BY sort, id`);
    send(res, 200, { products: rows });
  },
  async productSave(req, res) {
    requireAdmin(req);
    const b = await readJson(req, 20_000);
    const p = cleanProduct(b);
    const vals = [p.name, p.description, p.category, p.price, p.old_price, p.price_note, p.unit, p.image, p.badge, p.stock, p.visible];
    let row;
    if (b.id) {
      const [old] = await query('SELECT image FROM products WHERE id = $1', [int(b.id, 1)]);
      if (!old) fail(404, 'Товар не найден');
      [row] = await query(
        `UPDATE products SET name=$1, description=$2, category=$3, price=$4, old_price=$5, price_note=$6, unit=$7,
         image=$8, badge=$9, stock=$10, visible=$11, updated_at=now() WHERE id=$12 RETURNING ${PRODUCT_COLS}`,
        [...vals, int(b.id, 1)],
      );
      if (old.image !== p.image) await dropImage(old.image);
    } else {
      [row] = await query(
        `INSERT INTO products (name, description, category, price, old_price, price_note, unit, image, badge, stock, visible, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, (SELECT coalesce(min(sort), 0) - 1 FROM products))
         RETURNING ${PRODUCT_COLS}`,
        vals,
      );
    }
    send(res, 200, { product: row });
  },
  // Quick toggles from the list: stock status and visibility.
  async productPatch(req, res) {
    requireAdmin(req);
    const b = await readJson(req, 5_000);
    const id = int(b.id, 1);
    if (b.stock !== undefined) {
      if (!STOCK.includes(b.stock)) fail(400, 'Bad stock');
      await query('UPDATE products SET stock=$1, updated_at=now() WHERE id=$2', [b.stock, id]);
    }
    if (b.visible !== undefined) await query('UPDATE products SET visible=$1, updated_at=now() WHERE id=$2', [!!b.visible, id]);
    const [row] = await query(`SELECT ${PRODUCT_COLS} FROM products WHERE id=$1`, [id]);
    send(res, 200, { product: row });
  },
  async productDelete(req, res) {
    requireAdmin(req);
    const { id } = await readJson(req, 5_000);
    const [row] = await query('DELETE FROM products WHERE id=$1 RETURNING image', [int(id, 1)]);
    if (row) await dropImage(row.image);
    send(res, 200, { ok: true });
  },
  async reorder(req, res) {
    requireAdmin(req);
    const { ids } = await readJson(req, 20_000);
    if (!Array.isArray(ids)) fail(400, 'ids required');
    await query(
      `UPDATE products p SET sort = x.ord FROM unnest($1::int[]) WITH ORDINALITY AS x(id, ord) WHERE p.id = x.id`,
      [ids.map((i) => int(i, 1))],
    );
    send(res, 200, { ok: true });
  },
  async upload(req, res) {
    requireAdmin(req);
    const { dataUrl } = await readJson(req);
    send(res, 200, { url: await storeImage(dataUrl) });
  },

  // ---------- orders ----------
  async orders(req, res) {
    requireAdmin(req);
    const q = getQuery(req);
    const status = ORDER_STATUS.includes(q.status) ? q.status : null;
    const rows = await query(
      `SELECT id, code, created_at, name, phone, method, address, comment, items, total, status
       FROM orders WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, int(q.limit, 1, 200) || 50, int(q.offset, 0) || 0],
    );
    send(res, 200, { orders: rows });
  },
  async orderStatus(req, res) {
    requireAdmin(req);
    const { id, status } = await readJson(req, 5_000);
    if (!ORDER_STATUS.includes(status)) fail(400, 'Bad status');
    await query('UPDATE orders SET status=$1 WHERE id=$2', [status, int(id, 1)]);
    send(res, 200, { ok: true });
  },
  async orderDelete(req, res) {
    requireAdmin(req);
    const { id } = await readJson(req, 5_000);
    await query('DELETE FROM orders WHERE id=$1', [int(id, 1)]);
    send(res, 200, { ok: true });
  },
  async stats(req, res) {
    requireAdmin(req);
    // Almaty time (UTC+5) for "today", cancelled orders excluded from sales.
    const [s] = await query(`
      SELECT
        count(*) FILTER (WHERE status = 'new')::int AS new_count,
        coalesce(sum(total) FILTER (WHERE status <> 'cancelled' AND created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Almaty') AT TIME ZONE 'Asia/Almaty'), 0)::int AS today,
        count(*) FILTER (WHERE status <> 'cancelled' AND created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Almaty') AT TIME ZONE 'Asia/Almaty')::int AS today_count,
        coalesce(sum(total) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '7 days'), 0)::int AS week,
        count(*) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '7 days')::int AS week_count,
        coalesce(sum(total) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '30 days'), 0)::int AS month,
        count(*) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '30 days')::int AS month_count
      FROM orders`);
    const top = await query(`
      SELECT i->>'name' AS name, sum((i->>'quantity')::int)::int AS qty, sum((i->>'quantity')::int * (i->>'price')::int)::int AS revenue
      FROM orders, jsonb_array_elements(items) AS i
      WHERE status <> 'cancelled' AND created_at >= now() - interval '30 days'
      GROUP BY 1 ORDER BY qty DESC LIMIT 5`);
    send(res, 200, { stats: s, top });
  },

  // ---------- settings ----------
  async settings(req, res) {
    requireAdmin(req);
    const { site, telegram } = await getSettings();
    send(res, 200, {
      site,
      telegram: { connected: !!(telegram.token && telegram.chatId), token: maskToken(telegram.token), chatId: telegram.chatId },
      storage: { blob: blobConnected() || !!globalThis.__TB_DEV_PUT__ },
    });
  },
  async settingsSave(req, res) {
    requireAdmin(req);
    const b = await readJson(req, 20_000);
    const site = {};
    for (const k of Object.keys(DEFAULT_SETTINGS)) if (k !== 'announcement') site[k] = str(b[k] ?? DEFAULT_SETTINGS[k], 300);
    site.whatsapp = site.whatsapp.replace(/\D/g, '').replace(/^8/, '7');
    if (site.whatsapp.length < 11) fail(400, 'Проверьте номер WhatsApp');
    site.announcement = { enabled: !!b.announcement?.enabled, text: str(b.announcement?.text, 160) };
    await saveSetting('site', site);
    send(res, 200, { site });
  },
  // Step 1: admin pastes the bot token, writes /start to the bot, we find the chat.
  async telegramDetect(req, res) {
    requireAdmin(req);
    const { token } = await readJson(req, 5_000);
    const t = str(token, 100);
    if (!/^\d+:[\w-]{30,}$/.test(t)) fail(400, 'Токен выглядит неправильно. Скопируйте его из @BotFather целиком');
    const me = await tgCall(t, 'getMe');
    const updates = await tgCall(t, 'getUpdates', { limit: 50 });
    const chats = new Map();
    for (const u of updates) {
      const c = (u.message || u.my_chat_member || u.channel_post)?.chat;
      if (c) chats.set(String(c.id), c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.username || String(c.id));
    }
    send(res, 200, { bot: me.username, chats: [...chats].map(([id, title]) => ({ id, title })) });
  },
  async telegramSave(req, res) {
    requireAdmin(req);
    const b = await readJson(req, 5_000);
    if (b.disconnect) { await saveSetting('telegram', { token: '', chatId: '' }); return send(res, 200, { ok: true }); }
    const token = str(b.token, 100), chatId = str(b.chatId, 40);
    await tgCall(token, 'sendMessage', { chat_id: chatId, text: '✅ Tabigi Bal: уведомления о заказах подключены.' });
    await saveSetting('telegram', { token, chatId });
    send(res, 200, { ok: true });
  },
  async telegramTest(req, res) {
    requireAdmin(req);
    const { telegram } = await getSettings();
    if (!telegram.token) fail(400, 'Telegram не подключён');
    await notifyOrder(telegram, {
      code: 'TEST', name: 'Тест', phone: '+7 700 000 00 00', method: 'pickup', comment: 'Это тестовое уведомление',
      items: [{ name: 'Жантақ Балы', price: 3500, quantity: 1 }], total: 3500,
    });
    send(res, 200, { ok: true });
  },
};

export default handle(async (req, res) => {
  const name = getQuery(req).a;
  const fn = actions[name];
  if (!fn) fail(404, 'Unknown action');
  res.setHeader('Cache-Control', 'no-store');
  if (!['login', 'logout', 'me'].includes(name)) await ensureSchema();
  await fn(req, res);
});
