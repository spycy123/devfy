# Devfy

Platform Web Full Stack Pembuat dan Showcase Portofolio Developer.

## Ringkasan Proyek

Devfy adalah aplikasi web monorepo modern yang dirancang untuk membantu mahasiswa dan developer pemula dalam membangun, mengelola, serta membagikan portofolio profesional mereka. Portofolio publik dapat diakses langsung melalui tautan `/u/:username` dan detail proyek melalui tautan `/u/:username/project/:projectId`.

Aplikasi ini mengintegrasikan sistem autentikasi pengguna, manajemen profil lengkap, pengelolaan proyek portofolio, verifikasi kepemilikan data, sistem moderasi administrator, serta antarmuka visual responsif bertema Deep Midnight Navy (`#0A0F29`) dan Vibrant Coral (`#FF6B6B`) yang dilengkapi efek 3D Parallax interaktif.

## Fitur Utama

### Manajemen Akun dan Autentikasi
* Registrasi akun baru dengan validasi username unik serta enkripsi kata sandi menggunakan bcrypt cost 12.
* Login berbasis JSON Web Token (JWT) dengan masa aktif 1 hari.
* Proteksi percobaan login dan registrasi berulang menggunakan rate limiting.
* Alur pemulihan kata sandi (forgot password dan reset password) terintegrasi layanan email Resend dengan token satu kali pakai berumur 1 jam.
* Pembatalan masa berlaku sesi secara otomatis saat terjadi pembaruan kata sandi.

### Manajemen Profil dan Portofolio
* Pengaturan identitas developer mencakup nama lengkap, username unik, biografi profesional, dan lokasi domisili.
* Pengelolaan daftar keahlian teknologi secara dinamis.
* Tautan profil sosial media seperti GitHub, LinkedIn, dan website portofolio pribadi.
* Dukungan unggah gambar avatar profil atau input melalui tautan URL eksternal.
* Pengaturan status publikasi portofolio (draft atau published).

### Manajemen Proyek Developer
* Pembuatan dan pengelolaan data proyek (judul, deskripsi, slug URL unik, daftar teknologi).
* Tautan repositori kode sumber dan tautan demonstrasi aplikasi langsung.
* Unggah thumbnail proyek hingga ukuran 5 MB (format JPG, PNG, WebP) atau menggunakan URL gambar eksternal.
* Status publikasi proyek independen (draft atau published).
* Verifikasi otorisasi kepemilikan untuk mencegah modifikasi data oleh pengguna lain.

### Portofolio Publik Responsif
* Akses publik langsung tanpa autentikasi melalui rute `/u/:username`.
* Halaman rincian proyek publik melalui rute `/u/:username/project/:projectId`.
* Hanya menampilkan profil yang telah dipublikasikan serta proyek dengan status published.
* Tata letak responsif yang optimal diakses dari perangkat mobile, tablet, maupun desktop.

### Desain Visual dan Efek Parallax Interaktif
* Palet warna bertema gelap dengan basis Deep Midnight Navy (`#0A0F29`) dan aksen Vibrant Coral (`#FF6B6B`).
* Sistem efek kedalaman 3D Parallax interaktif yang merespons pergerakan kursor dan orientasi layar.
* Kartu antarmuka interaktif dengan efek tilt 3D dan pencahayaan dinamis.
* Elemen ambient orbs bercahaya lembut pada latar belakang setiap halaman.
* Dukungan penuh standar aksesibilitas `prefers-reduced-motion` untuk menonaktifkan animasi bagi pengguna yang membutuhkannya.

## Tumpukan Teknologi

### Frontend Development
<p align="left">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind" alt="Frontend Development Stack" />
</p>

### Backend Development
<p align="left">
  <img src="https://skillicons.dev/icons?i=nodejs,express,ts,prisma" alt="Backend Development Stack" />
</p>

### Desain UI UX
<p align="left">
  <img src="https://skillicons.dev/icons?i=figma,tailwind,css" alt="UI UX Design Stack" />
</p>

### Quality Assurance
<p align="left">
  <img src="https://skillicons.dev/icons?i=vitest,postman" alt="Quality Assurance Stack" />
</p>

### DevOps dan Otomasi
<p align="left">
  <img src="https://skillicons.dev/icons?i=docker,githubactions,nginx" alt="DevOps and Automation Stack" />
</p>

### Arsitektur Database
<p align="left">
  <img src="https://skillicons.dev/icons?i=postgres,prisma" alt="Database Architecture Stack" />
</p>

## Struktur Direktori Monorepo

```
devfy/
├── .github/                 # Alur kerja otomasi CI/CD GitHub Actions
├── backend/                 # Layanan server Express dan skema Prisma ORM
├── database/                # Dokumentasi ERD, seed data, dan panduan database
├── devops/                  # Konfigurasi containerization dan reverse proxy
├── frontend/                # Aplikasi web React 19 dan antarmuka 3D Parallax
├── qa/                      # Rangkaian pengujian REST API dan matriks kasus uji
├── ui-ux/                   # Spesifikasi sistem desain, token warna, dan alur pengguna
├── docker-compose.yml       # Konfigurasi container PostgreSQL lokal
├── DEPLOYMENT.md            # Dokumentasi panduan deployment ke production
└── README.md                # Dokumentasi utama proyek
```

## Konfigurasi Environment

### Konfigurasi Backend
Buat berkas `.env` di dalam direktori `backend/` dengan menyalin berkas `backend/.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devfy_db
JWT_SECRET=rahasia_jwt_minimal_32_karakter_acak_dan_aman
PORT=5000
UPLOADS_DIR=./uploads
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=
EMAIL_FROM=Devfy <onboarding@resend.dev>
```

