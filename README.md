# Croatian Grammar — MVP Development Plan

## Context

An application for learning Croatian grammar through interactive exercises. Target platforms: Android, iOS, Web, and Admin Panel (web only). MVP with subscription, trial period, and gamification system.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Web + Admin UI | React.js + TypeScript + Material UI (MUI) |
| Mobile | Expo (React Native) + Expo Router |
| Backend | NestJS + TypeScript (Node.js 24 LTS) |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| State | Redux Toolkit + TanStack Query |
| Forms | React Hook Form + Zod |
| i18n | i18next + react-i18next |
| Authentication | Passport.js (Google OAuth2 + Apple) + JWT |
| Web Payments | Stripe (Checkout + Customer Portal) |
| Mobile Payments | RevenueCat (App Store + Google Play IAP) |
| Push Notifications | Expo Notifications + BullMQ |
| Frontend Tests | Jest + React Testing Library |
| Backend Tests | Node.js `node:test` (built-in) |
| Linting | ESLint (eslint-config-airbnb) + Prettier |
| Pre-commit | Husky + lint-staged (runs tests) |
| Error Monitoring | Sentry |
| API Deploy | Railway (PostgreSQL + Redis included) |
| Web/Admin Deploy | Vercel |
| Mobile Deploy | Expo EAS Build + EAS Submit |


---

## Monorepo Structure

```
cro-grammar/
├── .github/
│   └── workflows/
│       ├── ci.yml            # lint + typecheck + test on every PR
│       └── deploy.yml        # deploy on merge to main
├── .husky/
│   ├── pre-commit            # runs lint-staged
│   └── commit-msg            # commitlint (Conventional Commits)
├── packages/
│   ├── shared/               # @cro/shared — shared TS types, constants, utilities
│   ├── ui/                   # @cro/ui — shared MUI components (web + admin)
│   └── config/               # @cro/config — ESLint, Prettier, tsconfig, jest base config
│
├── apps/
│   ├── api/                  # @cro/api — NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      # feature modules (see below)
│   │   │   ├── common/       # guards, interceptors, decorators
│   │   │   ├── config/       # ConfigModule + env validation via zod
│   │   │   └── prisma/       # PrismaService + schema.prisma
│   │   └── test/             # e2e tests (supertest)
│   │
│   ├── web/                  # @cro/web — React app for students
│   │   └── src/
│   │       ├── app/          # providers, routing
│   │       ├── features/     # auth, exercises, progress, subscription
│   │       ├── store/        # Redux store + RTK slices
│   │       ├── api/          # TanStack Query hooks + axios client
│   │       └── i18n/         # Russian/Ukrainian/English locales
│   │
│   ├── admin/                # @cro/admin — React admin panel
│   │   └── src/
│   │       ├── features/     # content-mgmt, users, analytics, pricing
│   │       └── api/          # TanStack Query hooks
│   │
│   └── mobile/               # @cro/mobile — Expo app
│       └── app/              # Expo Router (file-based routing)
│           ├── (auth)/       # login.tsx
│           └── (tabs)/       # index, exercises, profile
│
├── turbo.json
├── package.json              # root workspace
├── docker-compose.yml        # postgres + redis for local development
└── .nvmrc                    # Node 24 LTS
```

---

## Database Schema (PostgreSQL + Prisma)

### Key Entities

