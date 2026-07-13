import { Injectable, UnauthorizedException } from "@nestjs/common";

import { getIntegrationMode, productionBehaviorDisabled, requireEnv } from "../common/integration-config";
import type { VerifiedFirebaseUser } from "./firebase-auth.types";

@Injectable()
export class FirebaseAuthService {
  private readonly mode = getIntegrationMode("FIREBASE_AUTH_MODE");

  async verifyIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
    if (!idToken) {
      throw new UnauthorizedException("Missing Firebase ID token.");
    }

    if (this.mode === "mock") {
      return this.verifyMockToken(idToken);
    }

    requireEnv(["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]);
    throw productionBehaviorDisabled("Firebase Auth");
  }

  getStatus() {
    return {
      mode: this.mode,
      provider: "firebase-auth",
      productionEnabled: false
    };
  }

  private verifyMockToken(idToken: string): VerifiedFirebaseUser {
    const [prefix, uid, email] = idToken.split(":");

    if ((prefix !== "dev" && prefix !== "dev-token") || !uid) {
      throw new UnauthorizedException("Mock Firebase tokens must use dev:<uid>[:email].");
    }

    return {
      claims: { roles: [] },
      email,
      provider: "firebase",
      uid
    };
  }
}
