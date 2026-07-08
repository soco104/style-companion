import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { TransitionBookingDto } from "./dto/transition-booking.dto";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiCreatedResponse({ description: "Requests a booking." })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists bookings." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.bookingsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets a booking." })
  findOne(@Param("id") id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post(":id/accept")
  @ApiOkResponse({ description: "Accepts a requested booking." })
  accept(@Param("id") id: string, @Body() dto: TransitionBookingDto) {
    return this.bookingsService.accept(id, dto);
  }

  @Post(":id/decline")
  @ApiOkResponse({ description: "Declines a requested booking." })
  decline(@Param("id") id: string, @Body() dto: TransitionBookingDto) {
    return this.bookingsService.decline(id, dto);
  }

  @Post(":id/cancel")
  @ApiOkResponse({ description: "Cancels a requested or accepted booking." })
  cancel(@Param("id") id: string, @Body() dto: TransitionBookingDto) {
    return this.bookingsService.cancel(id, dto);
  }

  @Post(":id/complete")
  @ApiOkResponse({ description: "Completes an accepted booking." })
  complete(@Param("id") id: string, @Body() dto: TransitionBookingDto) {
    return this.bookingsService.complete(id, dto);
  }

  @Patch(":id/dispute")
  @ApiOkResponse({ description: "Marks a booking as disputed." })
  dispute(@Param("id") id: string, @Body() dto: TransitionBookingDto) {
    return this.bookingsService.dispute(id, dto);
  }
}
