import { Module } from "@nestjs/common";

import { CurrentUserService } from "../common/auth/current-user.service";
import { WardrobePhotosController } from "./wardrobe-photos.controller";
import { WardrobePhotosService } from "./wardrobe-photos.service";

@Module({
  controllers: [WardrobePhotosController],
  providers: [CurrentUserService, WardrobePhotosService]
})
export class WardrobePhotosModule {}
