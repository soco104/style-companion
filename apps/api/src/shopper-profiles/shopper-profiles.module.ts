import { Module } from "@nestjs/common";

import { ShopperProfilesController } from "./shopper-profiles.controller";
import { ShopperProfilesService } from "./shopper-profiles.service";

@Module({
  controllers: [ShopperProfilesController],
  providers: [ShopperProfilesService]
})
export class ShopperProfilesModule {}
