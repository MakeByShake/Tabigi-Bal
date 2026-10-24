import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'

const root = fileURLToPath(new URL('.', import.meta.url))

// Local stand-in for Vercel: runs /api/*.js handlers, a real Postgres (PGlite)
// and stores uploaded photos in public/uploads. Only used by `npm run dev`.
function localApi() {
  return {
    name: 'tabigi-local-api',
    apply: 'serve',
    async configureServer(server) {
      const env = loadEnv('development', root, '')
      process.env.ADMIN_PASSWORD ||= env.ADMIN_PASSWORD || 'admin'
      if (!env.DATABASE_URL) {
        const { PGlite } = await import('@electric-sql/pglite')
        await mkdir(`${root}.data`, { recursive: true })
        const db = new PGlite(`${root}.data/pglite`)
        globalThis.__TB_DEV_QUERY__ = async (text, params) => (await db.query(text, params)).rows
      } else {
        process.env.DATABASE_URL = env.DATABASE_URL
      }
      if (!env.BLOB_READ_WRITE_TOKEN) {
        globalThis.__TB_DEV_PUT__ = async (name, buf) => {
          const file = name.replace(/(\.\w+)$/, `-${randomBytes(4).toString('hex')}$1`).replace(/^products\//, '')
          await mkdir(`${root}public/uploads`, { recursive: true })
          await writeFile(`${root}public/uploads/${file}`, buf)
          return `/uploads/${file}`
        }
      }
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/admin' || req.url.startsWith('/admin?') || req.url === '/admin/') {
          req.url = '/admin.html'
          return next()
        }
        // Serve freshly uploaded photos directly (Vite's public-file list can lag behind new files).
        const up = /^\/uploads\/([\w.-]+)$/.exec(req.url)
        if (up) {
          try {
            const buf = await readFile(`${root}public/uploads/${up[1]}`)
            res.setHeader('Content-Type', up[1].endsWith('.webp') ? 'image/webp' : up[1].endsWith('.png') ? 'image/png' : 'image/jpeg')
            return res.end(buf)
          } catch { return next() }
        }
        const m = /^\/api\/([\w-]+)(?:\?|$)/.exec(req.url)
        if (!m) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`)
          await mod.default(req, res)
        } catch (e) {
          console.error(e)
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi()],
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        admin: `${root}admin.html`,
      },
    },
  },
})
