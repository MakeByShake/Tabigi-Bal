import { ensureSchema, getSettings, query } from '../server/db.js';
import { fail, handle, int, readJson, send, str } from '../server/http.js';
import { notifyOrder } from '../server/telegram.js';

// Saves an order before the customer is sent to WhatsApp.
// Prices are taken from the database, never from the browser.
export default handle(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'POST only');
  const body = await readJson(req, 50_000);
  const c = body.customer || {};
  const code = str(body.code, 16).replace(/[^\w-]/g, '');
  const name = str(c.name, 80), phone = str(c.phone, 40);
  const method = c.method === 'pickup' ? 'pickup' : 'delivery';
  if (!code || !name || !phone) fail(400, 'Missing fields');
  const wanted = (Array.isArray(body.items) ? body.items : []).slice(0, 50)
    .map((i) => ({ id: int(i.id, 1), quantity: int(i.quantity, 1, 99) }))
    .filter((i) => i.id && i.quantity);
  if (!wanted.length) fail(400, 'Empty cart');

  await ensureSchema();
  const rows = await query('SELECT id, name, price, unit FROM products WHERE id = ANY($1::int[])', [wanted.map((i) => i.id)]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const items = wanted.filter((i) => byId.has(i.id)).map((i) => {
    const p = byId.get(i.id);
    return { id: p.id, name: p.unit ? `${p.name} (${p.unit})` : p.name, price: p.price, quantity: i.quantity };
  });
  if (!items.length) fail(400, 'Products not found');
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const order = {
    code, name, phone, method,
    address: method === 'delivery' ? str(c.address, 200) : '',
    comment: str(c.comment, 500),
    items, total,
  };
  const [row] = await query(
    `INSERT INTO orders (code, name, phone, method, address, comment, items, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8) RETURNING id`,
    [order.code, order.name, order.phone, order.method, order.address, order.comment, JSON.stringify(items), total],
  );

  try {
    const { telegram } = await getSettings();
    await notifyOrder(telegram, order);
  } catch (e) {
    console.error('telegram notify failed', e.message);
  }
  send(res, 200, { ok: true, id: row.id });
});
