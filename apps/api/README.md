# Style Companion API

NestJS API placeholder.

The backend owns business rules for the marketplace. Swagger/OpenAPI documentation is exposed at `/docs` when the API is running.

## Modules

- `auth` development identity lookup
- `users`
- `customer-profiles`
- `shopper-profiles`
- `style-quiz`
- `matching`
- `bookings`
- `reviews`
- `payments` placeholder
- `chat` placeholder
- `safety-reports`
- `integrations` mock-first production provider boundaries

## Core MVP Endpoints

- `POST /profiles/customer`
- `POST /profiles/shopper`
- `POST /style-quiz`
- `GET /shoppers/matches`
- `POST /bookings`
- `POST /bookings/:id/accept`
- `POST /bookings/:id/decline`
- `POST /bookings/:id/cancel`
- `POST /bookings/:id/complete`
- `POST /bookings/:id/reviews`
- `POST /reviews/:id/response`
- `POST /safety-reports`

## Local Data

The Prisma schema defines the MVP marketplace entities and relationships. Seed data is available for local development:

```bash
pnpm --filter @style-companion/api prisma:migrate
pnpm --filter @style-companion/api db:seed
```

The seed script clears existing local rows before inserting sample admin, customer, shopper, booking, review, payment, media, chat, and safety report records.

## Integration Wrappers

The API includes mock-first wrappers for Firebase Auth, Stripe Connect, Twilio Conversations, S3-compatible media storage, and Firebase Cloud Messaging.

See [docs/integrations.md](docs/integrations.md) for local mock behavior and the environment variables required before live providers can be enabled intentionally.
