import axios from 'axios';

/**
 * MOOLRE API CLIENT — Agripay
 * ---------------------------------------------------------------
 * Moolre's docs list requests authenticated via headers that vary
 * by endpoint family: X-API-USER, X-API-KEY, X-API-PUBKEY, and
 * X-API-VASKEY. Since it wasn't clear from the competition info
 * whether this is one shared key or several distinct ones, every
 * slot below is a separate placeholder. Paste in whatever Moolre
 * actually issues you — if it's a single key, just fill in
 * MOOLRE_API_KEY and leave the rest blank, the client only sends
 * headers that have a value.
 *
 * SECURITY NOTE: Hardcoding real secret keys here and shipping
 * them in an Expo Go / built app is NOT safe for production —
 * they'd be extractable from the bundle. For the competition demo
 * this is fine. Before any real money moves, put Transfers/
 * Payments/Account calls behind your own backend and have the
 * app call YOUR server instead of Moolre directly. Toggle that
 * below with USE_BACKEND_PROXY.
 */

// ---- 1. PASTE YOUR MOOLRE CREDENTIALS HERE ----
const MOOLRE_API_USER = 'YOUR_MOOLRE_API_USER_HERE';
const MOOLRE_API_KEY = 'YOUR_MOOLRE_API_KEY_HERE';
const MOOLRE_API_PUBKEY = 'YOUR_MOOLRE_API_PUBKEY_HERE';
const MOOLRE_API_VASKEY = 'YOUR_MOOLRE_API_VASKEY_HERE';

const MOOLRE_BASE_URL = 'https://api.moolre.com'; // confirm exact base path in current docs

// ---- 2. DEMO vs BACKEND-PROXY MODE ----
// false = app calls Moolre directly (fine for a hackathon demo)
// true  = app calls YOUR backend at BACKEND_URL, which then calls Moolre
const USE_BACKEND_PROXY = false;
const BACKEND_URL = 'https://your-backend.example.com/api';

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (MOOLRE_API_USER && !MOOLRE_API_USER.startsWith('YOUR_'))
    headers['X-API-USER'] = MOOLRE_API_USER;
  if (MOOLRE_API_KEY && !MOOLRE_API_KEY.startsWith('YOUR_'))
    headers['X-API-KEY'] = MOOLRE_API_KEY;
  if (MOOLRE_API_PUBKEY && !MOOLRE_API_PUBKEY.startsWith('YOUR_'))
    headers['X-API-PUBKEY'] = MOOLRE_API_PUBKEY;
  if (MOOLRE_API_VASKEY && !MOOLRE_API_VASKEY.startsWith('YOUR_'))
    headers['X-API-VASKEY'] = MOOLRE_API_VASKEY;
  return headers;
}

export const moolreClient = axios.create({
  baseURL: USE_BACKEND_PROXY ? BACKEND_URL : MOOLRE_BASE_URL,
  timeout: 15000,
});

moolreClient.interceptors.request.use((config) => {
  if (!USE_BACKEND_PROXY) {
    config.headers = { ...config.headers, ...buildHeaders() };
  }
  return config;
});

export const keysConfigured = () =>
  [MOOLRE_API_USER, MOOLRE_API_KEY, MOOLRE_API_PUBKEY, MOOLRE_API_VASKEY].some(
    (k) => k && !k.startsWith('YOUR_')
  );

export default moolreClient;
