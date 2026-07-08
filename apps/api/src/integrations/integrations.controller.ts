import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { FirebaseAuthService } from "./firebase-auth/firebase-auth.service";
import { MediaStorageService } from "./media-storage/media-storage.service";
import { FcmNotificationService } from "./notifications/fcm-notification.service";
import { StripeConnectService } from "./stripe-connect/stripe-connect.service";
import { TwilioConversationsService } from "./twilio-conversations/twilio-conversations.service";

@ApiTags("integrations")
@Controller("integrations")
export class IntegrationsController {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly stripeConnectService: StripeConnectService,
    private readonly twilioConversationsService: TwilioConversationsService,
    private readonly mediaStorageService: MediaStorageService,
    private readonly fcmNotificationService: FcmNotificationService
  ) {}

  @Get("status")
  @ApiOkResponse({ description: "Lists configured integration modes." })
  getStatus() {
    return {
      authRequired: process.env.AUTH_REQUIRED === "true",
      integrations: [
        this.firebaseAuthService.getStatus(),
        this.stripeConnectService.getStatus(),
        this.twilioConversationsService.getStatus(),
        this.mediaStorageService.getStatus(),
        this.fcmNotificationService.getStatus()
      ]
    };
  }
}
