# Style Companion

Style Companion is a cross-platform marketplace for customers who need wardrobe and shopping help, and local style guides who meet them in person to teach practical styling skills.

This repository is the initial monorepo scaffold only. It intentionally contains no marketplace feature logic yet.

## MVP Stack

- React Native Expo mobile app for iOS and Android
- NestJS API for backend business rules
- PostgreSQL as the source of truth
- Prisma for database access and migrations
- Next.js admin portal
- TypeScript across apps and shared packages
- pnpm workspace for monorepo management

## Product Constraints

- No AI features
- No camera measurement automation
- Backend owns business rules
- PostgreSQL remains the source of truth
- Keep code clean, documented, and testable

## Repository Layout

```text
apps/
  admin/   Next.js admin portal
  api/     NestJS API and Prisma schema
  mobile/  Expo React Native app
packages/
  shared/  Shared TypeScript contracts and utilities
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start PostgreSQL:

```bash
pnpm db:up
```

Copy the API environment template:

```bash
cp apps/api/.env.example apps/api/.env
```

Generate the Prisma client:

```bash
pnpm prisma:generate
```

Create local database tables:

```bash
pnpm prisma:migrate
```

Seed local development data:

```bash
pnpm db:seed
```

Run apps during development:

```bash
pnpm --filter @style-companion/api dev
pnpm --filter @style-companion/mobile dev
pnpm --filter @style-companion/admin dev
```

## Architecture Notes

- The API is the boundary for marketplace behavior, validation, authorization, and business rules.
- Mobile and admin clients should call backend APIs instead of duplicating domain decisions.
- Shared packages should contain stable contracts and small framework-agnostic utilities only.
- Database schema changes should go through Prisma migrations once feature work begins.

## Deployment

This repo is prepared for deployment, but it does not deploy automatically.

### Containers

Build production images from the repo root:

```bash
docker build -f apps/api/Dockerfile -t style-companion-api .
docker build -f apps/admin/Dockerfile -t style-companion-admin .
```

Runtime health checks:

- API liveness: `GET /health/live`
- API readiness: `GET /health/ready`
- Admin: `GET /`

### Production Environment

Start from these templates:

- `apps/api/.env.production.example`
- `apps/admin/.env.production.example`

The API template includes database, auth, Stripe Connect, Twilio Conversations, S3-compatible storage, and Firebase Cloud Messaging variables. Integration wrappers default to mock mode until live behavior is explicitly enabled in code and environment.

### CI

GitHub Actions workflow:

- `.github/workflows/ci.yml`

The CI pipeline installs dependencies, generates Prisma Client, validates Prisma schema, runs lint, typecheck, tests, builds packages, and verifies API/admin Docker image builds.

### Prisma Migrations

For production-like environments, apply committed Prisma migrations with:

```bash
pnpm prisma:migrate:deploy
```

There is also a manual GitHub Actions workflow:

- `.github/workflows/prisma-migrate.yml`

It runs only via `workflow_dispatch` and requires a GitHub Environment containing the `DATABASE_URL` secret.

### API Operations

The NestJS API now emits structured JSON logs and returns consistent error responses:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed.",
    "statusCode": 400,
    "path": "/bookings",
    "method": "POST",
    "requestId": "request-id",
    "timestamp": "2026-07-07T00:00:00.000Z"
  }
}
```
