-- Prevent duplicate active appointments for the same provider start time
CREATE UNIQUE INDEX "Appointment_provider_startAt_active_unique"
ON "Appointment" ("providerId", "startAt")
WHERE "status" <> 'CANCELLED';

-- Idempotent booking retries
CREATE TABLE "BookingIdempotency" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "appointmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingIdempotency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookingIdempotency_key_key" ON "BookingIdempotency"("key");
CREATE UNIQUE INDEX "BookingIdempotency_appointmentId_key" ON "BookingIdempotency"("appointmentId");
CREATE INDEX "BookingIdempotency_userId_idx" ON "BookingIdempotency"("userId");

ALTER TABLE "BookingIdempotency" ADD CONSTRAINT "BookingIdempotency_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingIdempotency" ADD CONSTRAINT "BookingIdempotency_appointmentId_fkey"
FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
