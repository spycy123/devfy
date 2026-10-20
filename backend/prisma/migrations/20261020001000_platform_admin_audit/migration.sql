CREATE TYPE "GlobalRole" AS ENUM ('DEVELOPER', 'PLATFORM_ADMIN');

ALTER TABLE "User"
ADD COLUMN "globalRole" "GlobalRole" NOT NULL DEFAULT 'DEVELOPER';

ALTER TABLE "Project"
ADD COLUMN "moderationHidden" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_targetId_createdAt_idx" ON "AuditLog"("targetId", "createdAt");

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
