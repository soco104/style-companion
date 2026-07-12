import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUserService } from "../common/auth/current-user.service";
import type { AuthenticatedRequest } from "../integrations/firebase-auth/authenticated-request";
import { CreateShopperPricingPackageDto } from "./dto/create-shopper-pricing-package.dto";
import { UpdateShopperPricingPackageDto } from "./dto/update-shopper-pricing-package.dto";
import { ShopperPricingPackagesService } from "./shopper-pricing-packages.service";

@ApiTags("shopper-pricing-packages")
@Controller("profiles/shopper/:shopperProfileId/pricing-packages")
export class ShopperPricingPackagesController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly pricingPackagesService: ShopperPricingPackagesService
  ) {}

  @Get()
  @ApiOkResponse({ description: "Lists active pricing packages for a shopper." })
  findActiveByShopper(@Param("shopperProfileId") shopperProfileId: string) {
    return this.pricingPackagesService.findActiveByShopper(shopperProfileId);
  }

  @Post()
  @ApiCreatedResponse({ description: "Creates a shopper pricing package." })
  async create(
    @Param("shopperProfileId") shopperProfileId: string,
    @Body() dto: CreateShopperPricingPackageDto,
    @Req() request: AuthenticatedRequest
  ) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.ownerUserId);
    return this.pricingPackagesService.create(shopperProfileId, actorUserId, dto);
  }

  @Patch(":packageId")
  @ApiOkResponse({ description: "Updates a shopper pricing package." })
  async update(
    @Param("packageId") packageId: string,
    @Body() dto: UpdateShopperPricingPackageDto,
    @Req() request: AuthenticatedRequest
  ) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.ownerUserId);
    return this.pricingPackagesService.update(packageId, actorUserId, dto);
  }
}
