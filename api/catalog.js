import { ensureSchema, getSettings, query, PRODUCT_COLS } from '../server/db.js';
import { handle, send } from '../server/http.js';

// Public catalog: visible products (out-of-stock last) + public site settings.
export default handle(async (req, res) => {
  await ensureSchema();
  const products = await query(
    `SELECT ${PRODUCT_COLS} FROM products WHERE visible
     ORDER BY (stock = 'out'), sort, id`,
  );
  const { site } = await getSettings();
  send(res, 200, { products, settings: site }, {
    // Short edge cache: admin edits show up within seconds.
    'Cache-Control': 'public, max-age=0, s-maxage=5, stale-while-revalidate=30',
  });
});
