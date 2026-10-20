CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "portfolioPublished" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Project"
ADD COLUMN "slug" TEXT,
ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT';

UPDATE "Project"
SET "slug" =
  COALESCE(
    NULLIF(
      TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER("title"), '[^a-z0-9]+', '-', 'g')),
      ''
    ),
    'project'
  ) || '-' || "id";

ALTER TABLE "Project"
ALTER COLUMN "slug" SET NOT NULL;

DROP INDEX "Project_ownerId_idx";

CREATE UNIQUE INDEX "Project_ownerId_slug_key" ON "Project"("ownerId", "slug");
CREATE INDEX "Project_ownerId_status_idx" ON "Project"("ownerId", "status");

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

ALTER TABLE "PasswordResetToken"
ADD CONSTRAINT "PasswordResetToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
