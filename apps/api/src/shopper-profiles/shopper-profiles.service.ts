import { Injectable, NotFoundException } from "@nestjs/common";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
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
        specialties: true,
        user: true
      },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.shopperProfile.findUnique({
      include: {
        availability: true,
        specialties: true,
        user: true
      },
      where: { id }
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

  addSpecialty(shopperProfileId: string, dto: CreateSpecialtyDto) {
    return this.prisma.shopperSpecialty.create({
      data: {
        shopperProfileId,
        name: dto.name
      }
    });
  }
}
