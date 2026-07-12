import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { UpdateProfileFeeWaiverDto } from "../common/dto/update-profile-fee-waiver.dto";
import { CustomerProfilesService } from "./customer-profiles.service";
import { CreateCustomerProfileDto } from "./dto/create-customer-profile.dto";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@ApiTags("customer-profiles")
@Controller("profiles/customer")
export class CustomerProfilesController {
  constructor(private readonly customerProfilesService: CustomerProfilesService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a customer profile." })
  create(@Body() dto: CreateCustomerProfileDto) {
    return this.customerProfilesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists customer profiles." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.customerProfilesService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets a customer profile." })
  findOne(@Param("id") id: string) {
    return this.customerProfilesService.findOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Updates a customer profile." })
  update(@Param("id") id: string, @Body() dto: UpdateCustomerProfileDto) {
    return this.customerProfilesService.update(id, dto);
  }

  @Patch(":id/fee-waiver")
  @ApiOkResponse({ description: "Updates the admin fee waiver for a customer profile." })
  updateFeeWaiver(@Param("id") id: string, @Body() dto: UpdateProfileFeeWaiverDto) {
    return this.customerProfilesService.updateFeeWaiver(id, dto);
  }
}
