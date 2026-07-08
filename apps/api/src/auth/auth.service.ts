import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { DevLoginDto } from "./dto/dev-login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async devLogin(dto: DevLoginDto) {
    const user = await this.prisma.user.findUnique({
      include: {
        customerProfile: true,
        shopperProfile: true
      },
      where: {
        email: dto.email
      }
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return {
      token: `dev-token:${user.id}`,
      user
    };
  }
}
