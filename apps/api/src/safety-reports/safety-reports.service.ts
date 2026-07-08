import { Injectable, NotFoundException } from "@nestjs/common";
import { SafetyReportStatus } from "@prisma/client";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSafetyReportDto } from "./dto/create-safety-report.dto";
import { UpdateSafetyReportDto } from "./dto/update-safety-report.dto";

const safetyReportInclude = {
  assignedAdmin: true,
  booking: true,
  reportedUser: true,
  reporterUser: true
};

@Injectable()
export class SafetyReportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSafetyReportDto) {
    return this.prisma.safetyReport.create({
      data: dto,
      include: safetyReportInclude
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.safetyReport.findMany({
      include: safetyReportInclude,
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.safetyReport.findUnique({
      include: safetyReportInclude,
      where: { id }
    });

    if (!report) {
      throw new NotFoundException("Safety report not found.");
    }

    return report;
  }

  update(id: string, dto: UpdateSafetyReportDto) {
    const resolvedAt =
      dto.status === SafetyReportStatus.RESOLVED || dto.status === SafetyReportStatus.DISMISSED
        ? new Date()
        : undefined;

    return this.prisma.safetyReport.update({
      data: {
        ...dto,
        resolvedAt
      },
      include: safetyReportInclude,
      where: { id }
    });
  }
}
