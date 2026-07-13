import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { UserRole, WardrobePhotoUploadedByRole, WardrobePhotoVisibility } from "@prisma/client";

import { WardrobePhotosService } from "./wardrobe-photos.service";

const createPrismaMock = () => ({
  booking: {
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  wardrobePhoto: {
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  }
});

const createMediaStorageMock = () => ({
  createPresignedUpload: jest.fn()
});

describe("WardrobePhotosService", () => {
  it("requires wardrobe photo metadata to belong to the uploading user", async () => {
    const prisma = createPrismaMock();
    const mediaStorage = createMediaStorageMock();
    const service = new WardrobePhotosService(mediaStorage as never, prisma as never);

    await expect(
      service.create("uploader-user", {
        category: "tops",
        uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER,
        storageKey: "dev/wardrobe/photo.jpg",
        url: "https://example.test/photo.jpg",
        userId: "different-user"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.wardrobePhoto.create).not.toHaveBeenCalled();
  });

  it("creates presigned upload metadata for the authenticated user", async () => {
    const prisma = createPrismaMock();
    const mediaStorage = createMediaStorageMock();
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", role: UserRole.CUSTOMER });
    mediaStorage.createPresignedUpload.mockResolvedValue({
      expiresAt: "2026-08-01T00:15:00.000Z",
      key: "wardrobe/user-1/photo.jpg",
      provider: "s3-compatible",
      publicUrl: "https://example.test/wardrobe/user-1/photo.jpg",
      uploadUrl: "https://uploads.example.test/wardrobe/user-1/photo.jpg"
    });
    prisma.wardrobePhoto.create.mockResolvedValue({
      id: "photo-1",
      storageKey: "wardrobe/user-1/photo.jpg",
      userId: "user-1"
    });
    const service = new WardrobePhotosService(mediaStorage as never, prisma as never);

    await expect(
      service.createUpload("user-1", {
        category: "outerwear",
        contentType: "image/jpeg",
        fileName: "Photo.JPG",
        tags: ["jacket"],
        uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER
      })
    ).resolves.toEqual(
      expect.objectContaining({
        photo: expect.objectContaining({ id: "photo-1" }),
        upload: expect.objectContaining({ uploadUrl: "https://uploads.example.test/wardrobe/user-1/photo.jpg" })
      })
    );
    expect(mediaStorage.createPresignedUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/jpeg",
        key: expect.stringMatching(/^wardrobe\/user-1\/\d+-photo\.jpg$/)
      })
    );
    expect(prisma.wardrobePhoto.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: ["jacket"],
          uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER,
          url: "https://example.test/wardrobe/user-1/photo.jpg",
          userId: "user-1",
          visibility: WardrobePhotoVisibility.PRIVATE
        })
      })
    );
  });

  it("requires booking-shared photos to include a booking", async () => {
    const prisma = createPrismaMock();
    const mediaStorage = createMediaStorageMock();
    prisma.user.findUnique.mockResolvedValue({ id: "user-1", role: UserRole.CUSTOMER });
    const service = new WardrobePhotosService(mediaStorage as never, prisma as never);

    await expect(
      service.create("user-1", {
        category: "tops",
        storageKey: "dev/wardrobe/photo.jpg",
        uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER,
        url: "https://example.test/photo.jpg",
        visibility: WardrobePhotoVisibility.BOOKING_SHARED
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("allows booking participants to view booking-shared wardrobe photos", async () => {
    const prisma = createPrismaMock();
    const mediaStorage = createMediaStorageMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfile: { userId: "customer-user-1" },
      shopperProfile: { userId: "shopper-user-1" }
    });
    prisma.wardrobePhoto.findMany.mockResolvedValue([{ id: "photo-1" }]);
    const service = new WardrobePhotosService(mediaStorage as never, prisma as never);

    await expect(service.findByBooking("booking-1", "shopper-user-1")).resolves.toEqual([{ id: "photo-1" }]);
    expect(prisma.wardrobePhoto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bookingId: "booking-1",
          visibility: WardrobePhotoVisibility.BOOKING_SHARED
        }
      })
    );
  });
});
