-- AlterTable
ALTER TABLE "ProviderRequest" ADD COLUMN "categoryId" TEXT,
ADD COLUMN "proposedCategoryName" TEXT,
ADD COLUMN "proposedCategoryDescription" TEXT,
ADD COLUMN "createdCategoryId" TEXT,
ADD COLUMN "proposedServiceName" TEXT,
ADD COLUMN "proposedServiceDescription" TEXT,
ADD COLUMN "proposedServicePrice" DECIMAL(10,2),
ADD COLUMN "proposedServiceDuration" INTEGER,
ADD COLUMN "createdServiceId" TEXT;

-- Backfill existing rows before NOT NULL constraints
UPDATE "ProviderRequest"
SET
  "proposedServiceName" = COALESCE("proposedServiceName", 'خدمت پیش‌فرض'),
  "proposedServicePrice" = COALESCE("proposedServicePrice", 0),
  "proposedServiceDuration" = COALESCE("proposedServiceDuration", 30)
WHERE "proposedServiceName" IS NULL;

ALTER TABLE "ProviderRequest" ALTER COLUMN "proposedServiceName" SET NOT NULL;
ALTER TABLE "ProviderRequest" ALTER COLUMN "proposedServicePrice" SET NOT NULL;
ALTER TABLE "ProviderRequest" ALTER COLUMN "proposedServiceDuration" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_createdCategoryId_fkey" FOREIGN KEY ("createdCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_createdServiceId_fkey" FOREIGN KEY ("createdServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
