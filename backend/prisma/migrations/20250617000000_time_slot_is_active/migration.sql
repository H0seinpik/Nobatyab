ALTER TABLE "TimeSlot" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "TimeSlot_providerId_date_isActive_idx" ON "TimeSlot"("providerId", "date", "isActive");
