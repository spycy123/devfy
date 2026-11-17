-- Seed Data Devfy untuk Pengujian Lokal
-- Password untuk akun contoh adalah: Password123!
-- Hash bcrypt cost 12 untuk 'Password123!': $2a$12$K1r.mZ8a9uL1cZ0f6d2eOuA2rQ1Xv7yZ3lM0p9s8w7q6e5r4t3y2u

INSERT INTO "User" (
    "id",
    "name",
    "username",
    "email",
    "passwordHash",
    "globalRole",
    "tokenVersion",
    "bio",
    "skills",
    "avatarUrl",
    "location",
    "githubUrl",
    "linkedinUrl",
    "websiteUrl",
    "portfolioPublished",
    "createdAt",
    "updatedAt"
) VALUES (
    'usr_demo_developer_01',
    'Ahmad Rizki',
    'ahmadrizki',
    'ahmad@devfy.local',
    '$2a$12$eA.Xb1V4nQ8vJzL2cW3eDuV3pS2aT5rU6kI7mB8nO9wP1qR2sT3u',
    'DEVELOPER',
    0,
    'Full Stack Engineer yang antusias dalam pengembangan arsitektur cloud, performa web modern, dan sistem terdistribusi.',
    ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'Bandung, Indonesia',
    'https://github.com/ahmadrizki',
    'https://linkedin.com/in/ahmadrizki',
    'https://ahmadrizki.dev',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("username") DO NOTHING;

INSERT INTO "Project" (
    "id",
    "title",
    "slug",
    "description",
    "techStack",
    "thumbnailUrl",
    "repositoryUrl",
    "demoUrl",
    "status",
    "moderationHidden",
    "ownerId",
    "createdAt",
    "updatedAt"
) VALUES (
    'prj_demo_01',
    'Cloud Cost Optimizer',
    'cloud-cost-optimizer',
    'Aplikasi monitoring dan optimasi biaya infrastruktur multi-cloud secara otomatis menggunakan analitik prediktif.',
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    'https://github.com/ahmadrizki/cloud-cost-optimizer',
    'https://cloud-optimizer.devfy.local',
    'PUBLISHED',
    false,
    'usr_demo_developer_01',
    NOW(),
    NOW()
),
(
    'prj_demo_02',
    'Real-time Collaborative Canvas',
    'realtime-collaborative-canvas',
    'Platform papan tulis digital berbasis WebSocket yang memungkinkan kolaborasi tim teknis dalam mendesain diagram sistem.',
    ARRAY['React', 'Tailwind CSS', 'WebSocket', 'Node.js'],
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    'https://github.com/ahmadrizki/collaborative-canvas',
    'https://canvas.devfy.local',
    'PUBLISHED',
    false,
    'usr_demo_developer_01',
    NOW(),
    NOW()
) ON CONFLICT ("ownerId", "slug") DO NOTHING;
