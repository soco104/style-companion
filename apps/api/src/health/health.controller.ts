import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ description: "API health status." })
  check() {
    return {
      name: "Style Companion API",
      status: "ok"
    };
  }

  @Get("live")
  @ApiOkResponse({ description: "Liveness probe." })
  live() {
    return {
      status: "ok"
    };
  }

  @Get("ready")
  @ApiOkResponse({ description: "Readiness probe." })
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      checks: {
        database: "ok"
      },
      status: "ok"
    };
  }
}