```
User
  id, email, name, avatarUrl, role (STUDENT|ADMIN)
  nativeLanguage (RU|UK|EN)
  googleId, appleId
  xpTotal, currentStreak, longestStreak, lastPracticeDate
  expoPushToken
  isBlocked

SubscriptionPlan             <- configured via admin panel
  name, intervalMonths (1|12)
  priceEur, priceUsd
  stripePriceIdEur, stripePriceIdUsd
  rcProductIdIos, rcProductIdAndroid

Subscription
  userId (1:1 with User)
  planId, platform (STRIPE|APP_STORE|GOOGLE_PLAY)
  status (TRIALING|ACTIVE|PAST_DUE|CANCELED|EXPIRED)
  currency (EUR|USD)
  trialStartedAt, trialEndsAt
  currentPeriodStart, currentPeriodEnd
  stripeCustomerId, stripeSubscriptionId
  rcOriginalAppUserId

WebhookEvent                 <- idempotent processing
  source ("stripe"|"revenuecat")
  externalEventId @unique    <- idempotency key
  payload (Json)

Category
  nameHr, nameRu, nameUk, nameEn
  sortOrder, isActive

WordSet
  categoryId, nameHr, nameRu, nameUk, nameEn

Word
  wordSetId
  baseForm          <- Croatian (nominative case, singular)
  pluralForm        <- Croatian (nominative case, plural)
  translationRu, translationUk, translationEn
  sentenceHr        <- sentence with {{BLANK}} for fill-in-the-blank
  sentenceBlankAnswer
  wrongOptions (Json)  <- 3 distractor options for multiple choice

WordExerciseConfig
  wordId + exerciseType @unique   <- which exercise types are enabled for a word

UserWordProgress
  userId + wordId + exerciseType  @unique
  seenInCurrentCycle (Boolean)
  cycleNumber
  totalAttempts, correctAttempts
  lastSeenAt, lastCorrectAt

ExerciseSession
  userId, exerciseType, wordSetId
  totalQuestions, correctAnswers, xpEarned, completedAt

SessionAnswer
  sessionId, wordId, exerciseType, givenAnswer, isCorrect

StreakLog
  userId + date @unique   <- one record per day
  xpEarned
```

---

## NestJS Modules

| Module | Responsibility |
|---|---|
| `AuthModule` | Google OAuth2 + Apple, JWT (access 15m + refresh 30d in Redis) |
| `UsersModule` | profile, language, push token, account deletion (GDPR) |
| `ContentModule` | CRUD for categories / word sets / words (write — admin only) |
| `ExercisesModule` | sessions, answer processing, validation |
| `ProgressModule` | `UserWordProgress`, word cycle logic |
| `SubscriptionsModule` | subscription status, plan list with currency |
| `PaymentsModule` | Stripe Checkout, Customer Portal, webhook |
| `RevenueCatModule` | RevenueCat webhook (HMAC verification) |
| `GamificationModule` | XP, streak, StreakLog |
| `NotificationsModule` | BullMQ producer/consumer for Expo push |
| `AnalyticsModule` | aggregations for admin (registrations, subscriptions) |
| `AdminModule` | `AdminGuard` + admin-only endpoints |

---

## Key API Endpoints

### Auth
```
POST /auth/google
POST /auth/apple
POST /auth/refresh
POST /auth/logout
```

### Users
```
GET    /users/me
PATCH  /users/me
POST   /users/me/push-token
DELETE /users/me
```

### Content (public read)
```
GET /content/categories
GET /content/categories/:id/word-sets
GET /content/word-sets/:id/words
```

### Exercises (protected by SubscriptionGuard)
```
POST /exercises/sessions              # create session, get words
POST /exercises/sessions/:id/answer  # submit answer
POST /exercises/sessions/:id/finish  # finish, award XP
GET  /exercises/sessions/:id         # resume session
```

### Subscriptions & Payments
```
GET  /subscriptions/plans            # prices in currency by IP
GET  /subscriptions/me
POST /subscriptions/trial            # activate trial (once)
POST /payments/stripe/checkout
POST /payments/stripe/portal
POST /payments/stripe/webhook        # raw body, no auth guard
POST /revenuecat/webhook             # HMAC verification
```

### Admin
```
POST/PATCH/DELETE /admin/categories
POST/PATCH/DELETE /admin/word-sets
POST/PATCH/DELETE /admin/words
PATCH /admin/words/:id/exercise-configs
POST/PATCH        /admin/subscription-plans
GET  /admin/users
PATCH /admin/users/:id/block
GET  /admin/analytics/overview
```

---

## Exercise Types (MVP)

| Type | Mechanics | Validation |
|---|---|---|
| **Jednina i množina** | A word is shown -> user enters the plural form | trim + lowercase + NFC normalization, server-side comparison |
| **Flashcards** | Word -> tap "I knew it" / "I didn't know" (self-report) | `KNOWN` -> isCorrect=true; `UNKNOWN` -> isCorrect=false |
| **Multiple choice** | 4 options (1 correct + 3 from `wrongOptions`) | Server-side validation, correct answer not sent to client before answering |
| **Fill-in-the-blank** | Sentence with a gap (`{{BLANK}}`) | Comparison with `sentenceBlankAnswer` |

