/**
 * backend/src/config.js
 *
 * Single source of truth for every magic number / string in the backend.
 * Values that must differ per environment live in .env; everything else here.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
module.exports.JWT_EXPIRY       = process.env.JWT_EXPIRY      || '90d';
module.exports.BCRYPT_ROUNDS    = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ─── Locale / currency ────────────────────────────────────────────────────────
module.exports.CURRENCY           = process.env.CURRENCY             || 'GHS';
module.exports.PHONE_COUNTRY_CODE = process.env.PHONE_COUNTRY_CODE   || '+233';

// ─── Moolre ───────────────────────────────────────────────────────────────────
module.exports.MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER || '10900106071803';
module.exports.MOOLRE_API_VASKEY     = process.env.MOOLRE_API_VASKEY     || '';

// ─── Credit scoring ───────────────────────────────────────────────────────────
module.exports.CREDIT = {
  BASE_SCORE:             300,
  MAX_SCORE:              850,
  MAX_CONTRIBUTION_BONUS: 150,   // up to this for coop contributions
  PER_CONTRIBUTION_PTS:    15,   // points per contribution
  MAX_ACTIVITY_BONUS:     100,   // up to this for app engagement
  PER_ACTIVITY_PTS:         5,   // points per activity event
  REPAID_LOAN_BONUS:       50,   // bonus per repaid loan
  ACTIVE_LOAN_BONUS:       20,   // bonus per active loan
  APPROVAL_BOOST:          20,   // one-time boost on loan approval
  LOAN_MULTIPLIER:        2.5,   // max_loan = floor(credit_score * LOAN_MULTIPLIER)
  INTEREST_RATE:          0.08,  // 8% flat interest on loan amount
};

// ─── Activity feed ────────────────────────────────────────────────────────────
module.exports.ACTIVITY_FEED_LIMIT = parseInt(process.env.ACTIVITY_FEED_LIMIT || '20', 10);
