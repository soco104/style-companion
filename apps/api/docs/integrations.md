# Production Integration Wrappers

The MVP API includes integration boundaries for production providers, but local development defaults to mocks and live SDK calls are intentionally disabled until the product is ready to enable them deliberately.

## Modes

Each integration has a mode environment variable:

- `mock`: local deterministic implementation; no network calls.
- `live`: validates required secrets and fails closed with a clear error because live SDK calls are not enabled in this MVP.

## Firebase Auth

Wrapper: `FirebaseAuthService`  
Middleware: `FirebaseAuthMiddleware`

Environment:

- `AUTH_REQUIRED`: set to `true` to require a bearer token on API routes.
- `FIREBASE_AUTH_MODE`: `mock` or `live`.
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Local mock token format:

```text
Authorization: Bearer dev:<uid>[:email]
```

The middleware attaches the verified user to `req.auth`. It excludes health, Swagger docs, and `POST /auth/dev-login`.

## Stripe Connect

Wrapper: `StripeConnectService`

Environment:

- `STRIPE_CONNECT_MODE`: `mock` or `live`.
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_REFRESH_URL`
- `STRIPE_CONNECT_RETURN_URL`

Mock behavior returns deterministic account IDs and onboarding links. The payment module still uses manual placeholder payments; the wrapper is available for future onboarding and payout flows.

## Twilio Conversations

Wrapper: `TwilioConversationsService`

Environment:

- `TWILIO_CONVERSATIONS_MODE`: `mock` or `live`.
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_CONVERSATIONS_SERVICE_SID`

Mock behavior returns deterministic conversation SIDs and participant tokens. Chat remains a placeholder until realtime messaging is intentionally enabled.

## S3-Compatible Media Storage

Wrapper: `MediaStorageService`

Environment:

- `MEDIA_STORAGE_MODE`: `mock` or `live`.
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`

Mock behavior returns local fake upload and public URLs. No objects are stored in mock mode.

## Firebase Cloud Messaging

Wrapper: `FcmNotificationService`

Environment:

- `FCM_MODE`: `mock` or `live`.
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Mock behavior returns a fake message ID and does not send a push notification.

## Status Endpoint

Use:

```text
GET /integrations/status
```

This returns the current mode for each wrapper and whether API auth is required.
