import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUserService } from "../common/auth/current-user.service";
import type { AuthenticatedRequest } from "../integrations/firebase-auth/authenticated-request";
import { CreateWardrobePhotoDto } from "./dto/create-wardrobe-photo.dto";
import { CreateWardrobePhotoUploadDto } from "./dto/create-wardrobe-photo-upload.dto";
import { UpdateWardrobePhotoDto } from "./dto/update-wardrobe-photo.dto";
import { WardrobePhotosService } from "./wardrobe-photos.service";

@ApiTags("wardrobe-photos")
@Controller("wardrobe-photos")
export class WardrobePhotosController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly wardrobePhotosService: WardrobePhotosService
  ) {}

  @Get("users/:userId")
  @ApiOkResponse({ description: "Lists wardrobe photo metadata for a user." })
  async findByUser(@Param("userId") userId: string, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request, userId);
    return this.wardrobePhotosService.findByUser(userId, actorUserId);
  }

  @Get("bookings/:bookingId")
  @ApiOkResponse({ description: "Lists booking-shared wardrobe photo metadata for a booking participant." })
  async findByBooking(@Param("bookingId") bookingId: string, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request);
    return this.wardrobePhotosService.findByBooking(bookingId, actorUserId);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets wardrobe photo metadata." })
  async findOne(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request);
    return this.wardrobePhotosService.findOne(id, actorUserId);
  }

  @Post()
  @ApiCreatedResponse({ description: "Creates wardrobe photo metadata for an already uploaded object." })
  async create(@Body() dto: CreateWardrobePhotoDto, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(
      request,
      dto.uploadedByUserId ?? dto.userId
    );
    return this.wardrobePhotosService.create(actorUserId, dto);
  }

  @Post("uploads")
  @ApiCreatedResponse({ description: "Creates wardrobe photo metadata and returns a presigned upload target." })
  async createUpload(@Body() dto: CreateWardrobePhotoUploadDto, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.uploadedByUserId);
    return this.wardrobePhotosService.createUpload(actorUserId, dto);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Updates wardrobe photo metadata." })
  async update(@Param("id") id: string, @Body() dto: UpdateWardrobePhotoDto, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request, dto.uploadedByUserId);
    return this.wardrobePhotosService.update(id, actorUserId, dto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Deletes wardrobe photo metadata." })
  async delete(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    const actorUserId = await this.currentUserService.resolveUserId(request);
    return this.wardrobePhotosService.delete(id, actorUserId);
  }
}
