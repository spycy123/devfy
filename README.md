# Devfy — Portfolio builder untuk mahasiswa & developer pemula

Devfy memungkinkan pengguna: registrasi/login, mengelola profil & proyek, dan mempublikasikan portofolio publik via `/u/:username`.

## Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, lucide-react
- **Backend:** Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL, JWT, bcryptjs, express-rate-limit, dotenv, cors
- **Database:** PostgreSQL

## Struktur monorepo
```
backend/   # Express + Prisma (src/app.ts = app, src/index.ts = server entry)
frontend/  # Vite + React (src/lib/api.ts centralizes API_URL via VITE_API_URL)
prisma/schema.prisma, prisma.config.ts (classic engine, tidak ada --config needed)
```

## Konfigurasi environment

### Backend (`backend/.env.example`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/devfy_db
JWT_SECRET=ganti-secret-min-32-char-random
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env.example`)
```
VITE_API_URL=http://localhost:5000/api
```
Frontend membaca `VITE_API_URL`; jika tidak diset, fallback ke `http://localhost:5000/api`. **Jangan hardcode localhost untuk production.**

## Pengembangan lokal

### Prasyarat
- Node.js 20+ (tersedia v24.16)
- PostgreSQL berjalan di `localhost:5432` (atau ubah `DATABASE_URL`)
  - Database default yang diharapkan: `devfy_db` (lihat `backend/.env`)
  - Buat DB jika belum ada: `createdb devfy_db` atau via psql `CREATE DATABASE devfy_db;`
  - Alternatif: gunakan hosting Postgres terkelola (Neon / Supabase / Railway) dan isi `DATABASE_URL`.

### Setup
```bash
# 1. install
cd backend && npm install
cd ../frontend && npm install

# 2. env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# lalu isi DATABASE_URL, JWT_SECRET, FRONTEND_URL, VITE_API_URL

# 3. migrasi + generate client
cd backend
npx prisma migrate dev   # atau: npx prisma migrate deploy untuk production
npx prisma generate

# 4. jalankan dev server
npm run dev   # backend di http://localhost:5000  (dev: tsx watch)
# terminal lain:
cd frontend && npm run dev   # http://localhost:5173
```

- `backend/src/app.ts` diekspor untuk testing/integrasi; `backend/src/index.ts` menjalankan `app.listen`.
- `frontend/src/lib/api.ts` adalah satu-satunya tempat `VITE_API_URL` dibaca — 4 halaman (Login, Register, Dashboard, PublicPortfolio) mengimpor dari sana.

### Build & verifikasi (tanpa DB)
```bash
cd backend && npm run build          # tsc → dist/
cd frontend && npm run build         # tsc -b && vite build → dist/
cd backend && npm test               # 28 tests (tanpa DB) lulus via vitest+supertest
cd backend && npm run db:check       # DB_REACHABLE / DB_UNREACHABLE (tanpa bocor kredensial)
cd backend && npx prisma validate    # schema valid
cd backend && npm run db:status      # butuh DB reachable
```

**Catatan:** `postinstall` backend otomatis menjalankan `prisma generate` (supaya `@prisma/client` siap di hosting). Tanpa Postgres lokal, `npm test` tetap lulus (28 tests) — suite `integration.live` memanggil `return` lebih awal (no-op) saat DB tidak terjangkau. Detail & batasan: lihat `DEPLOYMENT.md`.

## Endpoint ringkas
- `POST /api/auth/register` — rate limit 5/jam
- `POST /api/auth/login` — rate limit 10/15 menit
- `GET/PATCH /api/profile` — butuh Bearer token
- `GET/POST /api/projects`, `PATCH/DELETE /api/projects/:id` — butuh token, cek kepemilikan, P2025 → 404 (race-safe)
- `GET /api/public/:username` — publik, hanya field aman (tanpa email/passwordHash)
- `GET /api/health` — ping DB, 200/500
- `/* /api yang tak dikenal → 404 JSON`

## Fitur yang sudah siap (MVP)
- Landing page, login/register dengan validasi, dashboard terhubung backend (fetch nyata, bukan mock)
- Profil: name/bio/skills/githubUrl/websiteUrl dengan validasi (URL http/https, length, skills deduplicated)
- Proyek: CRUD penuh dengan ownership check, batas title 120, desc 5000, techStack 30×50, URL validasi
- Portofolio publik: data actual dari DB, empty/loading/error states, responsive
- JWT HS256 exp 1d, bcrypt hash cost 12, CORS dari daftar origin, JSON limit 10kb

## Keamanan & keterbatasan
- `public` endpoint tidak pernah mengembalikan `email`/`passwordHash`/`id` internal — hanya name/username/bio/skills/links/projects
- Rate limit **berbasis memori** (express-rate-limit): tidak konsisten antar instance — untuk scale horizontal butuh store eksternal (Redis).
- `.env` tidak di-track git (`.gitignore` + `!.env.example`); `/.env.example` ada di kedua sisi.
- Prisma Client `binaryTargets: ["native", "debian-openssl-3.0.x", "windows"]` agar jalan di Linux & Windows tanpa `prisma.config.js` hasil build. **Jangan commit** `prisma.config.js`/`prisma.config.d.ts*` (sudah di-`backend/.gitignore`).

## Deployment — lihat `DEPLOYMENT.md`
Langkah hosting terpisah di file tersebut (frontend di Vercel/Netlify, backend di Render/Fly/Railway, Postgres di Neon/Supabase), env vars production, build command, migrasi aman, health check, backup, HTTPS.
