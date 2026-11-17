# Panduan Quality Assurance Devfy

Direktori ini memuat seluruh materi penjaminan mutu, pengujian otomatis, dan matriks validasi untuk aplikasi Devfy.

## Komponen Pengujian

1. [api-tests.http](./api-tests.http): Berkas pengujian REST API terpadu yang dapat langsung dijalankan dari editor (VS Code, Cursor, JetBrains) menggunakan ekstensi REST Client untuk menguji semua rute backend secara berurutan.
2. [test-matrix.md](./test-matrix.md): Dokumen matriks kasus uji menyeluruh yang mencakup fungsionalitas autentikasi, otorisasi data, keamanan token, dan pengujian responsivitas UI.

## Menjalankan Automated Tests

Aplikasi Devfy memiliki rangkaian pengujian unit dan integrasi otomatis yang dibangun menggunakan **Vitest** dan **Supertest**.

Jalankan perintah berikut di direktori `backend/`:

```bash
# Menjalankan seluruh pengujian unit otomatis:
npm test

# Menjalankan pengujian dalam mode interaktif (watch mode):
npm run test:watch

# Memeriksa konektivitas database tanpa mengekspos kredensial:
npm run db:check
```

## Menjalankan Linting Frontend

Untuk memastikan integritas tipe data TypeScript dan kepatuhan aturan React:

```bash
# Di direktori frontend:
npm run lint
```
