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
RESEND_API_KEY=
EMAIL_FROM=Devfy <onboarding@resend.dev>
```

### Frontend (`frontend/.env.example`)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
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
# lalu isi DATABASE_URL, JWT_SECRET, dan VITE_API_URL

# 3. migrasi + generate client
cd backend
npx prisma migrate dev
npx prisma generate

# 4. jalankan dev server
npm run dev   # backend di http://localhost:5000  (dev: tsx watch)
# terminal lain:
cd frontend && npm run dev   # http://localhost:5173
```

### Konfigurasi email dan upload gambar

1. Buat akun Resend, tambahkan domain pengirim, lalu ikuti instruksi DNS yang ditampilkan Resend. Setelah domain terverifikasi, buat API key.
2. Isi `RESEND_API_KEY` dan `EMAIL_FROM` (contoh `Devfy <no-reply@domainmu.com>`) di `backend/.env`, lalu restart backend. Reset password belum aktif sampai provider siap.
3. Buat akun Cloudinary, buka **Settings → Upload → Upload presets**, lalu buat preset unsigned khusus Devfy.
4. Batasi preset Cloudinary ke JPG/PNG/WebP dan maksimum 5 MB. Isi `VITE_CLOUDINARY_CLOUD_NAME` dan `VITE_CLOUDINARY_UPLOAD_PRESET` di `frontend/.env`, lalu restart frontend. Jangan pernah meletakkan API secret Cloudinary di frontend.
5. Pengguna juga bisa menempel URL foto/thumbnail sebagai alternatif upload.

- Akun dan proyek baru default privat: project berstatus `DRAFT`, portfolio belum dipublikasikan. Publish project dahulu, lalu publish portfolio.
- Registrasi publik selalu membuat role `DEVELOPER`. `PLATFORM_ADMIN` hanya bisa diberikan langsung di database kepada akun tepercaya; aksi hide/restore admin dicatat ke `AuditLog`. Contoh setelah login sebagai akun admin yang sudah dibuat:
  ```sql
  UPDATE "User"
  SET "globalRole" = 'PLATFORM_ADMIN'
  WHERE "email" = 'akun-admin@example.com';
  ```

- `backend/src/app.ts` diekspor untuk testing/integrasi; `backend/src/index.ts` menjalankan `app.listen`.
- `frontend/src/lib/api.ts` adalah satu-satunya tempat `VITE_API_URL` dibaca — 4 halaman (Login, Register, Dashboard, PublicPortfolio) mengimpor dari sana.

### Build & verifikasi (tanpa DB)
```bash
cd backend && npm run build          # tsc → dist/
cd frontend && npm run build         # tsc -b && vite build → dist/
cd backend && npm test               # unit/API tests; live integration dilaporkan skipped secara default
cd backend && npm run db:check       # DB_REACHABLE / DB_UNREACHABLE (tanpa bocor kredensial)
cd backend && npx prisma validate    # schema valid
cd backend && npm run db:status      # butuh DB reachable
```

Untuk menjalankan tes integrasi yang benar-benar menulis ke database lokal, pastikan database dapat dijangkau lalu jalankan `npm test -- integration.live.api.test.ts` dengan `RUN_LIVE_INTEGRATION=1`. Tes membuat akun unik dan membersihkan hanya akun yang dibuatnya.

**Catatan:** `postinstall` backend otomatis menjalankan `prisma generate` (supaya `@prisma/client` siap di hosting). Tanpa Postgres lokal, tes integrasi dilewati secara eksplisit, bukan dihitung sebagai tes lulus. Build frontend production mewajibkan `VITE_API_URL`; jangan mengandalkan URL localhost sebagai fallback production. Detail & batasan: lihat `DEPLOYMENT.md`.

## Endpoint ringkas
- `POST /api/auth/register` — rate limit 5/jam
- `POST /api/auth/login` — rate limit 10/15 menit
- `POST /api/auth/password/forgot` dan `/api/auth/password/reset` — email Resend, token sekali pakai disimpan sebagai hash
- `GET/PATCH /api/profile` — butuh Bearer token
- `GET/POST /api/projects`, `PATCH/DELETE /api/projects/:id` — butuh token, cek kepemilikan, P2025 → 404 (race-safe)
- `POST /api/admin/projects/:id/hide|restore` — khusus platform admin, dicatat di AuditLog
- `GET /api/public/:username` dan `/api/public/:username/projects/:slug` — hanya portfolio aktif dan project published
- `GET /api/health` — ping DB, 200/500
- `/* /api yang tak dikenal → 404 JSON`

## Fitur MVP
- Registrasi, login, logout, validasi, rate limiting, serta pemulihan password via email
- Profil: nama, username unik, foto, bio, lokasi, skills, GitHub, LinkedIn, dan website
- Project CRUD dengan ownership check, thumbnail, slug, status draft/published, demo dan repository
- Dashboard dengan preview/status publikasi; portfolio publik responsif hanya menampilkan konten yang diterbitkan
- Moderasi project khusus platform admin dengan audit log
- JWT HS256 exp 1d, bcrypt hash cost 12, CORS dari daftar origin, JSON limit 10kb
- Reset password menaikkan versi sesi agar token lama tidak dapat dipakai lagi

## Keamanan & keterbatasan
- `public` endpoint tidak pernah mengembalikan `email`/`passwordHash`/`id` internal — hanya name/username/bio/skills/links/projects
- Rate limit **berbasis memori** (express-rate-limit): tidak konsisten antar instance — untuk scale horizontal butuh store eksternal (Redis).
- `.env` tidak di-track git (`.gitignore` + `!.env.example`); `/.env.example` ada di kedua sisi.
- Prisma Client `binaryTargets: ["native", "debian-openssl-3.0.x", "windows"]` agar jalan di Linux & Windows tanpa `prisma.config.js` hasil build. **Jangan commit** `prisma.config.js`/`prisma.config.d.ts*` (sudah di-`backend/.gitignore`).

## Deployment — lihat `DEPLOYMENT.md`
Langkah hosting terpisah di file tersebut (frontend di Vercel/Netlify, backend di Render/Fly/Railway, Postgres di Neon/Supabase), env vars production, build command, migrasi aman, health check, backup, HTTPS.
