import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUserService } from "../common/auth/current-user.service";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { UpdateProfileFeeWaiverDto } from "../common/dto/update-profile-fee-waiver.dto";
import type { AuthenticatedRequest } from "../integrations/firebase-auth/authenticated-request";
import { CreateAvailabilitySlotDto } from "./dto/create-availability-slot.dto";
import { CreateShopperProfileDto } from "./dto/create-shopper-profile.dto";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";
import { UpdateShopperProfileDto } from "./dto/update-shopper-profile.dto";
import { ShopperProfilesService } from "./shopper-profiles.service";

@ApiTags("shopper-profiles")
@Controller("profiles/shopper")
export class ShopperProfilesController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly shopperProfilesService: ShopperProfilesService
  ) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a shopper profile." })
  create(@Body() dto: CreateShopperProfileDto) {
    return this.shopperProfilesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists shopper profiles." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.shopperProfilesService.findMany(query);
  }

  @Get("me")
  @ApiOkResponse({ description: "Gets the authenticated shopper's configured profile." })
  async findMine(@Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request);
    return this.shopperProfilesService.findMine(actorUserId);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets a shopper profile." })
  findOne(@Param("id") id: string) {
    return this.shopperProfilesService.findOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Updates a shopper profile." })
  update(@Param("id") id: string, @Body() dto: UpdateShopperProfileDto) {
    return this.shopperProfilesService.update(id, dto);
  }

  @Patch(":id/fee-waiver")
  @ApiOkResponse({ description: "Updates the admin fee waiver for a shopper profile." })
  updateFeeWaiver(@Param("id") id: string, @Body() dto: UpdateProfileFeeWaiverDto) {
    return this.shopperProfilesService.updateFeeWaiver(id, dto);
  }

  @Post(":id/specialties")
  @ApiCreatedResponse({ description: "Adds a shopper specialty." })
  addSpecialty(@Param("id") id: string, @Body() dto: CreateSpecialtyDto) {
    return this.shopperProfilesService.addSpecialty(id, dto);
  }

  @Post(":id/availability")
  @ApiCreatedResponse({ description: "Adds a shopper availability slot." })
  async addAvailabilitySlot(
    @Param("id") id: string,
    @Body() dto: CreateAvailabilitySlotDto,
    @Req() request: AuthenticatedRequest
  ) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.ownerUserId);
    return this.shopperProfilesService.addAvailabilitySlot(id, actorUserId, dto);
  }
}
