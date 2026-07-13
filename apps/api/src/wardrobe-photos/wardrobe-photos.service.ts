import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole, WardrobePhotoUploadedByRole, WardrobePhotoVisibility } from "@prisma/client";

import { MediaStorageService } from "../integrations/media-storage/media-storage.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWardrobePhotoDto } from "./dto/create-wardrobe-photo.dto";
import { CreateWardrobePhotoUploadDto } from "./dto/create-wardrobe-photo-upload.dto";
import { UpdateWardrobePhotoDto } from "./dto/update-wardrobe-photo.dto";

@Injectable()
export class WardrobePhotosService {
  constructor(
    private readonly mediaStorageService: MediaStorageService,
    private readonly prisma: PrismaService
  ) {}

  findByUser(userId: string, actorUserId: string) {
    return this.prisma.wardrobePhoto.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        userId,
        ...(userId === actorUserId ? {} : { visibility: WardrobePhotoVisibility.PUBLIC_PROFILE })
      }
    });
  }

  async findOne(id: string, actorUserId: string) {
    const photo = await this.prisma.wardrobePhoto.findUnique({
      where: { id }
    });

    if (!photo) {
      throw new NotFoundException("Wardrobe photo not found.");
    }

    await this.assertCanViewPhoto(photo, actorUserId);
    return photo;
  }

  async findByBooking(bookingId: string, actorUserId: string) {
    await this.assertBookingParticipant(bookingId, actorUserId);

    return this.prisma.wardrobePhoto.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        bookingId,
        visibility: WardrobePhotoVisibility.BOOKING_SHARED
      }
    });
  }

  async create(actorUserId: string, dto: CreateWardrobePhotoDto) {
    const userId = dto.userId ?? actorUserId;
    this.assertWardrobeOwner(userId, actorUserId);

    const user = await this.prisma.user.findUnique({
      select: { id: true, role: true },
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException("Uploading user not found.");
    }

    this.assertUploadedByRoleMatchesUser(user.role, dto.uploadedByRole);

    if (dto.bookingId) {
      await this.assertBookingParticipant(dto.bookingId, actorUserId);
    }

    this.assertBookingVisibility(dto.bookingId, dto.visibility);

    if (!dto.url || !dto.storageKey) {
      throw new BadRequestException("Wardrobe photo metadata requires a url and storage key.");
    }

    return this.prisma.wardrobePhoto.create({
      data: {
        bookingId: dto.bookingId,
        caption: dto.caption,
        category: dto.category,
        metadata: dto.metadata as Prisma.InputJsonValue,
        storageKey: dto.storageKey,
        tags: dto.tags ?? [],
        title: dto.title,
        uploadedByRole: dto.uploadedByRole,
        url: dto.url,
        userId,
        visibility: dto.visibility ?? WardrobePhotoVisibility.PRIVATE
      }
    });
  }

  async createUpload(actorUserId: string, dto: CreateWardrobePhotoUploadDto) {
    const user = await this.prisma.user.findUnique({
      select: { id: true, role: true },
      where: { id: actorUserId }
    });

    if (!user) {
      throw new NotFoundException("Uploading user not found.");
    }

    this.assertUploadedByRoleMatchesUser(user.role, dto.uploadedByRole);

    if (dto.bookingId) {
      await this.assertBookingParticipant(dto.bookingId, actorUserId);
    }

    this.assertBookingVisibility(dto.bookingId, dto.visibility);

    if (!dto.contentType.startsWith("image/")) {
      throw new BadRequestException("Wardrobe uploads must be image files.");
    }

    const storageKey = this.buildWardrobeStorageKey(actorUserId, dto.fileName);
    const upload = await this.mediaStorageService.createPresignedUpload({
      contentType: dto.contentType,
      expiresInSeconds: dto.expiresInSeconds,
      key: storageKey
    });

    const photo = await this.prisma.wardrobePhoto.create({
      data: {
        bookingId: dto.bookingId,
        caption: dto.caption,
        category: dto.category,
        metadata: dto.metadata as Prisma.InputJsonValue,
        storageKey,
        tags: dto.tags ?? [],
        title: dto.title,
        uploadedByRole: dto.uploadedByRole,
        url: upload.publicUrl ?? upload.uploadUrl,
        userId: actorUserId,
        visibility: dto.visibility ?? WardrobePhotoVisibility.PRIVATE
      }
    });

    return {
      photo,
      upload
    };
  }

  async update(id: string, actorUserId: string, dto: UpdateWardrobePhotoDto) {
    const photo = await this.prisma.wardrobePhoto.findUnique({
      where: { id }
    });

    if (!photo) {
      throw new NotFoundException("Wardrobe photo not found.");
    }

    this.assertWardrobeOwner(photo.userId, actorUserId);

    return this.prisma.wardrobePhoto.update({
      data: {
        caption: dto.caption,
        category: dto.category,
        metadata: dto.metadata as Prisma.InputJsonValue,
        tags: dto.tags,
        title: dto.title,
        visibility: dto.visibility
      },
      where: { id }
    });
  }

  async delete(id: string, actorUserId: string) {
    const photo = await this.prisma.wardrobePhoto.findUnique({
      where: { id }
    });

    if (!photo) {
      throw new NotFoundException("Wardrobe photo not found.");
    }

    this.assertWardrobeOwner(photo.userId, actorUserId);

    return this.prisma.wardrobePhoto.delete({
      where: { id }
    });
  }

  private assertWardrobeOwner(photoUserId: string, actorUserId: string) {
    if (photoUserId !== actorUserId) {
      throw new ForbiddenException("Wardrobe photos must belong to the uploading user.");
    }
  }

  private assertBookingVisibility(
    bookingId?: string,
    visibility: WardrobePhotoVisibility = WardrobePhotoVisibility.PRIVATE
  ) {
    if (visibility === WardrobePhotoVisibility.BOOKING_SHARED && !bookingId) {
      throw new BadRequestException("Booking-shared wardrobe photos require a booking id.");
    }
  }

  private assertUploadedByRoleMatchesUser(userRole: UserRole, uploadedByRole: WardrobePhotoUploadedByRole) {
    if (userRole !== uploadedByRole) {
      throw new ForbiddenException("Uploaded role must match the uploading user's role.");
    }
  }

  private async assertCanViewPhoto(
    photo: {
      bookingId: string | null;
      userId: string;
      visibility: WardrobePhotoVisibility;
    },
    actorUserId: string
  ) {
    if (photo.userId === actorUserId || photo.visibility === WardrobePhotoVisibility.PUBLIC_PROFILE) {
      return;
    }

    if (photo.visibility === WardrobePhotoVisibility.BOOKING_SHARED && photo.bookingId) {
      await this.assertBookingParticipant(photo.bookingId, actorUserId);
      return;
    }

    throw new ForbiddenException("You do not have access to this wardrobe photo.");
  }

  private async assertBookingParticipant(bookingId: string, actorUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      include: {
        customerProfile: { select: { userId: true } },
        shopperProfile: { select: { userId: true } }
      },
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }

    if (booking.customerProfile.userId !== actorUserId && booking.shopperProfile.userId !== actorUserId) {
      throw new ForbiddenException("Only booking participants can access these wardrobe photos.");
    }
  }

  private buildWardrobeStorageKey(userId: string, fileName?: string) {
    const safeName = (fileName ?? "wardrobe-photo")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "wardrobe-photo";

    return `wardrobe/${userId}/${Date.now()}-${safeName}`;
  }
}
