import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateShopperStylePreferenceDto } from "./dto/create-shopper-style-preference.dto";
import { UpdateShopperStylePreferenceDto } from "./dto/update-shopper-style-preference.dto";

@Injectable()
export class ShopperStylePreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  findByShopper(shopperProfileId: string) {
    return this.prisma.shopperStylePreference.findMany({
      orderBy: { createdAt: "asc" },
      where: { shopperProfileId }
    });
  }

  async create(shopperProfileId: string, actorUserId: string, dto: CreateShopperStylePreferenceDto) {
    await this.assertShopperOwner(shopperProfileId, actorUserId);

    return this.prisma.shopperStylePreference.create({
      data: {
        avoidedStyles: dto.avoidedStyles ?? [],
        notes: dto.notes,
        preferredBrands: dto.preferredBrands ?? [],
        shopperProfileId,
        styleTags: dto.styleTags
      }
    });
  }

  async update(preferenceId: string, actorUserId: string, dto: UpdateShopperStylePreferenceDto) {
    const preference = await this.prisma.shopperStylePreference.findUnique({
      include: { shopperProfile: true },
      where: { id: preferenceId }
    });

    if (!preference) {
      throw new NotFoundException("Shopper style preference not found.");
    }

    if (preference.shopperProfile.userId !== actorUserId) {
      throw new ForbiddenException("Shoppers can only manage their own style preferences.");
    }

    return this.prisma.shopperStylePreference.update({
      data: {
        avoidedStyles: dto.avoidedStyles,
        notes: dto.notes,
        preferredBrands: dto.preferredBrands,
        styleTags: dto.styleTags
      },
      where: { id: preferenceId }
    });
  }

  private async assertShopperOwner(shopperProfileId: string, ownerUserId: string) {
    const shopperProfile = await this.prisma.shopperProfile.findUnique({
      select: { userId: true },
      where: { id: shopperProfileId }
    });

    if (!shopperProfile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    if (shopperProfile.userId !== ownerUserId) {
      throw new ForbiddenException("Shoppers can only manage their own style preferences.");
    }
  }
}
