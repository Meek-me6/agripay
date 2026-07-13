/**
 * src/api/walletApi.js
 *
 * Wallet API — routes ALL calls through the Express backend.
 * The backend handles auth (JWT), talks to Moolre, and updates Supabase.
 *
 * Flow:
 *   App → POST /wallet/deposit  → Backend → Moolre (collect)
 *   App → POST /wallet/withdraw → Backend → Moolre (transfer)
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/appConfig';

// ─── Helper: build an authed axios instance ──────────────────────────────────
async function backendClient() {
  const token = await AsyncStorage.getItem('jwt');
  return axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Network → Moolre channel code mapping ───────────────────────────────────
const NETWORK_CHANNEL = {
  'MTN MoMo':        'mtn',
  'Telecel Cash':    'telecel',
  'AirtelTigo Money':'airteltigo',
  'Bank Transfer':   'bank',
};

/**
 * Deposit: collect from farmer's MoMo into AgriPay wallet.
 * POST /wallet/deposit
 *
 * @param {number} amount          - amount in GHS
 * @param {string} phone           - farmer's MoMo number
 * @param {string} network         - selected network label (from NETWORKS array in WalletScreen)
 * @param {number} currentBalance  - not used server-side; kept for local fallback display only
 * @returns {{ wallet_balance: number, payment_ref: string }}
 */
export async function depositToWallet(amount, phone, network = 'MTN MoMo', currentBalance = 0) {
  const client = await backendClient();
  const { data } = await client.post('/wallet/deposit', {
    amount,
    phone,
    channel: NETWORK_CHANNEL[network] || 'mtn',
  });
  // data = { wallet_balance, payment_ref }
  return data;
}

/**
 * Withdraw: send from AgriPay wallet to farmer's MoMo.
 * POST /wallet/withdraw
 *
 * @param {number} amount          - amount in GHS
 * @param {string} phone           - farmer's MoMo number
 * @param {string} network         - selected network label
 * @param {number} currentBalance  - not used server-side; kept for local fallback display only
 * @returns {{ wallet_balance: number, transfer_ref: string }}
 */
export async function withdrawFromWallet(amount, phone, network = 'MTN MoMo', currentBalance = 0) {
  const client = await backendClient();
  const { data } = await client.post('/wallet/withdraw', {
    amount,
    phone,
    channel: NETWORK_CHANNEL[network] || 'mtn',
  });
  // data = { wallet_balance, transfer_ref }
  return data;
}

/**
 * Check payment status by externalref (after deposit).
 * GET /wallet/status/:ref
 */
export async function checkPaymentStatus(ref) {
  const client = await backendClient();
  const { data } = await client.get(`/wallet/status/${encodeURIComponent(ref)}`);
  return data;
}

/**
 * Check transfer status by externalref (after withdrawal).
 * GET /wallet/transfer-status/:ref
 */
export async function checkTransferStatus(ref) {
  const client = await backendClient();
  const { data } = await client.get(`/wallet/transfer-status/${encodeURIComponent(ref)}`);
  return data;
}
