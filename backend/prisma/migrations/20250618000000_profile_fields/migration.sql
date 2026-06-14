-- AlterTable User: extended profile fields
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "nationalCode" TEXT;
ALTER TABLE "User" ADD COLUMN "age" INTEGER;
ALTER TABLE "User" ADD COLUMN "address" TEXT;

CREATE UNIQUE INDEX "User_nationalCode_key" ON "User"("nationalCode");

-- Backfill firstName from fullName for existing users
UPDATE "User" SET "firstName" = "fullName" WHERE "firstName" IS NULL;

-- AlterTable ProviderProfile: specialization and address
ALTER TABLE "ProviderProfile" ADD COLUMN "specialization" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "address" TEXT;
