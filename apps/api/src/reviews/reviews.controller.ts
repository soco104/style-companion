import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { CreateReviewResponseDto } from "./dto/create-review-response.dto";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a customer review for a completed booking." })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists reviews." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.reviewsService.findMany(query);
  }

  @Post(":id/response")
  @ApiCreatedResponse({ description: "Creates a shopper response to a review." })
  createResponse(@Param("id") id: string, @Body() dto: CreateReviewResponseDto) {
    return this.reviewsService.createResponse(id, dto);
  }

  @Patch(":id/moderation")
  @ApiOkResponse({ description: "Moderates a review." })
  moderateReview(@Param("id") id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateReview(id, dto);
  }

  @Patch("responses/:id/moderation")
  @ApiOkResponse({ description: "Moderates a review response." })
  moderateResponse(@Param("id") id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateResponse(id, dto);
  }
}
