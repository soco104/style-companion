import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import type { NextFunction, Response } from "express";

import { isAuthRequired } from "../common/integration-config";
import type { AuthenticatedRequest } from "./authenticated-request";
import { FirebaseAuthService } from "./firebase-auth.service";

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const token = this.getBearerToken(req.headers.authorization);

    if (!token) {
      if (isAuthRequired()) {
        throw new UnauthorizedException("Bearer token is required.");
      }

      next();
      return;
    }

    req.auth = await this.firebaseAuthService.verifyIdToken(token);
    next();
  }

  private getBearerToken(authorization?: string) {
    if (!authorization) {
      return undefined;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Authorization header must use Bearer token format.");
    }

    return token;
  }
}
