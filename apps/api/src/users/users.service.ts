import { Injectable, NotFoundException } from "@nestjs/common";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.user.findMany({
      include: {
        customerProfile: true,
        shopperProfile: true
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      include: {
        customerProfile: true,
        shopperProfile: true
      },
      where: { id }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      data: dto,
      where: { id }
    });
  }
}
