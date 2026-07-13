import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { WardrobePhotoVisibility } from "@prisma/client";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { UpdateProfileFeeWaiverDto } from "../common/dto/update-profile-fee-waiver.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAvailabilitySlotDto } from "./dto/create-availability-slot.dto";
import { CreateShopperProfileDto } from "./dto/create-shopper-profile.dto";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";
import { UpdateShopperProfileDto } from "./dto/update-shopper-profile.dto";

@Injectable()
export class ShopperProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateShopperProfileDto) {
    return this.prisma.shopperProfile.create({
      data: dto
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.shopperProfile.findMany({
      include: {
        pricingPackages: true,
        specialties: true,
        stylePreferences: true,
        user: true
      },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.shopperProfile.findUnique({
      include: this.profileInclude(),
      where: { id }
    });

    if (!profile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    return profile;
  }

  async findMine(userId: string) {
    const profile = await this.prisma.shopperProfile.findUnique({
      include: this.profileInclude(),
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    return profile;
  }

  update(id: string, dto: UpdateShopperProfileDto) {
    return this.prisma.shopperProfile.update({
      data: dto,
      where: { id }
    });
  }

  updateFeeWaiver(id: string, dto: UpdateProfileFeeWaiverDto) {
    return this.prisma.shopperProfile.update({
      data: {
        feesWaived: dto.feesWaived,
        feeWaivedAt: dto.feesWaived ? new Date() : null,
        feeWaivedByUserId: dto.feesWaived ? dto.feeWaivedByUserId : null,
        feeWaiverReason: dto.feesWaived ? dto.feeWaiverReason : null
      },
      where: { id }
    });
  }

  addSpecialty(shopperProfileId: string, dto: CreateSpecialtyDto) {
    return this.prisma.shopperSpecialty.create({
      data: {
        shopperProfileId,
        name: dto.name
      }
    });
  }

  async addAvailabilitySlot(shopperProfileId: string, actorUserId: string, dto: CreateAvailabilitySlotDto) {
    if (dto.endsAt <= dto.startsAt) {
      throw new BadRequestException("Availability end time must be after start time.");
    }

    const profile = await this.prisma.shopperProfile.findUnique({
      select: { userId: true },
      where: { id: shopperProfileId }
    });

    if (!profile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    if (profile.userId !== actorUserId) {
      throw new ForbiddenException("Shoppers can only manage their own availability.");
    }

    return this.prisma.availabilitySlot.create({
      data: {
        endsAt: dto.endsAt,
        isRecurring: dto.isRecurring ?? false,
        recurrenceRule: dto.recurrenceRule,
        shopperProfileId,
        startsAt: dto.startsAt,
        timezone: dto.timezone
      }
    });
  }

  private profileInclude() {
    return {
      availability: {
        orderBy: { startsAt: "asc" as const }
      },
      pricingPackages: {
        orderBy: { createdAt: "desc" as const }
      },
      specialties: true,
      stylePreferences: {
        orderBy: { createdAt: "desc" as const }
      },
      user: {
        include: {
          wardrobePhotos: {
            orderBy: { createdAt: "desc" as const },
            take: 12,
            where: {
              visibility: WardrobePhotoVisibility.PUBLIC_PROFILE
            }
          }
        }
      }
    };
  }
}
