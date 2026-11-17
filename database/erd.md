# Entity Relationship Diagram Devfy

Berikut adalah struktur hubungan antar entitas pada database PostgreSQL yang diatur melalui Prisma ORM.

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    User ||--o{ PasswordResetToken : "requests"
    User ||--o{ AuditLog : "acts as admin"

    User {
        string id PK "cuid"
        string name "Full Name"
        string username UK "Unique Handle"
        string email UK "Unique Email Address"
        string passwordHash "Bcrypt Hash"
        string globalRole "DEVELOPER | PLATFORM_ADMIN"
        int tokenVersion "Session Invalidation Counter"
        text bio "Developer Bio"
        string_array skills "List of Tech Skills"
        string avatarUrl "Profile Image URL"
        string location "Geographic Location"
        string githubUrl "GitHub Link"
        string linkedinUrl "LinkedIn Link"
        string websiteUrl "Personal Website Link"
        boolean portfolioPublished "Public Visibility Flag"
        datetime createdAt "Timestamp Created"
        datetime updatedAt "Timestamp Updated"
    }

    Project {
        string id PK "cuid"
        string title "Project Title"
        string slug "URL Slug"
        text description "Detailed Description"
        string_array techStack "Technologies Used"
        string thumbnailUrl "Cover Image URL"
        string repositoryUrl "Source Code URL"
        string demoUrl "Live Demo URL"
        string status "DRAFT | PUBLISHED"
        boolean moderationHidden "Admin Hide Flag"
        string ownerId FK "References User.id (Cascade)"
        datetime createdAt "Timestamp Created"
        datetime updatedAt "Timestamp Updated"
    }

    PasswordResetToken {
        string id PK "cuid"
        string tokenHash UK "SHA-256 Token Hash"
        string userId FK "References User.id (Cascade)"
        datetime expiresAt "Token Expiration Time"
        datetime createdAt "Timestamp Created"
    }

    AuditLog {
        string id PK "cuid"
        string actorId FK "References User.id (Restrict)"
        string action "Admin Action Type"
        string targetId "Target Entity ID"
        datetime createdAt "Timestamp Created"
    }
```

## Karakteristik dan Indeks Database

1. **Integritas Relasi**:
   - `User` ke `Project`: Relasi 1 ke N dengan `onDelete: Cascade`. Menghapus akun otomatis menghapus seluruh proyek miliknya.
   - `User` ke `PasswordResetToken`: Relasi 1 ke N dengan `onDelete: Cascade`. Menghapus akun otomatis membersihkan token pemulihan terkait.
   - `User` ke `AuditLog`: Relasi 1 ke N dengan `onDelete: Restrict`. Log audit admin dipertahankan dan akun admin tidak bisa dihapus jika meninggalkan riwayat audit.

2. **Indeks Performa (Indexes)**:
   - `Project`:
     - Unique Composite Index: `[ownerId, slug]` (Mencegah duplikasi slug proyek dalam akun yang sama).
     - Composite Index: `[ownerId, status]` (Mempercepat query filter proyek aktif di dashboard).
   - `PasswordResetToken`:
     - Index: `[userId]` (Pencarian token milik pengguna tertentu).
     - Index: `[expiresAt]` (Pembersihan token kadaluwarsa secara berkala).
   - `AuditLog`:
     - Composite Index: `[actorId, createdAt]` (Audit trail per administrator).
     - Composite Index: `[targetId, createdAt]` (Audit trail per target proyek/pengguna).
