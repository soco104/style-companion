ALTER TYPE "UploadedMediaPurpose" ADD VALUE 'WARDROBE';

CREATE TABLE "ShopperPricingPackage" (
  "id" TEXT NOT NULL,
  "shopperProfileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sessionCount" INTEGER NOT NULL,
  "pricePerSessionCents" INTEGER NOT NULL,
  "totalPriceCents" INTEGER NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShopperPricingPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShopperStylePreference" (
  "id" TEXT NOT NULL,
  "shopperProfileId" TEXT NOT NULL,
  "styleTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredBrands" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "avoidedStyles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShopperStylePreference_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WardrobePhoto" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "title" TEXT,
  "caption" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "metadata" JSONB,
  "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WardrobePhoto_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Booking" ADD COLUMN "pricingPackageId" TEXT;

CREATE INDEX "ShopperPricingPackage_shopperProfileId_isActive_idx" ON "ShopperPricingPackage"("shopperProfileId", "isActive");
CREATE INDEX "ShopperStylePreference_shopperProfileId_idx" ON "ShopperStylePreference"("shopperProfileId");
CREATE UNIQUE INDEX "WardrobePhoto_storageKey_key" ON "WardrobePhoto"("storageKey");
CREATE INDEX "WardrobePhoto_userId_createdAt_idx" ON "WardrobePhoto"("userId", "createdAt");
CREATE INDEX "WardrobePhoto_moderationStatus_idx" ON "WardrobePhoto"("moderationStatus");
CREATE INDEX "Booking_pricingPackageId_idx" ON "Booking"("pricingPackageId");
CREATE INDEX "Booking_shopperProfileId_status_scheduledStartAt_scheduledEndAt_idx" ON "Booking"("shopperProfileId", "status", "scheduledStartAt", "scheduledEndAt");
CREATE INDEX "Booking_customerProfileId_status_scheduledStartAt_scheduledEndAt_idx" ON "Booking"("customerProfileId", "status", "scheduledStartAt", "scheduledEndAt");

ALTER TABLE "ShopperPricingPackage" ADD CONSTRAINT "ShopperPricingPackage_shopperProfileId_fkey" FOREIGN KEY ("shopperProfileId") REFERENCES "ShopperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopperStylePreference" ADD CONSTRAINT "ShopperStylePreference_shopperProfileId_fkey" FOREIGN KEY ("shopperProfileId") REFERENCES "ShopperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WardrobePhoto" ADD CONSTRAINT "WardrobePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pricingPackageId_fkey" FOREIGN KEY ("pricingPackageId") REFERENCES "ShopperPricingPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
