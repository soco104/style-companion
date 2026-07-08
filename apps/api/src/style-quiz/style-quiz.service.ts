import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateStyleQuizResponseDto } from "./dto/create-style-quiz-response.dto";

@Injectable()
export class StyleQuizService {
  constructor(private readonly prisma: PrismaService) {}

  createResponse(dto: CreateStyleQuizResponseDto) {
    return this.prisma.styleQuizResponse.create({
      data: {
        ...dto,
        styleGoals: dto.styleGoals as Prisma.InputJsonValue
      }
    });
  }

  findByCustomer(customerProfileId: string) {
    return this.prisma.styleQuizResponse.findMany({
      orderBy: { createdAt: "desc" },
      where: { customerProfileId }
    });
  }
}
