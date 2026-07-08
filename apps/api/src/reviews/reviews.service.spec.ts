import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BookingStatus, ModerationStatus } from "@prisma/client";

import { ReviewsService } from "./reviews.service";

const createPrismaMock = () => ({
  booking: {
    findUnique: jest.fn()
  },
  review: {
    aggregate: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  reviewResponse: {
    create: jest.fn(),
    update: jest.fn()
  },
  shopperProfile: {
    update: jest.fn()
  }
});

const reviewDto = {
  body: "Great session.",
  bookingId: "booking-1",
  customerProfileId: "customer-profile-1",
  rating: 5,
  shopperProfileId: "shopper-profile-1"
};

describe("ReviewsService", () => {
  it("rejects reviews for bookings that are not completed", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      ...reviewDto,
      id: "booking-1",
      review: null,
      status: BookingStatus.ACCEPTED
    });
    const service = new ReviewsService(prisma as never);

    await expect(service.create(reviewDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects reviews from a different customer profile", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "other-customer-profile",
      id: "booking-1",
      review: null,
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.COMPLETED
    });
    const service = new ReviewsService(prisma as never);

    await expect(service.create(reviewDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates pending reviews for completed bookings", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "customer-profile-1",
      id: "booking-1",
      review: null,
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.COMPLETED
    });
    prisma.review.create.mockResolvedValue({
      ...reviewDto,
      moderationStatus: ModerationStatus.PENDING
    });
    const service = new ReviewsService(prisma as never);

    await expect(service.create(reviewDto)).resolves.toEqual({
      ...reviewDto,
      moderationStatus: ModerationStatus.PENDING
    });
    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...reviewDto,
          moderationStatus: ModerationStatus.PENDING
        }
      })
    );
  });

  it("prevents duplicate reviews for a booking", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "customer-profile-1",
      id: "booking-1",
      review: { id: "review-1" },
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.COMPLETED
    });
    const service = new ReviewsService(prisma as never);

    await expect(service.create(reviewDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("allows only the reviewed shopper to respond", async () => {
    const prisma = createPrismaMock();
    prisma.review.findUnique.mockResolvedValue({
      id: "review-1",
      response: null,
      shopperProfileId: "shopper-profile-1"
    });
    const service = new ReviewsService(prisma as never);

    await expect(
      service.createResponse("review-1", {
        body: "Thank you!",
        shopperProfileId: "different-shopper-profile"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws when responding to a missing review", async () => {
    const prisma = createPrismaMock();
    prisma.review.findUnique.mockResolvedValue(null);
    const service = new ReviewsService(prisma as never);

    await expect(
      service.createResponse("missing", {
        body: "Thank you!",
        shopperProfileId: "shopper-profile-1"
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents duplicate shopper responses for a review", async () => {
    const prisma = createPrismaMock();
    prisma.review.findUnique.mockResolvedValue({
      id: "review-1",
      response: { id: "response-1" },
      shopperProfileId: "shopper-profile-1"
    });
    const service = new ReviewsService(prisma as never);

    await expect(
      service.createResponse("review-1", {
        body: "Thank you!",
        shopperProfileId: "shopper-profile-1"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates shopper average rating from approved reviews after approval", async () => {
    const prisma = createPrismaMock();
    prisma.review.update.mockResolvedValue({
      id: "review-1",
      moderationStatus: ModerationStatus.APPROVED,
      shopperProfileId: "shopper-profile-1"
    });
    prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.6666666667 },
      _count: { _all: 3 }
    });
    const service = new ReviewsService(prisma as never);

    await expect(
      service.moderateReview("review-1", {
        moderationStatus: ModerationStatus.APPROVED,
        moderatedByUserId: "admin-1"
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: "review-1",
        moderationStatus: ModerationStatus.APPROVED
      })
    );

    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          moderationStatus: ModerationStatus.APPROVED,
          publishedAt: expect.any(Date)
        }),
        where: { id: "review-1" }
      })
    );
    expect(prisma.review.aggregate).toHaveBeenCalledWith({
      _avg: { rating: true },
      _count: { _all: true },
      where: {
        moderationStatus: ModerationStatus.APPROVED,
        shopperProfileId: "shopper-profile-1"
      }
    });
    expect(prisma.shopperProfile.update).toHaveBeenCalledWith({
      data: {
        averageRating: 4.67,
        reviewCount: 3
      },
      where: { id: "shopper-profile-1" }
    });
  });

  it("hides reviews from the shopper average when admin hides them", async () => {
    const prisma = createPrismaMock();
    prisma.review.update.mockResolvedValue({
      id: "review-1",
      moderationStatus: ModerationStatus.HIDDEN,
      shopperProfileId: "shopper-profile-1"
    });
    prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: null },
      _count: { _all: 0 }
    });
    const service = new ReviewsService(prisma as never);

    await service.moderateReview("review-1", {
      moderationNotes: "Hidden after moderation.",
      moderationStatus: ModerationStatus.HIDDEN,
      moderatedByUserId: "admin-1"
    });

    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          moderationStatus: ModerationStatus.HIDDEN,
          publishedAt: null
        })
      })
    );
    expect(prisma.shopperProfile.update).toHaveBeenCalledWith({
      data: {
        averageRating: null,
        reviewCount: 0
      },
      where: { id: "shopper-profile-1" }
    });
  });
});
