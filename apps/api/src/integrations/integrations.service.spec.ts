import { UnauthorizedException } from "@nestjs/common";

import { FirebaseAuthService } from "./firebase-auth/firebase-auth.service";
import { MediaStorageService } from "./media-storage/media-storage.service";
import { FcmNotificationService } from "./notifications/fcm-notification.service";
import { StripeConnectService } from "./stripe-connect/stripe-connect.service";
import { TwilioConversationsService } from "./twilio-conversations/twilio-conversations.service";

const originalEnv = process.env;

describe("integration wrappers", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("verifies local Firebase Auth mock tokens", async () => {
    process.env.FIREBASE_AUTH_MODE = "mock";
    const service = new FirebaseAuthService();

    await expect(service.verifyIdToken("dev:user-1:user@example.com")).resolves.toEqual({
      claims: { roles: [] },
      email: "user@example.com",
      provider: "firebase",
      uid: "user-1"
    });
  });

  it("rejects malformed Firebase Auth mock tokens", async () => {
    process.env.FIREBASE_AUTH_MODE = "mock";
    const service = new FirebaseAuthService();

    await expect(service.verifyIdToken("not-a-dev-token")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("returns deterministic Stripe Connect mock onboarding data", async () => {
    process.env.STRIPE_CONNECT_MODE = "mock";
    const service = new StripeConnectService();

    await expect(
      service.createExpressAccount({
        email: "shopper@example.com",
        shopperProfileId: "shopper-profile-1"
      })
    ).resolves.toEqual({
      accountId: "acct_mock_shopper-profile-1",
      livemode: false,
      provider: "stripe"
    });
  });

  it("returns deterministic Twilio Conversations mock resources", async () => {
    process.env.TWILIO_CONVERSATIONS_MODE = "mock";
    const service = new TwilioConversationsService();

    await expect(
      service.createConversation({
        bookingId: "booking-1",
        customerUserId: "customer-1",
        shopperUserId: "shopper-1"
      })
    ).resolves.toEqual({
      conversationSid: "CH_mock_booking-1",
      friendlyName: "Style Companion booking booking-1",
      provider: "twilio"
    });
  });

  it("returns local mock upload URLs for S3-compatible storage", async () => {
    process.env.MEDIA_STORAGE_MODE = "mock";
    const service = new MediaStorageService();

    await expect(
      service.createPresignedUpload({
        contentType: "image/jpeg",
        key: "uploads/example.jpg"
      })
    ).resolves.toEqual(
      expect.objectContaining({
        key: "uploads/example.jpg",
        provider: "s3-compatible",
        publicUrl: "http://localhost:3000/mock-media/uploads%2Fexample.jpg"
      })
    );
  });

  it("returns mock Firebase Cloud Messaging sends", async () => {
    process.env.FCM_MODE = "mock";
    const service = new FcmNotificationService();

    await expect(
      service.sendToToken("device-token", {
        body: "Your booking was accepted.",
        title: "Booking update"
      })
    ).resolves.toEqual(
      expect.objectContaining({
        provider: "firebase-cloud-messaging",
        target: "device-token",
        title: "Booking update"
      })
    );
  });

  it("fails closed when a live wrapper is selected without required secrets", async () => {
    process.env.STRIPE_CONNECT_MODE = "live";
    delete process.env.STRIPE_SECRET_KEY;
    const service = new StripeConnectService();

    await expect(
      service.createExpressAccount({
        email: "shopper@example.com",
        shopperProfileId: "shopper-profile-1"
      })
    ).rejects.toThrow("Missing required integration environment variables: STRIPE_SECRET_KEY");
  });
});
