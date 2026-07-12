CREATE TYPE "WardrobePhotoVisibility" AS ENUM ('PRIVATE', 'BOOKING_SHARED', 'PUBLIC_PROFILE');
CREATE TYPE "WardrobePhotoUploadedByRole" AS ENUM ('CUSTOMER', 'SHOPPER', 'ADMIN');

ALTER TABLE "WardrobePhoto"
  ADD COLUMN "bookingId" TEXT,
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'uncategorized',
  ADD COLUMN "visibility" "WardrobePhotoVisibility" NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN "uploadedByRole" "WardrobePhotoUploadedByRole" NOT NULL DEFAULT 'CUSTOMER';

CREATE INDEX "WardrobePhoto_bookingId_idx" ON "WardrobePhoto"("bookingId");
CREATE INDEX "WardrobePhoto_visibility_idx" ON "WardrobePhoto"("visibility");
CREATE INDEX "WardrobePhoto_uploadedByRole_idx" ON "WardrobePhoto"("uploadedByRole");

ALTER TABLE "WardrobePhoto" ADD CONSTRAINT "WardrobePhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
