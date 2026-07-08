import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { CreatePaymentPlaceholderDto } from "./dto/create-payment-placeholder.dto";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("placeholder")
  @ApiOkResponse({ description: "Describes current payment integration status." })
  placeholder() {
    return this.paymentsService.placeholder();
  }

  @Post("placeholder")
  @ApiCreatedResponse({ description: "Creates a local placeholder payment record." })
  createPlaceholder(@Body() dto: CreatePaymentPlaceholderDto) {
    return this.paymentsService.createPlaceholder(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists payment records." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.paymentsService.findMany(query);
  }
}
