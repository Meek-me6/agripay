import moolreClient from './moolreClient';

/**
 * Transfers API — disburse funds to bank accounts / mobile wallets.
 * Used by: Subsidy module (gov -> farmer payout), Marketplace
 * module (escrow release to seller), Credit module (loan payout).
 *
 * TODO: confirm exact endpoint paths against current Moolre docs.
 */

export async function disburseToFarmer({ accountId, phone, amount, reason }) {
  const { data } = await moolreClient.post(`/transfers/disburse`, {
    destination: phone,
    account: accountId,
    amount,
    currency: 'GHS',
    narration: reason,
  });
  return data;
}

export async function getTransferStatus(transferId) {
  const { data } = await moolreClient.get(`/transfers/${transferId}`);
  return data;
}
