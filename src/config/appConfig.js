/**
 * src/config/appConfig.js
 *
 * Central home for every magic value used in the frontend.
 * Edit these instead of hunting through screens.
 */

// ─── Backend ──────────────────────────────────────────────────────────────────
// EXPO_PUBLIC_* vars are automatically available via process.env in Expo SDK 49+
// Set EXPO_PUBLIC_BACKEND_URL in your .env file (see .env.example)
export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'https://agripay-backend-api-production.up.railway.app';

// ─── Locale / currency ────────────────────────────────────────────────────────
export const CURRENCY         = 'GHS';          // ISO 4217 currency code
export const PHONE_COUNTRY_CODE = '+233';       // Ghana dial prefix

// ─── USSD ─────────────────────────────────────────────────────────────────────
export const USSD_SHORT_CODE  = '*XXX#';        // Replace with your real short code

// ─── Activity feed display limits ─────────────────────────────────────────────
export const HOME_FEED_LIMIT     = 6;           // items shown on HomeScreen
export const ACTIVITY_FEED_LIMIT = 20;          // items fetched from local DB

// ─── Cooperative ──────────────────────────────────────────────────────────────
export const COOP_MAX_GROUP_SIZE  = 50;          // max farmers per cooperative group
export const COOP_MONTHLY_TARGET  = 100;         // monthly contribution target (in CURRENCY units)

// ─── Credit scoring (mirrors backend/src/config.js — keep in sync) ───────────
export const CREDIT = {
  MAX_SCORE:       850,
  BASE_SCORE:      300,
  LOAN_MULTIPLIER: 2.5,    // max_loan = floor(credit_score * LOAN_MULTIPLIER)
  INTEREST_RATE:   0.08,   // 8% flat
};
