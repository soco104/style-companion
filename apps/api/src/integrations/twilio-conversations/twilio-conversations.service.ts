import { Injectable } from "@nestjs/common";

import { getIntegrationMode, productionBehaviorDisabled, requireEnv } from "../common/integration-config";

export type TwilioConversationRequest = {
  bookingId: string;
  customerUserId: string;
  shopperUserId: string;
};

export type TwilioConversation = {
  provider: "twilio";
  conversationSid: string;
  friendlyName: string;
};

@Injectable()
export class TwilioConversationsService {
  private readonly mode = getIntegrationMode("TWILIO_CONVERSATIONS_MODE");

  async createConversation(request: TwilioConversationRequest): Promise<TwilioConversation> {
    if (this.mode === "mock") {
      return {
        conversationSid: `CH_mock_${request.bookingId}`,
        friendlyName: `Style Companion booking ${request.bookingId}`,
        provider: "twilio"
      };
    }

    requireEnv(["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_CONVERSATIONS_SERVICE_SID"]);
    throw productionBehaviorDisabled("Twilio Conversations");
  }

  async createParticipantToken(userId: string) {
    if (this.mode === "mock") {
      return {
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        provider: "twilio",
        token: `mock-twilio-token-${userId}`
      };
    }

    requireEnv(["TWILIO_ACCOUNT_SID", "TWILIO_API_KEY", "TWILIO_API_SECRET", "TWILIO_CONVERSATIONS_SERVICE_SID"]);
    throw productionBehaviorDisabled("Twilio Conversations");
  }

  getStatus() {
    return {
      mode: this.mode,
      provider: "twilio-conversations",
      productionEnabled: false
    };
  }
}
