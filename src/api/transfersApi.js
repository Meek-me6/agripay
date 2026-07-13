/**
 * src/api/transfersApi.js
 *
 * Transfers — routes ALL calls through the Express backend.
 * The backend handles Moolre API credentials and Supabase persistence.
 *
 * POST /credit/apply       — loan application
 * POST /subsidy/apply      — subsidy application
 * POST /subsidy/:id/disburse — admin-triggered disbursement
 */
import backendClient from './backendClient';

/**
 * Credit: submit a loan application.
 * @param {number} amount
 * @param {number} term_months
 * @param {string} purpose
 * @returns {object} loan record
 */
export async function applyForLoan(amount, term_months, purpose = 'Agricultural inputs') {
  const client = await backendClient();
  const { data } = await client.post('/credit/apply', { amount, term_months, purpose });
  return data;
}

/**
 * Subsidy: submit a subsidy programme application.
 * @param {string} programme
 * @param {number} amount
 * @param {Array}  items    - allocation breakdown
 * @returns {object} subsidy record
 */
export async function applyForSubsidy(programme, amount, items = []) {
  const client = await backendClient();
  const { data } = await client.post('/subsidy/apply', { programme, amount, items });
  return data;
}

/**
 * Subsidy: trigger disbursement for an approved subsidy (admin / webhook use).
 * @param {string} subsidyId
 * @returns {object} updated subsidy record
 */
export async function disburseSubsidy(subsidyId) {
  const client = await backendClient();
  const { data } = await client.post(`/subsidy/${subsidyId}/disburse`);
  return data;
}
