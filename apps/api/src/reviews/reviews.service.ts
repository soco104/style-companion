import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, ModerationStatus } from "@prisma/client";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewResponseDto } from "./dto/create-review-response.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";

const reviewInclude = {
  booking: true,
  customerProfile: { include: { user: true } },
  response: true,
  shopperProfile: { include: { user: true } }
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      include: { review: true },
      where: { id: dto.bookingId }
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException("Customers can review only completed bookings.");
    }

    if (booking.customerProfileId !== dto.customerProfileId) {
      throw new BadRequestException("Review customer must match the booking customer.");
    }

    if (booking.shopperProfileId !== dto.shopperProfileId) {
      throw new BadRequestException("Review shopper must match the booking shopper.");
    }

    if (booking.review) {
      throw new BadRequestException("Booking already has a review.");
    }

    return this.prisma.review.create({
      data: {
        ...dto,
        moderationStatus: ModerationStatus.PENDING
      },
      include: reviewInclude
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.review.findMany({
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async createResponse(reviewId: string, dto: CreateReviewResponseDto) {
    const review = await this.prisma.review.findUnique({
      include: { response: true },
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException("Review not found.");
    }

    if (review.shopperProfileId !== dto.shopperProfileId) {
      throw new BadRequestException("Only the reviewed shopper can respond.");
    }

    if (review.response) {
      throw new BadRequestException("Review already has a response.");
    }

    return this.prisma.reviewResponse.create({
      data: {
        body: dto.body,
        moderationStatus: ModerationStatus.PENDING,
        reviewId,
        shopperProfileId: dto.shopperProfileId
      },
      include: {
        review: true,
        shopperProfile: { include: { user: true } }
      }
    });
  }

  async moderateReview(id: string, dto: ModerateReviewDto) {
    const publishedAt = dto.moderationStatus === ModerationStatus.APPROVED ? new Date() : null;

    const review = await this.prisma.review.update({
      data: {
        moderatedAt: new Date(),
        moderatedByUserId: dto.moderatedByUserId,
        moderationNotes: dto.moderationNotes,
        moderationStatus: dto.moderationStatus,
        publishedAt
      },
      include: reviewInclude,
      where: { id }
    });

    await this.recalculateShopperRating(review.shopperProfileId);

    return review;
  }

  moderateResponse(id: string, dto: ModerateReviewDto) {
    const publishedAt = dto.moderationStatus === ModerationStatus.APPROVED ? new Date() : null;

    return this.prisma.reviewResponse.update({
      data: {
        moderatedAt: new Date(),
        moderatedByUserId: dto.moderatedByUserId,
        moderationNotes: dto.moderationNotes,
        moderationStatus: dto.moderationStatus,
        publishedAt
      },
      include: {
        review: true,
        shopperProfile: { include: { user: true } }
      },
      where: { id }
    });
  }

  private async recalculateShopperRating(shopperProfileId: string) {
    const approvedReviews = await this.prisma.review.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: {
        moderationStatus: ModerationStatus.APPROVED,
        shopperProfileId
      }
    });

    const averageRating = approvedReviews._avg.rating == null ? null : Number(approvedReviews._avg.rating.toFixed(2));

    await this.prisma.shopperProfile.update({
      data: {
        averageRating,
        reviewCount: approvedReviews._count._all
      },
      where: { id: shopperProfileId }
    });
  }
}
