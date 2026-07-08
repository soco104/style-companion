import { Module } from "@nestjs/common";

import { BookingReviewsController } from "./booking-reviews.controller";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  controllers: [BookingReviewsController, ReviewsController],
  exports: [ReviewsService],
  providers: [ReviewsService]
})
export class ReviewsModule {}
