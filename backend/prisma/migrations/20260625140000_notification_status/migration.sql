-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill status from type
UPDATE "Notification" SET "status" = 'PENDING' WHERE "type" IN (
  'APPOINTMENT_BOOKED',
  'PAYMENT_PENDING',
  'NEW_APPOINTMENT_BOOKED',
  'NEW_PROVIDER_REQUEST',
  'NEW_SERVICE_REQUEST',
  'PAYMENT_FAILED'
);

UPDATE "Notification" SET "status" = 'CONFIRMED' WHERE "type" IN (
  'APPOINTMENT_CONFIRMED',
  'PROVIDER_REQUEST_APPROVED',
  'SERVICE_REQUEST_APPROVED'
);

UPDATE "Notification" SET "status" = 'CANCELLED' WHERE "type" IN (
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_CANCELLED_BY_USER',
  'PROVIDER_REQUEST_REJECTED',
  'SERVICE_REQUEST_REJECTED'
);

UPDATE "Notification" SET "status" = 'COMPLETED' WHERE "type" IN (
  'PAYMENT_COMPLETED',
  'APPOINTMENT_COMPLETED',
  'PAYMENT_REFUNDED'
);

-- CreateIndex
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt");
