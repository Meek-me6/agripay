/**
 * src/api/accountApi.js
 *
 * Account API — proxied through the Express backend.
 * The backend talks to Moolre's /open/account/* endpoints
 * and keeps credentials server-side.
 *
 * POST /account/status       — Moolre account status & balance
 * POST /account/transactions — transaction history
 * POST /account/update       — update account settings
 */
import backendClient from './backendClient';

/**
 * Get Moolre account status / balance.
 * @returns {object} Moolre account status
 */
export async function getAccountStatus() {
  const client = await backendClient();
  const { data } = await client.post('/account/status');
  return data;
}

/**
 * Get transaction history.
 * @param {object} opts - optional { startdate, enddate, limit }
 * @returns {object} transaction list
 */
export async function getTransactionHistory(opts = {}) {
  const client = await backendClient();
  const { data } = await client.post('/account/transactions', opts);
  return data;
}

/**
 * Update Moolre account settings.
 * @param {object} settings
 * @returns {object} updated account info
 */
export async function updateAccount(settings = {}) {
  const client = await backendClient();
  const { data } = await client.post('/account/update', settings);
  return data;
}
