import { Injectable, UnauthorizedException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { isAuthRequired } from "../../integrations/common/integration-config";
import type { AuthenticatedRequest } from "../../integrations/firebase-auth/authenticated-request";

@Injectable()
export class CurrentUserService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUserId(request: AuthenticatedRequest, fallbackUserId?: string) {
    if (request.auth) {
      const user = await this.prisma.user.findFirst({
        select: { id: true },
        where: {
          OR: [
            { id: request.auth.uid },
            ...(request.auth.email ? [{ email: request.auth.email }] : [])
          ]
        }
      });

      if (!user) {
        throw new UnauthorizedException("Authenticated user is not linked to an app user.");
      }

      return user.id;
    }

    if (!isAuthRequired() && fallbackUserId) {
      return fallbackUserId;
    }

    throw new UnauthorizedException("Authenticated user is required.");
  }
}
