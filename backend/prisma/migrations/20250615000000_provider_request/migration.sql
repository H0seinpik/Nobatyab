-- Provider applications (users requesting to become providers)
CREATE TYPE "ProviderRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "ProviderRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ProviderRequestStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProviderRequest_status_idx" ON "ProviderRequest"("status");
CREATE INDEX "ProviderRequest_userId_idx" ON "ProviderRequest"("userId");

CREATE UNIQUE INDEX "ProviderRequest_userId_pending_unique"
ON "ProviderRequest"("userId")
WHERE "status" = 'PENDING';

ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