---

## Word Cycle Logic

```
getNextWords(userId, exerciseType, wordSetId, count):

1. Find words with seenInCurrentCycle = false
2. If enough -> return them
3. If words are exhausted -> offer user to reset:
     UPDATE userWordProgress
     SET seenInCurrentCycle = false,
         cycleNumber = cycleNumber + 1
     WHERE userId AND exerciseType AND wordSetId
4. If user agrees, return first N words from the reset cycle

After each answer -> markWordSeen() -> seenInCurrentCycle = true
```

**New users**: On first opening of a word set — create `UserWordProgress` records for all words with `seenInCurrentCycle = false`. This simplifies cycle queries.

---

## Payment Architecture

### Currency Detection
`CurrencyMiddleware` -> `geoip-lite.lookup(req.ip)` -> EU countries = EUR, others = USD -> attached to request context.

### Stripe (Web)
```
Click "Subscribe" ->
POST /payments/stripe/checkout { planId } ->
stripe.checkout.sessions.create(...) ->
redirect to Stripe Checkout ->
webhook: checkout.session.completed -> update Subscription in DB
```

Webhook security: `stripe.webhooks.constructEvent(rawBody, sig, secret)`. Idempotency: check `WebhookEvent.externalEventId` before processing.

### RevenueCat (Mobile)
```
Purchases.configure({ apiKey, appUserID: userId }) ->
Purchases.purchasePackage(package) ->
App Store / Google Play IAP ->
RevenueCat webhook -> POST /revenuecat/webhook ->
update Subscription in DB
```

Webhook security: HMAC from `Authorization` header (shared secret from RevenueCat dashboard).

### Trial
- Automatically activated on first login
- `status=TRIALING`, `trialEndsAt = now + 7 days`
- BullMQ schedules push notifications: 48h and 2h before expiry
- `SubscriptionGuard` checks `status IN [TRIALING, ACTIVE] AND period_end > now`

---

## Pre-commit Hooks

```bash
# .husky/pre-commit -> lint-staged

*.{ts,tsx}:
  - eslint --fix --max-warnings=0
  - prettier --write

apps/api/src/**/*.ts  -> node --test (backend unit tests)
apps/web/src/**/*.tsx -> jest --findRelatedTests --passWithNoTests
apps/admin/src/**/*.tsx -> jest --findRelatedTests --passWithNoTests
```

`--findRelatedTests` runs only tests for changed files -> pre-commit < 10 seconds.

---

## Testing Strategy

### Backend (`node:test`)
Priorities:
1. `ProgressService` — word cycle logic
2. `ExercisesService` — answer validation for all 4 types
3. `GamificationService` — streak, XP
4. `PaymentsService` — webhook idempotency

### Frontend (Jest + React Testing Library)
Priorities:
1. Exercise components — input, result
2. Auth flow
3. Paywall — trial / plan display
4. Redux slices

### Coverage (MVP)
- Backend services: 70% lines
- Frontend features: 60% lines
- Mobile: manual testing + Expo Go

---

## Gamification

- **XP**: 10 XP per correct answer (constant in config)
- **Streak**: +1 day if `lastPracticeDate` = yesterday; reset to 0 if a day is missed
- `StreakLog` — one record per day (`@@unique([userId, date])`)
- Display: web header + mobile tab bar

---

## MVP Development Phases

### Phase 1 — Foundation
- Initialize Turborepo, `@cro/config`, `@cro/shared` packages
- ESLint (airbnb) + Prettier, Husky, Docker Compose
- NestJS: ConfigModule + Prisma + Swagger
- Prisma migration (full schema)
- Vite + React + MUI for web and admin
- Expo starter project (`npx create-expo-app@latest`)
- i18next (RU/UK/EN) in all apps
- Redux + TanStack Query setup
- Basic CI (lint + typecheck + test)

**Result**: Working monorepo with all apps scaffolded.

### Phase 2 — Content + Exercise Engine
- AuthModule: Google + Apple, JWT, refresh in Redis
- Expo + Expo Router for mobile
- ContentModule (CRUD + Redis cache)
- Admin UI: categories, word sets, words
- ProgressModule + cycle logic
- ExercisesModule: sessions, validation, 4 exercise types
- Exercise screens on web and mobile
- GamificationModule: XP + streak
- Unit tests: word cycle, answer validation, streak

