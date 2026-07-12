import { Module } from "@nestjs/common";

import { CurrentUserService } from "../common/auth/current-user.service";
import { ShopperProfilesController } from "./shopper-profiles.controller";
import { ShopperProfilesService } from "./shopper-profiles.service";

@Module({
  controllers: [ShopperProfilesController],
  providers: [CurrentUserService, ShopperProfilesService]
})
export class ShopperProfilesModule {}