### Konfigurasi Frontend
Buat berkas `.env` di dalam direktori `frontend/` dengan menyalin berkas `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Panduan Instalasi dan Menjalankan Aplikasi

### Prasyarat Perangkat Lunak
* Node.js versi 20 atau versi yang lebih tinggi
* npm versi 10 atau versi yang lebih tinggi
* Docker Desktop atau instalasi PostgreSQL lokal pada port 5432

### Langkah Instalasi Dependensi
Jalankan instalasi dependensi pada masing masing direktori:

```bash
# Instalasi pada direktori backend
cd backend
npm install

# Instalasi pada direktori frontend
cd ../frontend
npm install
```

### Menjalankan Database PostgreSQL Menggunakan Docker
Jika memilih menjalankan database menggunakan Docker container:

```bash
docker run -d --name devfy_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=devfy_db -p 5432:5432 postgres:16-alpine
```

### Eksekusi Migrasi Database
Jalankan migrasi skema Prisma ke database lokal:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Menjalankan Server Pengembangan
Jalankan server backend dan frontend pada terminal terpisah:

```bash
# Terminal 1: Menjalankan backend server (berjalan di http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Menjalankan frontend client (berjalan di http://localhost:5173)
cd frontend
npm run dev
```

## Konfigurasi Fitur Tambahan

### Pengiriman Email Pemulihan Sandi
* Buat akun di platform Resend dan verifikasi domain pengirim Anda.
* Masukkan API key pada `RESEND_API_KEY` dan alamat pengirim pada `EMAIL_FROM` di `backend/.env`.
* Apabila belum dikonfigurasi, endpoint forgot password akan mengembalikan panduan aktivasi layanan email.

### Penyimpanan dan Unggah Gambar
* Gambar yang diunggah disimpan di direktori `backend/uploads/` dan disajikan secara statis melalui rute `/uploads/`.
* Ukuran maksimal file adalah 5 MB dengan format JPG, PNG, atau WebP.
* Untuk lingkungan production, disarankan menggunakan persistent volume mount pada path `UPLOADS_DIR` agar file tidak terhapus saat instance dimulai ulang.
* Pengguna juga dapat langsung menggunakan URL eksternal gambar tanpa melakukan unggah berkas.

## Dokumentasi Endpoint API

| Metode | Rute Endpoint | Autentikasi | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Publik | Mendaftarkan akun baru (rate limit 5 request per jam) |
| POST | `/api/auth/login` | Publik | Masuk akun dan menerima token JWT (rate limit 10 request per 15 menit) |
| POST | `/api/auth/password/forgot` | Publik | Permintaan tautan pemulihan kata sandi ke email |
| POST | `/api/auth/password/reset` | Publik | Mengatur ulang kata sandi dengan token pemulihan |
| GET | `/api/profile` | Bearer Token | Mengambil profil pengguna yang sedang login |
| PATCH | `/api/profile` | Bearer Token | Memperbarui profil, keahlian, dan tautan sosial |
| GET | `/api/projects` | Bearer Token | Mengambil daftar proyek milik pengguna |
| POST | `/api/projects` | Bearer Token | Menambahkan proyek baru |
| PATCH | `/api/projects/:id` | Bearer Token | Memperbarui informasi atau status publikasi proyek |
| DELETE | `/api/projects/:id` | Bearer Token | Menghapus proyek milik pengguna |
| POST | `/api/uploads/avatar` | Bearer Token | Mengunggah foto avatar pengguna |
| POST | `/api/uploads/project-thumbnail` | Bearer Token | Mengunggah gambar thumbnail proyek |
| GET | `/api/public/:username` | Publik | Mengambil data portofolio publik pengguna |
| GET | `/api/public/:username/projects/:slug` | Publik | Mengambil data rincian proyek publik |
| POST | `/api/admin/projects/:id/hide` | Admin Token | Menyembunyikan proyek yang melanggar ketentuan |
| POST | `/api/admin/projects/:id/restore` | Admin Token | Mengembalikan status visibilitas proyek |
| GET | `/api/health` | Publik | Memeriksa ketersediaan server dan database |

## Pengujian dan Build Production

### Perintah Pengujian
```bash
# Menjalankan pengujian otomatis backend
cd backend
npm test

# Menjalankan pengecekan konektivitas database
npm run db:check
```

### Perintah Build Production
```bash
# Kompilasi TypeScript backend
cd backend
npm run build

# Pengecekan kode dan build bundle frontend
cd frontend
npm run lint
npm run build
```

## Arsitektur Keamanan
* Filtrasi Data Publik: Endpoint publik tidak menyertakan email, hash password, maupun data internal pengguna.
* Keamanan Sandi: Menggunakan algoritma hash bcrypt dengan cost factor 12 dan token pemulihan berbasis SHA-256.
* Proteksi Brute Force: Penerapan rate limiter pada endpoint sensitif untuk mencegah serangan otomatis.
* Kebijakan CORS: Mengizinkan origin terdaftar pada lingkungan production dan fleksibel untuk kebutuhan pengujian lokal.
* Pembatasan Ukuran Request: Ukuran payload JSON dibatasi maksimum 10 KB untuk mencegah serangan denial of service.

## Referensi Deployment
Panduan terperinci mengenai deployment frontend ke Vercel atau Netlify, deployment backend ke Fly.io, Railway, atau Render, serta penyediaan database PostgreSQL serverless dapat dilihat pada berkas [DEPLOYMENT.md](./DEPLOYMENT.md).
