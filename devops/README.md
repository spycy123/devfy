# Panduan DevOps Devfy

Direktori ini memuat seluruh konfigurasi otomasi infrastruktur, containerization, dan alur CI/CD untuk proyek Devfy.

## Arsitektur Infrastruktur

```
                       +-------------------------+
                       |      Internet / User    |
                       +------------+------------+
                                    |
                                    v
                       +------------+------------+
                       |   Nginx Reverse Proxy   |
                       |       (Frontend)        |
                       +------------+------------+
                                    |
               +--------------------+--------------------+
               |                                         |
               v                                         v
   +-----------+-----------+                 +-----------+-----------+
   |   React Single Page   |                 |    Node.js / Express  |
   |      Application      |                 |       REST API        |
   +-----------------------+                 +-----------+-----------+
                                                         |
                                                         v
                                             +-----------+-----------+
                                             |       PostgreSQL      |
                                             |        Database       |
                                             +-----------------------+
```

## Komponen DevOps

1. **Docker Compose Lokal (`docker-compose.yml`)**
   Digunakan untuk menjalankan PostgreSQL 16 Alpine secara konsisten di lingkungan pengembangan lokal dengan volume persistence.
   Perintah eksekusi:
   ```bash
   docker compose up -d
   ```

2. **Containerization Production (`devops/docker/`)**
   - `backend.Dockerfile`: Multi-stage build Node.js 20 Alpine untuk meminimalkan ukuran image dan mengamankan production runtime.
   - `frontend.Dockerfile`: Multi-stage build Vite dan React yang disajikan melalui server Nginx berperforma tinggi.
   - `nginx.conf`: Konfigurasi reverse proxy lengkap dengan kompresi gzip dan caching aset statis.

3. **Continuous Integration (`.github/workflows/ci.yml`)**
   Pemeriksaan otomatis setiap kali ada `push` atau `pull request` ke branch `main`:
   - Validasi skema Prisma dan eksekusi Prisma Client generation.
   - Eksekusi automated unit test menggunakan Vitest.
   - Type-checking dan kompilasi bundle backend menggunakan TypeScript (`tsc`).
   - Linting kode frontend dengan ESLint.
   - Build bundle production frontend dengan Vite.

## Menjalankan Container Penuh

Untuk membangun dan menjalankan seluruh layanan menggunakan Docker:

```bash
# Menjalankan PostgreSQL saja untuk development lokal:
docker compose up -d postgres

# Membangun image backend:
docker build -t devfy-backend -f devops/docker/backend.Dockerfile .

# Membangun image frontend:
docker build --build-arg VITE_API_URL=http://localhost:5000/api -t devfy-frontend -f devops/docker/frontend.Dockerfile .
```
