/**
 * src/api/paymentsApi.js
 *
 * Payments — routes ALL calls through the Express backend.
 * The backend handles Moolre API credentials and Supabase persistence.
 *
 * POST /listings/:id/buy   — marketplace escrow payment
 * POST /coop/contribute    — cooperative contribution
 */
import backendClient from './backendClient';

/**
 * Marketplace: collect payment from buyer's MoMo (escrow).
 * @param {string} listingId
 * @param {string} phone     - buyer's MoMo number
 * @param {number} amount    - listing price
 * @returns {{ listing, payment_ref }}
 */
export async function buyListing(listingId, phone, amount = 0) {
  const client = await backendClient();
  const { data } = await client.post(`/listings/${listingId}/buy`, { phone, amount });
  return data;
}

/**
 * Cooperative: collect contribution from member's MoMo.
 * @param {number} amount
 * @param {string} phone   - farmer's MoMo number
 * @param {string} method  - network label (e.g. "MTN MoMo")
 * @returns {object} contribution record
 */
export async function coopContribute(amount, phone, method = 'MTN MoMo') {
  const client = await backendClient();
  const { data } = await client.post('/coop/contribute', { amount, phone, method });
  return data;
}
