# Panduan Database Devfy

Direktori ini berisi arsitektur data, diagram relasi, dataset pengujian (seeds), dan prosedur pemeliharaan database PostgreSQL untuk Devfy.

## Ikhtisar Arsitektur Database

Devfy menggunakan **PostgreSQL 16** yang dikelola menggunakan **Prisma ORM**.
Skema utama didefinisikan pada berkas: `backend/prisma/schema.prisma`.

## Berkas dalam Direktori Ini

1. [erd.md](./erd.md): Diagram Relasi Entitas visual berbasis Mermaid, lengkap dengan definisi indeks performa dan foreign keys.
2. [seeds/sample-data.sql](./seeds/sample-data.sql): Kumpulan data developer dan proyek contoh yang dapat langsung diimpor untuk mendemonstrasikan portofolio publik.

## Operasi dan Perintah Database

Jalankan perintah berikut dari direktori `backend/`:

```bash
# Melakukan migrasi schema ke database lokal:
npx prisma migrate dev --name <nama_migrasi>

# Menerapkan migrasi pada lingkungan staging atau production:
npx prisma migrate deploy

# Memeriksa status kesehatan dan sinkronisasi migrasi:
npm run db:status

# Membuka GUI interaktif Prisma Studio untuk meninjau data secara visual:
npx prisma studio
```

## Prosedur Cadangan dan Pemulihan (Backup & Restore)

Untuk membuat cadangan (dump) database PostgreSQL dari container Docker:

```bash
# Membuat berkas backup .sql:
docker exec -t devfy_postgres pg_dump -U devfy_user devfy_db > devfy_backup.sql

# Memulihkan data dari berkas backup:
cat devfy_backup.sql | docker exec -i devfy_postgres psql -U devfy_user -d devfy_db
```
