# Panduan UI/UX Devfy

Direktori ini memuat seluruh dokumentasi sistem desain, spesifikasi interaktivitas 3D Parallax, dan alur pengguna untuk aplikasi Devfy.

## Dokumen dalam Direktori Ini

1. [design-system.md](./design-system.md): Spesifikasi lengkap token warna (Deep Midnight Navy `#0A0F29`, Vibrant Coral `#FF6B6B`, Slate `#9AA5CE`), tipografi, gaya tombol, kontrol formulir, dan indikator status.
2. [parallax-specs.md](./parallax-specs.md): Dokumentasi teknis sistem interaktivitas 3D Parallax, formula matematika rotasi kursor, aksen ambient orbs, dan standar aksesibilitas `prefers-reduced-motion`.
3. [user-flows.md](./user-flows.md): Diagram visual alur interaksi pengguna mulai dari pendaftaran akun, pengelolaan proyek, hingga publikasi portofolio publik.

## Integrasi dalam Kode Sumber

Desain dan aset dalam dokumen ini diimplementasikan secara langsung pada kode:
- Variabel CSS dan Token: `frontend/src/index.css` dan `frontend/src/App.css`
- Komponen 3D Parallax: `frontend/src/components/parallax/`
- Halaman Antarmuka: `frontend/src/pages/`
