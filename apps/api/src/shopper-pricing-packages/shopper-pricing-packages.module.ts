import { Module } from "@nestjs/common";

import { CurrentUserService } from "../common/auth/current-user.service";
import { ShopperPricingPackagesController } from "./shopper-pricing-packages.controller";
import { ShopperPricingPackagesService } from "./shopper-pricing-packages.service";

@Module({
  controllers: [ShopperPricingPackagesController],
  providers: [CurrentUserService, ShopperPricingPackagesService]
})
export class ShopperPricingPackagesModule {}
