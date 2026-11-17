# Matriks Kasus Uji Quality Assurance Devfy

Dokumen ini mendokumentasikan skenario pengujian fungsional, keamanan, validasi, dan alur integrasi aplikasi Devfy.

## 1. Modul Autentikasi dan Akun

| ID Uji | Skenario Pengujian | Input Data | Ekspektasi Hasil | Kategori |
| :--- | :--- | :--- | :--- | :--- |
| AUTH-01 | Registrasi dengan data valid | Email baru, username unik, password >= 8 karakter | HTTP 201, User berhasil dibuat, password di-hash | Fungsional |
| AUTH-02 | Registrasi dengan email duplikat | Email yang sudah terdaftar | HTTP 400 / 409, pesan kesalahan email sudah digunakan | Validasi |
| AUTH-03 | Registrasi dengan username duplikat | Username yang sudah ada | HTTP 400 / 409, pesan kesalahan username sudah digunakan | Validasi |
| AUTH-04 | Login dengan kredensial benar | Email dan password valid | HTTP 200, mengembalikan JWT Bearer Token | Fungsional |
| AUTH-05 | Login dengan password salah | Email valid, password salah | HTTP 401, pesan kredensial tidak valid | Keamanan |
| AUTH-06 | Proteksi Brute Force pada Login | Mengirim 11 percobaan request dalam 15 menit | HTTP 429 Too Many Requests | Keamanan |
| AUTH-07 | Forgot Password dengan email valid | Email terdaftar | HTTP 200, token reset dibuat dengan masa aktif 1 jam | Fungsional |
| AUTH-08 | Reset Password dengan token valid | Token SHA-256 valid, password baru | HTTP 200, tokenVersion naik, token lama hangus | Keamanan |

## 2. Modul Profil dan Portofolio

| ID Uji | Skenario Pengujian | Input Data | Ekspektasi Hasil | Kategori |
| :--- | :--- | :--- | :--- | :--- |
| PROF-01 | Ambil profil terautentikasi | Request dengan Bearer Token valid | HTTP 200, detail profil pengguna | Fungsional |
| PROF-02 | Ambil profil tanpa token | Request tanpa header Authorization | HTTP 401 Unauthorized | Keamanan |
| PROF-03 | Perbarui bio, skills, dan links | Array keahlian valid, URL valid | HTTP 200, data profil diperbarui | Fungsional |
| PROF-04 | Toggle visibilitas portofolio | Mengubah portfolioPublished ke true/false | HTTP 200, status publikasi langsung berefek di `/u/:username` | Fungsional |

## 3. Modul Proyek Developer

| ID Uji | Skenario Pengujian | Input Data | Ekspektasi Hasil | Kategori |
| :--- | :--- | :--- | :--- | :--- |
| PROJ-01 | Buat proyek baru | Judul, slug unik, deskripsi, techStack | HTTP 201, default status DRAFT | Fungsional |
| PROJ-02 | Buat proyek dengan slug duplikat | Slug yang sama pada pemilik yang sama | HTTP 400 / 409 penolakan duplikasi | Validasi |
| PROJ-03 | Edit proyek milik sendiri | ID proyek milik pengguna | HTTP 200, data proyek diperbarui | Fungsional |
| PROJ-04 | Edit proyek milik pengguna lain | ID proyek milik pengguna lain | HTTP 403 Forbidden atau 404 Not Found | Keamanan |
| PROJ-05 | Hapus proyek | ID proyek valid milik sendiri | HTTP 200, proyek dihapus permanen | Fungsional |

## 4. Modul Portofolio Publik

| ID Uji | Skenario Pengujian | Input Data | Ekspektasi Hasil | Kategori |
| :--- | :--- | :--- | :--- | :--- |
| PUB-01 | Akses portofolio yang diterbitkan | Username dengan portfolioPublished = true | HTTP 200, profil dan daftar proyek berstatus PUBLISHED | Fungsional |
| PUB-02 | Akses portofolio yang masih draft | Username dengan portfolioPublished = false | HTTP 404 Not Found atau pesan belum dipublikasikan | Fungsional |
| PUB-03 | Proyek berstatus DRAFT pada halaman publik | Akun memiliki proyek PUBLISHED dan DRAFT | Hanya proyek berstatus PUBLISHED yang muncul | Keamanan |
| PUB-04 | Proteksi data sensitif publik | Inspeksi respons payload endpoint publik | Email, passwordHash, dan id internal tidak bocor | Keamanan |

## 5. Modul Desain dan Antarmuka (UI/UX)

| ID Uji | Skenario Pengujian | Ekspektasi Hasil |
| :--- | :--- | :--- |
| UI-01 | Responsivitas Tampilan | Tampilan menyesuaikan sempurna pada resolusi Mobile (<640px), Tablet (768px), dan Desktop (>1024px) |
| UI-02 | Interaktivitas 3D Parallax | Orbs dan kartu bergerak dinamis mengikuti posisi pointer mouse dan sensor kemiringan perangkat |
| UI-03 | Mode Reduced Motion | Animasi dan efek 3D dinonaktifkan secara otomatis saat browser menyetel `prefers-reduced-motion: reduce` |
| UI-04 | Konsistensi Kontras Warna | Teks putih `#F7F8FD` dan aksen coral `#FF6B6B` memiliki kontras tinggi yang mudah dibaca di atas canvas `#0A0F29` |
