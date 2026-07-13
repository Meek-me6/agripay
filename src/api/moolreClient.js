/**
 * src/api/moolreClient.js
 *
 * Moolre API clients for direct calls from the app.
 * Credentials baked in exactly as provided by Ernest Boamah (7 Jul 2026).
 *
 * NOTE: All payment/transfer calls go through the Express backend
 *       (see accountApi, paymentsApi, transfersApi, walletApi).
 *       This file is kept for any direct Moolre calls that may be
 *       needed, but the backend should be the primary integration point.
 *
 * moolrePayment  — uses X-API-PUBKEY (for /open/transact/payment)
 * moolreTransfer — uses X-API-KEY    (for /open/transact/transfer)
 */
import axios from 'axios';

const BASE_URL   = 'https://api.moolre.com';
const API_USER   = 'gbekus';
// Private key (X-API-KEY) — updated July 2026
const API_KEY    = 'zymdxlRASW5uATWE7Sm4Xo2uH6DDzacsnqbdpS1k4cEaZrb6fzJ9DcgIL1oo3W53';
// Public key (X-API-PUBKEY)
const API_PUBKEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOjEwOTAwMSwiZXhwIjoxOTU2NTQ1OTk5fQ.k-zaeQo62LD7KgvDwE-xHsjfD_TqXxZst1FiSDcBUZs';
// Moolre account number
export const MOOLRE_ACCOUNT_NUMBER = '10900106071803';

// Payment client — X-API-USER + X-API-PUBKEY
export const moolrePayment = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-USER':   API_USER,
    'X-API-PUBKEY': API_PUBKEY,
  },
});

// Transfer client — X-API-USER + X-API-KEY
export const moolreTransfer = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-USER':   API_USER,
    'X-API-KEY':    API_KEY,
  },
});

// Error logger
function attachLogger(client, label) {
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error(`[Moolre:${label}]`, err?.response?.status, err?.response?.data || err.message);
      return Promise.reject(err);
    }
  );
}

attachLogger(moolrePayment,  'payment');
attachLogger(moolreTransfer, 'transfer');

// Default export kept for any file that still imports the old single client
export default moolrePayment;
