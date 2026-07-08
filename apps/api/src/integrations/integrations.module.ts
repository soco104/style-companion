import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";

import { FirebaseAuthMiddleware } from "./firebase-auth/firebase-auth.middleware";
import { FirebaseAuthService } from "./firebase-auth/firebase-auth.service";
import { MediaStorageService } from "./media-storage/media-storage.service";
import { FcmNotificationService } from "./notifications/fcm-notification.service";
import { StripeConnectService } from "./stripe-connect/stripe-connect.service";
import { TwilioConversationsService } from "./twilio-conversations/twilio-conversations.service";
import { IntegrationsController } from "./integrations.controller";

@Global()
@Module({
  controllers: [IntegrationsController],
  exports: [
    FirebaseAuthService,
    StripeConnectService,
    TwilioConversationsService,
    MediaStorageService,
    FcmNotificationService
  ],
  providers: [
    FirebaseAuthMiddleware,
    FirebaseAuthService,
    StripeConnectService,
    TwilioConversationsService,
    MediaStorageService,
    FcmNotificationService
  ]
})
export class IntegrationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FirebaseAuthMiddleware)
      .exclude(
        { method: RequestMethod.ALL, path: "health" },
        { method: RequestMethod.ALL, path: "docs" },
        { method: RequestMethod.ALL, path: "docs/(.*)" },
        { method: RequestMethod.POST, path: "auth/dev-login" }
      )
      .forRoutes("*");
  }
}
