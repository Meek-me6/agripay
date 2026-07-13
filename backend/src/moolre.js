/**
 * backend/src/moolre.js
 *
 * Moolre API clients — credentials loaded from process.env (set in .env).
 *
 * Auth headers per operation:
 *   X-API-PUBKEY → moolrePayment, moolrePaymentStatus, moolrePaymentId,
 *                  moolreBankAccount, moolrePaymentLink
 *   X-API-KEY    → moolreTransfer, moolreTransferStatus, moolreValidate,
 *                  moolreInternal, moolreAccount
 */
const axios = require('axios');

const BASE_URL   = process.env.MOOLRE_BASE_URL || 'https://api.moolre.com';
const API_USER   = process.env.MOOLRE_API_USER || 'gbekus';
const API_KEY    = process.env.MOOLRE_API_KEY;    // private key  (X-API-KEY)
const API_PUBKEY = process.env.MOOLRE_API_PUBKEY; // public key   (X-API-PUBKEY)
const API_VASKEY = process.env.MOOLRE_API_VASKEY; // VAS key      (X-API-VASKEY, if needed)

if (!API_KEY)    console.warn('[moolre] MOOLRE_API_KEY is not set in .env');
if (!API_PUBKEY) console.warn('[moolre] MOOLRE_API_PUBKEY is not set in .env');

function makeClient(authHeader) {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'X-API-USER':   API_USER,
      ...authHeader,
    },
  });
}

const PUBKEY_HEADER = { 'X-API-PUBKEY': API_PUBKEY };
const KEY_HEADER    = { 'X-API-KEY':    API_KEY    };

// ─── PUBKEY clients ───────────────────────────────────────────────────────────
const moolrePayment       = makeClient(PUBKEY_HEADER); // POST /open/transact/payment
const moolrePaymentStatus = makeClient(PUBKEY_HEADER); // POST /open/transact/status  (payment)
const moolrePaymentId     = makeClient(PUBKEY_HEADER); // POST /open/account/create   (type 2)
const moolreBankAccount   = makeClient(PUBKEY_HEADER); // POST /open/account/create   (type 9)
const moolrePaymentLink   = makeClient(PUBKEY_HEADER); // POST /embed/link

// ─── KEY clients ─────────────────────────────────────────────────────────────
const moolreTransfer       = makeClient(KEY_HEADER); // POST /open/transact/transfer
const moolreTransferStatus = makeClient(KEY_HEADER); // POST /open/transact/status  (transfer)
const moolreValidate       = makeClient(KEY_HEADER); // POST /open/transact/validate
const moolreInternal       = makeClient(KEY_HEADER); // POST /open/transact/internal
const moolreAccount        = makeClient(KEY_HEADER); // POST /open/account/*

// ─── Error logger ─────────────────────────────────────────────────────────────
function attachLogger(client, label) {
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error(`[Moolre:${label}]`, err?.response?.status, err?.response?.data || err.message);
      return Promise.reject(err);
    }
  );
}

attachLogger(moolrePayment,        'payment');
attachLogger(moolrePaymentStatus,  'payment-status');
attachLogger(moolrePaymentId,      'payment-id');
attachLogger(moolreBankAccount,    'bank-account');
attachLogger(moolrePaymentLink,    'payment-link');
attachLogger(moolreTransfer,       'transfer');
attachLogger(moolreTransferStatus, 'transfer-status');
attachLogger(moolreValidate,       'validate');
attachLogger(moolreInternal,       'internal');
attachLogger(moolreAccount,        'account');

module.exports = {
  moolrePayment,
  moolrePaymentStatus,
  moolrePaymentId,
  moolreBankAccount,
  moolrePaymentLink,
  moolreTransfer,
  moolreTransferStatus,
  moolreValidate,
  moolreInternal,
  moolreAccount,
};
