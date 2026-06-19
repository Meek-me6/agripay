import moolreClient from './moolreClient';

/**
 * Payments API — collect money via Mobile Money and Cards.
 * Used by: Marketplace module (buyer pays into escrow),
 * Cooperative module (member contributions into group savings).
 *
 * TODO: confirm exact endpoint paths against current Moolre docs.
 */

export async function collectPayment({ phone, amount, reference }) {
  const { data } = await moolreClient.post(`/payments/collect`, {
    payer: phone,
    amount,
    currency: 'GHS',
    reference,
  });
  return data;
}

export async function getPaymentStatus(reference) {
  const { data } = await moolreClient.get(`/payments/status`, {
    params: { reference },
  });
  return data;
}
