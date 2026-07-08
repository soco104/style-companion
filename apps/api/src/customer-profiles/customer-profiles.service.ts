import { Injectable, NotFoundException } from "@nestjs/common";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerProfileDto } from "./dto/create-customer-profile.dto";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@Injectable()
export class CustomerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCustomerProfileDto) {
    return this.prisma.customerProfile.create({
      data: dto
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.customerProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      include: {
        styleQuizResponses: true,
        user: true
      },
      where: { id }
    });

    if (!profile) {
      throw new NotFoundException("Customer profile not found.");
    }

    return profile;
  }

  update(id: string, dto: UpdateCustomerProfileDto) {
    return this.prisma.customerProfile.update({
      data: dto,
      where: { id }
    });
  }
}
