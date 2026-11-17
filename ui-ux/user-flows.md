# Alur Pengguna (User Flows) Devfy

Diagram berikut memetakan perjalanan pengguna (user journey) dari pengunjung awal hingga menjadi developer yang mempublikasikan portofolionya.

## 1. Alur Pengunjung dan Autentikasi

```mermaid
flowchart TD
    Start([Pengunjung Membuka Devfy]) --> Landing[Landing Page dengan 3D Parallax]
    Landing --> ChooseAuth{Pilih Aksi}
    
    ChooseAuth -->|Eksplorasi Publik| PublicView[Melihat Portofolio Developer di /u/:username]
    ChooseAuth -->|Daftar Akun Baru| Register[Halaman Registrasi /register]
    ChooseAuth -->|Masuk Akun| Login[Halaman Login /login]
    
    Register --> ValidateReg{Validasi Data}
    ValidateReg -->|Gagal| ShowRegError[Tampilkan Pesan Validasi]
    ValidateReg -->|Berhasil| AutoLogin[Kirim JWT Token & Arahkan]
    
    Login --> ValidateLogin{Cek Kredensial}
    ValidateLogin -->|Salah| ShowLoginError[Tampilkan Pesan Kesalahan]
    ValidateLogin -->|Benar| GenJWT[Simpan Token & Arahkan]
    
    Login -->|Lupa Password| ForgotPassword[Halaman /forgot-password]
    ForgotPassword --> SendResetEmail[Kirim Email Token Resend]
    SendResetEmail --> ResetPasswordPage[Halaman /reset-password?token=...]
    ResetPasswordPage --> Login
    
    AutoLogin --> Dashboard[Dashboard Pengguna /dashboard]
    GenJWT --> Dashboard
```

## 2. Alur Pengelolaan Portofolio dan Publikasi

```mermaid
flowchart TD
    Dashboard[Dashboard Pengguna] --> ManageProfile[Kelola Profil Developer]
    Dashboard --> ManageProjects[Kelola Proyek]
    Dashboard --> TogglePublish[Toggle Status Portofolio]
    
    ManageProfile --> EditBio[Ubah Bio, Lokasi & Skills]
    ManageProfile --> UploadAvatar[Unggah Avatar Foto / URL]
    ManageProfile --> UpdateSocials[Perbarui GitHub & LinkedIn]
    
    ManageProjects --> AddProject[Tambah Proyek Baru]
    AddProject --> FillProjectDetails[Isi Judul, Slug, Tech Stack & Links]
    FillProjectDetails --> UploadThumbnail[Unggah Thumbnail Gambar]
    UploadThumbnail --> SaveProjectDraft[Simpan Proyek sebagai DRAFT]
    
    SaveProjectDraft --> ReviewProject{Keputusan Publikasi Proyek}
    ReviewProject -->|Terbitkan| SetProjectPublished[Ubah Status ke PUBLISHED]
    ReviewProject -->|Simpan Privat| KeepDraft[Tetap Berstatus DRAFT]
    
    TogglePublish --> PublishCheck{Status Portofolio}
    PublishCheck -->|Published = True| LiveSite[Portofolio Aktif di /u/:username]
    PublishCheck -->|Published = False| PrivateSite[Halaman /u/:username Tidak Aktif]
    
    LiveSite --> VisitorExplore[Pengunjung Dapat Melihat Profil & Proyek PUBLISHED]
    VisitorExplore --> ProjectDetail[Pengunjung Melihat Rincian di /u/:username/project/:projectId]
```
