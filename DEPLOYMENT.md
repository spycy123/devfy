# Deployment — Devfy MVP

Tujuan: bawa Devfy dari lokal ke hosting production tanpa rebuild stack; tetap pada React+Vite+Tailwind / Express+Prisma+Postgres.

## Opsi hosting (dipilih sesuai kebutuhan — pemula friendly)

| Komponen | Rekomendasi | Alternatif | Catatan |
|----------|-------------|------------|---------|
| **Frontend** | Vercel (`vercel --prod`) | Netlify, Cloudflare Pages | Hanya butuh `VITE_API_URL` di env; di-root monorepo set **Root Directory = `frontend`** jika host minta. |
| **Backend** | Fly.io (`fly deploy`) atau Railway | Render, Cyclic | Node runtime; `start` → `node dist/index.js`. |
| **Database** | Neon (serverless Postgres) atau Supabase | Railway Postgres, Supabase (free tier) | Set `DATABASE_URL` di env backend; tambahkan `?sslmode=require` jika provider butuh TLS. |

Devfy adalah monorepo — namun setiap host boleh di-deploy **hanya satu subdir** sebagai service (frontend/backend). `vercel.json`/`fly.toml` sejauh ini tidak ada di repo — tidak diperlukan kecuali konfigurasi spesifik.

## Environment production

### Backend (wajib)
```
NODE_ENV=production
PORT=5000               # atau port yang ditetapkan host (Railway/Fly inject PORT sendiri — biarkan)
DATABASE_URL=postgres://user:pass@HOST:5432/dbname?sslmode=require
JWT_SECRET=<minimal 32 karakter acak, simpan di secret manager host>
FRONTEND_URL=https://<domain-frontend-anda>.vercel.app
RESEND_API_KEY=<API key dari Resend>
EMAIL_FROM=Devfy <no-reply@domain-anda>
```

**TIDAK** pernah commit `.env` atau `DATABASE_URL` nyata. Gunakan dashboard env vars host.

### Frontend (build-time)
```
VITE_API_URL=https://<backend-host>/api
VITE_CLOUDINARY_CLOUD_NAME=<cloud name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned preset khusus Devfy>
```
`VITE_`-prefix artinya var dibundel pada **build time**. Jika `VITE_API_URL` berubah, **rebuild & redeploy** frontend. Production build akan gagal jika variabel ini tidak diset; fallback localhost hanya untuk development.

**Kesalahan umum:** hardcode `http://localhost:5000/api` di halaman — Devfy sudah terpusat di `frontend/src/lib/api.ts`; selalu cek `VITE_API_URL` dulu sebelum hardcode.

### Email dan gambar (fitur MVP)

- Buat API key Resend dan verifikasi domain pengirim. `EMAIL_FROM` harus menggunakan domain yang sudah diverifikasi di Resend. Backend menolak startup production bila `RESEND_API_KEY` atau `EMAIL_FROM` belum ada.
- Di Cloudinary, buat unsigned upload preset untuk Devfy. Batasi ke JPG, PNG, WebP dan ukuran maksimum 5 MB. Cloud name dan preset bukan secret, tetapi API secret Cloudinary tidak boleh memakai awalan `VITE_` atau dikirim ke browser.
- Nilai `VITE_CLOUDINARY_CLOUD_NAME` dan `VITE_CLOUDINARY_UPLOAD_PRESET` diset di hosting frontend sebelum build. Tanpa keduanya, upload gambar memberi pesan konfigurasi; semua profil dan proyek masih dapat memakai URL gambar.
- Password reset memakai token acak satu kali, hash token disimpan di Postgres, berlaku 1 jam, dan endpoint dibatasi rate limit.

Project baru berstatus `DRAFT`, portfolio baru unpublished. Pengguna perlu mempublikasikan project terlebih dahulu lalu mengaktifkan portfolio dari dashboard. Migrasi mengatur data lama sebagai privat agar tidak terbit tanpa persetujuan.

### CORS production
`backend/src/app.ts` hanya mengizinkan:
```ts
['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean)
```
Di production isi `FRONTEND_URL` dengan origin Vercel/Netlify/domain custom. Domain lain akan mendapat `CORS: false` dan request browser diblokir (bukan 204/403 backend, tetapi preflight gagal).

## Build & start commands

### Frontend (Vercel/Netlify)
- **Install:** `npm install` (di `frontend/`)
- **Build:** `npm run build`  → `tsc -b && vite build` (artefak di `frontend/dist`)
- **Output dir:** `dist`
- **Env:** `VITE_API_URL`

