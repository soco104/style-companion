import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUserService } from "../common/auth/current-user.service";
import type { AuthenticatedRequest } from "../integrations/firebase-auth/authenticated-request";
import { CreateShopperStylePreferenceDto } from "./dto/create-shopper-style-preference.dto";
import { UpdateShopperStylePreferenceDto } from "./dto/update-shopper-style-preference.dto";
import { ShopperStylePreferencesService } from "./shopper-style-preferences.service";

@ApiTags("shopper-style-preferences")
@Controller("profiles/shopper/:shopperProfileId/style-preferences")
export class ShopperStylePreferencesController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly stylePreferencesService: ShopperStylePreferencesService
  ) {}

  @Get()
  @ApiOkResponse({ description: "Lists style preferences for a shopper." })
  findByShopper(@Param("shopperProfileId") shopperProfileId: string) {
    return this.stylePreferencesService.findByShopper(shopperProfileId);
  }

  @Post()
  @ApiCreatedResponse({ description: "Creates a shopper style preference." })
  async create(
    @Param("shopperProfileId") shopperProfileId: string,
    @Body() dto: CreateShopperStylePreferenceDto,
    @Req() request: AuthenticatedRequest
  ) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.ownerUserId);
    return this.stylePreferencesService.create(shopperProfileId, actorUserId, dto);
  }

  @Patch(":preferenceId")
  @ApiOkResponse({ description: "Updates a shopper style preference." })
  async update(
    @Param("preferenceId") preferenceId: string,
    @Body() dto: UpdateShopperStylePreferenceDto,
    @Req() request: AuthenticatedRequest
  ) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.ownerUserId);
    return this.stylePreferencesService.update(preferenceId, actorUserId, dto);
  }
}
