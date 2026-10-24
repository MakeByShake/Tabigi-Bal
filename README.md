# Tabigi Bal

An online shop for natural honey, in Kazakh, with an admin panel. Visitors browse honey, add it to a cart and send a ready order to WhatsApp; the shop manages products, stock and orders at `/admin`.

**Live:** https://tabigi-bal.vercel.app · **Admin:** https://tabigi-bal.vercel.app/admin

**Stack:** React + Vite, Vercel Functions (`/api`), Neon Postgres, Vercel Blob

## Features

- Catalog with categories, search, price sort, product details, stock labels, discounts and units
- Cart with a 2-step checkout that opens WhatsApp with a numbered order
- Admin: products with photo upload, stock (in / low / out), visibility, ordering; orders log with statuses and sales stats; Telegram notifications; editable contacts and an announcement bar
- Works without the database too (falls back to the built-in catalog)

## Setup

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for connecting the database, photo storage and admin password on Vercel.

## Run locally

```bash
npm install
npm run dev   # admin password: admin (override with ADMIN_PASSWORD in .env.local)
```

Local dev runs the `/api` handlers inside Vite with an embedded Postgres (PGlite) and stores photos in `public/uploads`.