### Backend (Fly/Railway/Render)
- **Install:** `npm install` (di `backend/`)
- **Environment validation:** backend membutuhkan `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `RESEND_API_KEY`, dan `EMAIL_FROM`. Saat `NODE_ENV=production`, `JWT_SECRET` minimal 32 karakter dan `FRONTEND_URL` harus berupa HTTPS origin.
- **Generate (sekali sebelum build):** `npx prisma generate`  ← harus sebelum `tsc`, agar `@prisma/client` punya binary untuk `linux`/`windows` (schema sudah mengatur `binaryTargets`)
- **Build:** `npm run build`  → `tsc` (emit ke `backend/dist`)
- **Migrate (sekali per deploy, sebelum start):** `npx prisma migrate deploy`  ← **jangan** `migrate dev` di production
- **Start:** `npm start`  → `node dist/index.js` (listen di `PORT` host)
  - Alternatif start command untuk host yang butuh: `node backend/dist/index.js`

## Migrasi database — aman

Devfy memakai migrasi berurutan: inisialisasi, publikasi portfolio, dan role/audit admin. Di production selalu:
```bash
npx prisma migrate deploy   # apply migrations pending, fail jika divergen
npx prisma migrate status   # cek status (butuh DATABASE_URL reachable)
```
Jangan buat migrasi baru di server production — buat di lokal (`npx prisma migrate dev --name <nama>`), commit file migrasi, baru `migrate deploy`. Prisma `prisma.config.ts` menggunakan `engine: "classic"` — **jangan** butuh `--config` flag; `npx prisma -v` / `npx prisma validate` sekarang langsung menemukan `prisma.config.ts`.

## Health check & observability

- **Health endpoint:** `GET /api/health` → 200 (DB ok) atau 500 (DB unreachable). Gunakan sebagai health check HTTP di Fly/Render.
- **Logging:** backend `console.error` untuk DB failure & unhandled errors; di production tambahkan log drain host (Fly Logs, Render Logs). Untuk audit, gabungkan requestId/log structured di middleware di masa depan — saat ini minimal tetapi cukup untuk MVP.
- **Rate limit:** login `10 / 15 min`, register `5 / hour`, reset password `5 / hour` via `express-rate-limit` memory store. **Limitasi:** setiap instance punya counter sendiri — tidak dibagikan. Di scale horizontal hasilnya tidak konsisten; pindah ke Redis store (mis. `rate-limit-redis` + Upstash Redis) bila traffic tinggi.
- **Payload limit:** `express.json({ limit: '10kb' })` — mencegah upload raksasa; tingkatkan jika body legal lebih besar.

## HTTPS & Token

- Host otomatis pakai TLS (Vercel/Netlify/Fly). Backend tidak meng-terminasi TLS — biarkan edge host.
- JWT: `jsonwebtoken` HS256, `expiresIn: '1d'` (`backend/src/middleware/auth.ts`). Client menyimpan token di `localStorage` (MVP); untuk hardening berikutnya pertimbangkan cookie httpOnly + `SameSite=Lax` dan refresh token.
- Bila backend & frontend di domain berbeda, pastikan `Authorization: Bearer <token>` diteruskan — CORS default di backend tidak memblokir header Authorization.

## Backup & disaster recovery

- Postgres: aktifkan backup harian di provider (Neon point-in-time, Supabase daily backups). Export tambahan via `pg_dump` sebelum migrasi besar:
  ```bash
  pg_dump "$DATABASE_URL" > devfy_backup_$(date +%Y%m%d).sql
  ```
- Jaga `JWT_SECRET` & `DATABASE_URL` di vault/secret store; rotate secret hanya dengan window migrasi token.

## Git hygiene (penting di Windows/Linux)

Repo ini pernah menyimpan artefak `tsc` di samping sumber (`backend/src/index.js`, `backend/prisma.config.js`, dll.), yang membuat Prisma CLI salah memuat config (`.js` CommonJS) dan gagal. Artefak tersebut sudah dihapus dari repo dan dicegah lagi lewat `backend/.gitignore`:

```
/dist
/src/**/*.js   /src/**/*.js.map   /src/**/*.d.ts
/prisma.config.js   /prisma.config.d.ts*
```

Input `tsc` hanya `src` tanpa `src/__tests__` (lihat `backend/tsconfig.json`), output hanya ke `backend/dist/`. Jika `npx prisma -v` suatu saat lagi menyebut `Failed to parse syntax of config file ...prisma.config.js`, hapus file `.js` hasil build tersebut:

```bash
cd backend && rm -f prisma.config.js prisma.config.d.ts prisma.config.js.map prisma.config.d.ts.map
```

## Checklist predeploy lokal

```bash
cd backend && npx prisma validate && npm run db:status   # butuh DB reachable
cd backend && npm run build && npm test   # integration ditandai skipped bila tidak dijalankan
cd frontend && npm run build              # vite built
# set env host, lalu deploy dengan urutan:
#   backend: npm install → npx prisma migrate deploy → npm start
#   frontend: npm install → npm run build (VITE_API_URL diset)
# cek:
curl -s https://<backend>/api/health | jq
curl -s https://<frontend>/               # 200
```

Untuk tes integrasi lokal di PowerShell (perlu database lokal reachable), aktifkan opt-in terlebih dahulu:
```powershell
$env:RUN_LIVE_INTEGRATION = "1"
npm test -- integration.live.api.test.ts
Remove-Item Env:RUN_LIVE_INTEGRATION
```
