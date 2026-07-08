import { Injectable } from "@nestjs/common";

import { getIntegrationMode, productionBehaviorDisabled, requireEnv } from "../common/integration-config";

export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

@Injectable()
export class FcmNotificationService {
  private readonly mode = getIntegrationMode("FCM_MODE");

  async sendToToken(token: string, payload: NotificationPayload) {
    if (this.mode === "mock") {
      return {
        messageId: `mock-fcm-${Date.now()}`,
        provider: "firebase-cloud-messaging",
        target: token,
        title: payload.title
      };
    }

    requireEnv(["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]);
    throw productionBehaviorDisabled("Firebase Cloud Messaging");
  }

  getStatus() {
    return {
      mode: this.mode,
      provider: "firebase-cloud-messaging",
      productionEnabled: false
    };
  }
}
