// User
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum NativeLanguage {
  RU = 'RU',
  UK = 'UK',
  EN = 'EN',
}

// Subscription
export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum SubscriptionPlatform {
  STRIPE = 'STRIPE',
  APP_STORE = 'APP_STORE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
}

// Exercises
export enum ExerciseType {
  SINGULAR_PLURAL = 'SINGULAR_PLURAL',
  FLASHCARDS = 'FLASHCARDS',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
}

// Webhook
export enum WebhookSource {
  STRIPE = 'stripe',
  REVENUECAT = 'revenuecat',
}

// DTOs / API response shapes
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  nativeLanguage: NativeLanguage;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CategoryDto {
  id: string;
  nameHr: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

export interface WordSetDto {
  id: string;
  categoryId: string;
  nameHr: string;
  nameRu: string;
  nameUk: string;
  nameEn: string;
}

export interface WordDto {
  id: string;
  wordSetId: string;
  baseForm: string;
  translationRu: string;
  translationUk: string;
  translationEn: string;
}

export interface ExerciseSessionDto {
  id: string;
  exerciseType: ExerciseType;
  wordSetId: string;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  completedAt: string | null;
}

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  intervalMonths: number;
  priceEur: number;
  priceUsd: number;
}

export interface SubscriptionDto {
  id: string;
  status: SubscriptionStatus;
  platform: SubscriptionPlatform;
  currency: Currency;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  plan: SubscriptionPlanDto;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}
