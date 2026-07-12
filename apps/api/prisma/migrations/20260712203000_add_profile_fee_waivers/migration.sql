ALTER TABLE "CustomerProfile"
ADD COLUMN "feesWaived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "feeWaiverReason" TEXT,
ADD COLUMN "feeWaivedAt" TIMESTAMP(3),
ADD COLUMN "feeWaivedByUserId" TEXT;

ALTER TABLE "ShopperProfile"
ADD COLUMN "feesWaived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "feeWaiverReason" TEXT,
ADD COLUMN "feeWaivedAt" TIMESTAMP(3),
ADD COLUMN "feeWaivedByUserId" TEXT;
