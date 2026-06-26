-- CreateEnum
CREATE TYPE "NotificationRecipientRole" AS ENUM ('USER', 'PROVIDER', 'ADMIN');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "recipientRole" "NotificationRecipientRole" NOT NULL DEFAULT 'USER';

-- Backfill provider-targeted types
UPDATE "Notification" SET "recipientRole" = 'PROVIDER' WHERE "type" IN (
  'NEW_APPOINTMENT_BOOKED',
  'APPOINTMENT_CANCELLED_BY_USER'
);

-- Provider payment completed (same type as user/admin — disambiguate by actionUrl)
UPDATE "Notification" SET "recipientRole" = 'PROVIDER'
WHERE "type" = 'PAYMENT_COMPLETED' AND "actionUrl" = '/provider/appointments';

-- Backfill admin-targeted types
UPDATE "Notification" SET "recipientRole" = 'ADMIN' WHERE "type" IN (
  'NEW_PROVIDER_REQUEST',
  'NEW_SERVICE_REQUEST'
);

UPDATE "Notification" SET "recipientRole" = 'ADMIN'
WHERE "type" = 'NEW_APPOINTMENT_BOOKED' AND "actionUrl" LIKE '/admin/%';

UPDATE "Notification" SET "recipientRole" = 'ADMIN'
WHERE "type" IN ('APPOINTMENT_CANCELLED', 'PAYMENT_COMPLETED') AND "actionUrl" LIKE '/admin/%';

-- DropIndex
DROP INDEX IF EXISTS "Notification_userId_readAt_createdAt_idx";
DROP INDEX IF EXISTS "Notification_userId_status_createdAt_idx";

-- CreateIndex
CREATE INDEX "Notification_userId_recipientRole_readAt_createdAt_idx" ON "Notification"("userId", "recipientRole", "readAt", "createdAt");
CREATE INDEX "Notification_userId_recipientRole_status_createdAt_idx" ON "Notification"("userId", "recipientRole", "status", "createdAt");
