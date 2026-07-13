import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateShopperPricingPackageDto } from "./dto/create-shopper-pricing-package.dto";
import { UpdateShopperPricingPackageDto } from "./dto/update-shopper-pricing-package.dto";

@Injectable()
export class ShopperPricingPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByShopper(shopperProfileId: string) {
    return this.prisma.shopperPricingPackage.findMany({
      orderBy: { createdAt: "asc" },
      where: {
        isActive: true,
        shopperProfileId
      }
    });
  }

  async create(shopperProfileId: string, actorUserId: string, dto: CreateShopperPricingPackageDto) {
    await this.assertShopperOwner(shopperProfileId, actorUserId);

    return this.prisma.shopperPricingPackage.create({
      data: {
        description: dto.description,
        isActive: dto.isActive ?? true,
        pricePerSessionCents: dto.pricePerSessionCents,
        sessionCount: dto.sessionCount,
        shopperProfileId,
        title: dto.title,
        totalPriceCents: dto.totalPriceCents
      }
    });
  }

  async update(packageId: string, actorUserId: string, dto: UpdateShopperPricingPackageDto) {
    const pricingPackage = await this.prisma.shopperPricingPackage.findUnique({
      include: { shopperProfile: true },
      where: { id: packageId }
    });

    if (!pricingPackage) {
      throw new NotFoundException("Pricing package not found.");
    }

    if (pricingPackage.shopperProfile.userId !== actorUserId) {
      throw new ForbiddenException("Shoppers can only manage their own pricing packages.");
    }

    return this.prisma.shopperPricingPackage.update({
      data: {
        description: dto.description,
        isActive: dto.isActive,
        pricePerSessionCents: dto.pricePerSessionCents,
        sessionCount: dto.sessionCount,
        title: dto.title,
        totalPriceCents: dto.totalPriceCents
      },
      where: { id: packageId }
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
      throw new ForbiddenException("Shoppers can only manage their own pricing packages.");
    }
  }
}
