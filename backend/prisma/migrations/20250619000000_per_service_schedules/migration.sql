-- Per-service working hours and time slots

-- WorkingHours: add providerServiceId, migrate data, drop providerId
ALTER TABLE "WorkingHours" ADD COLUMN IF NOT EXISTS "providerServiceId" TEXT;

-- Duplicate provider-level hours onto each ProviderService (keep providerId until drop)
INSERT INTO "WorkingHours" (
  "id",
  "providerId",
  "providerServiceId",
  "dayOfWeek",
  "startTime",
  "endTime",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  'mwh_' || substr(md5(random()::text || wh."id" || ps."id"), 1, 21),
  wh."providerId",
  ps."id",
  wh."dayOfWeek",
  wh."startTime",
  wh."endTime",
  wh."isActive",
  NOW(),
  NOW()
FROM "WorkingHours" wh
INNER JOIN "ProviderService" ps ON ps."providerId" = wh."providerId"
WHERE wh."providerServiceId" IS NULL;

DELETE FROM "WorkingHours" WHERE "providerServiceId" IS NULL;

ALTER TABLE "WorkingHours" DROP CONSTRAINT IF EXISTS "WorkingHours_providerId_fkey";
DROP INDEX IF EXISTS "WorkingHours_providerId_dayOfWeek_idx";
ALTER TABLE "WorkingHours" DROP COLUMN IF EXISTS "providerId";

ALTER TABLE "WorkingHours" ALTER COLUMN "providerServiceId" SET NOT NULL;
ALTER TABLE "WorkingHours" DROP CONSTRAINT IF EXISTS "WorkingHours_providerServiceId_fkey";
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_providerServiceId_fkey"
  FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "WorkingHours_providerServiceId_dayOfWeek_idx"
  ON "WorkingHours"("providerServiceId", "dayOfWeek");

-- TimeSlot: add providerServiceId, migrate data, update unique index
ALTER TABLE "TimeSlot" ADD COLUMN IF NOT EXISTS "providerServiceId" TEXT;

UPDATE "TimeSlot" ts
SET "providerServiceId" = a."providerServiceId"
FROM "Appointment" a
WHERE ts."appointmentId" = a."id" AND ts."providerServiceId" IS NULL;

UPDATE "TimeSlot" ts
SET "providerServiceId" = sub."id"
FROM (
  SELECT DISTINCT ON (ps."providerId") ps."providerId", ps."id"
  FROM "ProviderService" ps
  ORDER BY ps."providerId", ps."createdAt" ASC
) sub
WHERE ts."providerId" = sub."providerId" AND ts."providerServiceId" IS NULL;

DELETE FROM "TimeSlot" WHERE "providerServiceId" IS NULL;

DROP INDEX IF EXISTS "TimeSlot_providerId_date_startTime_key";

ALTER TABLE "TimeSlot" ALTER COLUMN "providerServiceId" SET NOT NULL;
ALTER TABLE "TimeSlot" DROP CONSTRAINT IF EXISTS "TimeSlot_providerServiceId_fkey";
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_providerServiceId_fkey"
  FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "TimeSlot_providerServiceId_date_startTime_key"
  ON "TimeSlot"("providerServiceId", "date", "startTime");
CREATE INDEX IF NOT EXISTS "TimeSlot_providerServiceId_date_isBooked_idx"
  ON "TimeSlot"("providerServiceId", "date", "isBooked");
CREATE INDEX IF NOT EXISTS "TimeSlot_providerServiceId_date_isActive_idx"
  ON "TimeSlot"("providerServiceId", "date", "isActive");
