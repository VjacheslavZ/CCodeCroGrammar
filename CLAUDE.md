# CLAUDE.md

Croatian Grammar — an app for learning Croatian grammar through interactive exercises.
Platforms: Android, iOS, Web, Admin Panel (web only).

## Tech Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS + TypeScript (Node.js 24 LTS)
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queues**: Redis + BullMQ
- **Web + Admin**: React.js + TypeScript + MUI
- **Mobile**: Expo (React Native) + Expo Router
- **Auth**: Passport.js (Google OAuth2 + Apple) + JWT
- **Payments**: Stripe (web) + RevenueCat (mobile)

## Monorepo Structure

```
packages/
  shared/    # @cro/shared — TS types, constants, utilities
  ui/        # @cro/ui — shared MUI components (web + admin)
  config/    # @cro/config — ESLint, Prettier, tsconfig, jest config

apps/
  api/       # @cro/api — NestJS backend
  web/       # @cro/web — React student app
  admin/     # @cro/admin — React admin panel
  mobile/    # @cro/mobile — Expo app
```

## Commands

```bash
docker compose up -d          # start local postgres + redis
turbo run dev                 # run all apps
turbo run test                # run all tests
turbo run lint                # eslint
turbo run typecheck           # tsc --noEmit
```

## Backend Conventions

- NestJS feature modules in `apps/api/src/modules/`
- Tests use Node.js built-in `node:test` (not Jest)
- Prisma schema at `apps/api/src/prisma/schema.prisma`
- E2e tests in `apps/api/test/` (supertest)
- DTO validation: `class-validator` + `class-transformer`
- Env validation: zod via ConfigModule

## Frontend Conventions

- State: Redux Toolkit + TanStack Query
- Forms: React Hook Form + Zod
- Tests: Jest + React Testing Library
- i18n: i18next (RU/UK/EN locales)
- API layer: TanStack Query hooks + axios client

## Pre-commit (Husky + lint-staged)

- `*.{ts,tsx}`: eslint --fix --max-warnings=0, prettier --write
- `apps/api/src/**/*.ts`: node --test
- `apps/web/src/**/*.tsx`: jest --findRelatedTests
- `apps/admin/src/**/*.tsx`: jest --findRelatedTests

## Critical Files

- `packages/shared/src/types/index.ts` — shared TS types
- `apps/api/src/prisma/schema.prisma` — full data schema
- `apps/api/src/modules/progress/progress.service.ts` — word cycle logic (core business logic)
- `apps/api/src/modules/payments/payments.service.ts` — webhooks + idempotency (bugs = financial loss)
- `turbo.json` — monorepo build pipeline
- `docker-compose.yml` — local dev stack

## Git Workflow

- Main branch: `main`
- PRs target `main`
- Commits follow Conventional Commits (enforced by commitlint)

## Code Style

- TypeScript/JavaScript files: ~200 lines max per file. Split into smaller modules if exceeding this limit.
- Follow SOLID principles where applicable.
- Apply GoF (Gang of Four) and GRASP design patterns when they fit the problem naturally. Don't force patterns where simple code suffices.
- Add short, concise comments to explain non-obvious logic. Keep comments minimal — code should be self-documenting where possible.

## Node Version

Node.js 24 LTS (see `.nvmrc`)
