import { neon } from '@neondatabase/serverless';
import { products as seedProducts } from '../src/data/products.js';
import { DEFAULT_SETTINGS } from '../src/data/settings.js';

export { DEFAULT_SETTINGS };

// In local dev the Vite plugin injects a PGlite-backed query function,
// so the same SQL runs against a real Postgres engine on the laptop.
let neonSql;
export async function query(text, params = []) {
  if (globalThis.__TB_DEV_QUERY__) return globalThis.__TB_DEV_QUERY__(text, params);
  // Vercel may add a custom prefix to the variable name (e.g. STORAGE_URL), so fall back
  // to any variable that holds a Postgres connection string.
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
    || Object.values(process.env).find((v) => /^postgres(ql)?:\/\//.test(v || ''));
  if (!url) throw Object.assign(new Error('Database is not connected (DATABASE_URL missing)'), { status: 503 });
  neonSql ??= neon(url);
  return neonSql.query(text, params);
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'honey',
    price INTEGER NOT NULL DEFAULT 0,
    old_price INTEGER,
    price_note TEXT,
    unit TEXT,
    image TEXT,
    badge TEXT,
    stock TEXT NOT NULL DEFAULT 'in',
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    method TEXT NOT NULL,
    address TEXT,
    comment TEXT,
    items JSONB NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
  )`,
  `CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
  )`,
];

let ready;
// Creates tables on first use and fills the catalog with the current products once.
export function ensureSchema() {
  ready ??= (async () => {
    for (const s of SCHEMA) await query(s);
    // Only the request that claims the 'seeded' flag fills the catalog, so two cold starts can't seed twice.
    const claimed = await query(`INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING RETURNING key`);
    if (claimed.length) {
      for (const [i, p] of seedProducts.entries()) {
        const range = p.priceDisplay && /\d\s*-\s*\d/.test(p.priceDisplay) ? p.priceDisplay.replace(/\s*₸.*/, '') : null;
        const unit = p.priceDisplay && p.priceDisplay.includes('/') ? p.priceDisplay.split('/')[1].trim().replace(/(\d)\s*g$/, '$1 г') : null;
        await query(
          `INSERT INTO products (name, description, category, price, price_note, unit, image, badge, sort)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [p.name, p.description, p.category, p.price, range, unit, p.image, p.badge || null, i],
        );
      }
    }
  })().catch((e) => { ready = undefined; throw e; });
  return ready;
}

export async function getSettings() {
  const rows = await query(`SELECT key, value FROM settings WHERE key IN ('site', 'telegram')`);
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    site: { ...DEFAULT_SETTINGS, ...(byKey.site || {}) },
    telegram: byKey.telegram || { token: '', chatId: '' },
  };
}

export async function saveSetting(key, value) {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)],
  );
}

// Column list shared by the public catalog and the admin.
export const PRODUCT_COLS = 'id, name, description, category, price, old_price, price_note, unit, image, badge, stock, visible, sort';
