import moolreClient from './moolreClient';

/**
 * Account API — wallets, sub-accounts, balances.
 * Used by: Credit module (transaction history as score proxy),
 * Cooperative module (group savings sub-accounts).
 *
 * TODO: confirm exact endpoint paths against current Moolre docs —
 * placeholders below follow Moolre's general REST pattern.
 */

export async function getWalletBalance(accountId) {
  const { data } = await moolreClient.get(`/account/balance`, {
    params: { account: accountId },
  });
  return data;
}

export async function createSubAccount(farmerProfile) {
  const { data } = await moolreClient.post(`/account/sub-account`, {
    name: farmerProfile.name,
    phone: farmerProfile.phone,
    type: 'individual',
  });
  return data;
}

export async function getTransactionHistory(accountId) {
  const { data } = await moolreClient.get(`/account/transactions`, {
    params: { account: accountId },
  });
  return data;
}
