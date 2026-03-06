export const XP_PER_CORRECT_ANSWER = 10;

export const TRIAL_DURATION_DAYS = 7;

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const EXERCISE_SESSION_SIZE = 10;

export const SUPPORTED_LOCALES = ['ru', 'uk', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