**Result**: Working Google/Apple login on web and mobile. All 4 exercises working. Content created via admin panel.

### Phase 3 — Subscriptions + Payments
- SubscriptionsModule + trial
- CurrencyMiddleware (geoip-lite)
- PaymentsModule: Stripe Checkout, portal, webhooks
- RevenueCatModule: webhooks + HMAC
- `react-native-purchases` in mobile
- Paywall screens on web and mobile
- Pricing UI in admin
- Push: trial expiry warnings

**Result**: Full monetization cycle on all platforms.

### Phase 4 — Notifications + Analytics + Polish
- BullMQ: daily reminders + trial expiry jobs
- Admin analytics: registration and subscription charts
- Admin: user management (view, block)
- Sentry in all 4 apps
- Performance: Redis content cache, TanStack Query tuning
- Test coverage improvements
- E2e tests: login, exercise session, subscription purchase
- Staging deploy + smoke test
- Production deploy + EAS Submit

**Result**: Release-ready MVP on all platforms.

---

## Deploy (MVP)

| Component | Platform |
|---|---|
| NestJS API | Railway (includes managed PostgreSQL + Redis) |
| PostgreSQL | Railway managed |
| Redis | Railway managed |
| Web app | Vercel |
| Admin panel | Vercel (separate project) |
| Mobile | Expo EAS Build + EAS Submit |
| Local dev | Docker Compose (postgres + redis) |

### EAS Mobile CI/CD
```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  }
}
```

OTA updates via `expo-updates` for JS changes without resubmitting to stores.

---

## Additional Libraries

| Library | Purpose |
|---|---|
| `zod` | env variable validation + form schemas |
| `react-hook-form` | frontend forms |
| `date-fns` | date handling |
| `geoip-lite` | country detection by IP -> currency |
| `class-validator` + `class-transformer` | NestJS DTO validation |
| `@nestjs/swagger` | automatic API documentation |
| `@nestjs/throttler` | rate-limiting |
| `helmet` | security headers |
| `passport-google-oauth20` + `passport-apple` | OAuth strategies |
| `@nestjs/jwt` | JWT tokens |
| `stripe` (Node SDK) | Stripe API |
| `@stripe/stripe-js` + `@stripe/react-stripe-js` | Stripe frontend |
| `react-native-purchases` | RevenueCat mobile SDK |
| `expo-notifications` | push notifications |
| `@react-navigation/native` v7 | mobile navigation (if needed alongside Expo Router) |
| `winston` or `pino` | structured logging |
| `@sentry/nestjs` + `@sentry/react` + `@sentry/react-native` | error monitoring |
| `commitlint` | Conventional Commits |

---

## Verification (How to Check Everything Works)

1. `docker compose up -d` -> `turbo run dev` -> all 4 apps start without errors
2. Log in via Google on web -> land on language selection screen -> choose language
3. Open a word set, start a "Jednina i množina" session, enter correct and incorrect answers — verify XP and word status
4. Complete all words in a set -> confirm the cycle resets and words are shown again when user confirms reset
5. Streak: log in on two consecutive days -> confirm streak = 2
6. Open paywall -> create a Stripe Checkout session -> complete test payment -> confirm status changed to ACTIVE
7. Admin: create a category -> word set -> word with translations -> confirm word appears in the app
8. Admin: change subscription price -> confirm new price is displayed in the app
9. `turbo run test` -> all tests pass
10. `turbo run lint typecheck` -> no errors

---

## Critical Files for Implementation

- `packages/shared/src/types/index.ts` — shared TS types; define in Phase 1
- `apps/api/src/prisma/schema.prisma` — full data schema; migrate before any module development
- `apps/api/src/modules/progress/progress.service.ts` — word cycle logic; most critical business logic
- `apps/api/src/modules/payments/payments.service.ts` — webhook + idempotency; bugs = financial losses
- `turbo.json` — monorepo build pipeline
- `docker-compose.yml` — local dev stack
- `.husky/pre-commit` + lint-staged config — pre-commit gates
