import { Injectable, NotFoundException } from "@nestjs/common";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { UpdateProfileFeeWaiverDto } from "../common/dto/update-profile-fee-waiver.dto";
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

  updateFeeWaiver(id: string, dto: UpdateProfileFeeWaiverDto) {
    return this.prisma.customerProfile.update({
      data: {
        feesWaived: dto.feesWaived,
        feeWaivedAt: dto.feesWaived ? new Date() : null,
        feeWaivedByUserId: dto.feesWaived ? dto.feeWaivedByUserId : null,
        feeWaiverReason: dto.feesWaived ? dto.feeWaiverReason : null
      },
      where: { id }
    });
  }
}
