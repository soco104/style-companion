import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";

import { CreateBookingReviewDto } from "./dto/create-booking-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("bookings/:bookingId/reviews")
export class BookingReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a customer review for a completed booking." })
  createForBooking(@Param("bookingId") bookingId: string, @Body() dto: CreateBookingReviewDto) {
    return this.reviewsService.create({
      ...dto,
      bookingId
    });
  }
}
