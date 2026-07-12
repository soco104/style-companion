import { Module } from "@nestjs/common";

import { CurrentUserService } from "../common/auth/current-user.service";
import { ShopperStylePreferencesController } from "./shopper-style-preferences.controller";
import { ShopperStylePreferencesService } from "./shopper-style-preferences.service";

@Module({
  controllers: [ShopperStylePreferencesController],
  providers: [CurrentUserService, ShopperStylePreferencesService]
})
export class ShopperStylePreferencesModule {}
