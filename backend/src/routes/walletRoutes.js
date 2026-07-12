const router = require('express').Router();
const db     = require('../db');
const { moolrePayment, moolrePaymentStatus, moolreTransfer, moolreTransferStatus } = require('../moolre');
const auth   = require('../auth');
const { CURRENCY, PHONE_COUNTRY_CODE, MOOLRE_ACCOUNT_NUMBER } = require('../config');

const CHANNEL_MAP = { mtn: '1', telecel: '6', airteltigo: '7', bank: '2' };

function toMoolrePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0'))   return '233' + digits.slice(1);
  return '233' + digits;
}

// POST /wallet/deposit
router.post('/deposit', auth, async (req, res) => {
  const { amount, phone, channel: channelKey } = req.body;
  if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const channel     = CHANNEL_MAP[channelKey] || CHANNEL_MAP.mtn;
  const externalref = `deposit_${req.farmer.id}_${Date.now()}`;
  let payment_ref   = externalref;

  try {
    const { data } = await moolrePayment.post('/open/transact/payment', {
      type: 1, channel, currency: CURRENCY,
      payer: toMoolrePhone(phone), amount: String(parseFloat(amount)),
      externalref, otpcode: '', reference: 'AgriPay wallet top-up',
      sessionid: '', accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    payment_ref = data?.reference || data?.transaction_id || externalref;
  } catch (e) {
    console.warn('[Moolre deposit error]', e?.response?.data || e.message);
    return res.status(502).json({ error: 'Deposit failed', detail: e?.response?.data || e.message });
  }

  const { rows } = await db.query(
    `UPDATE farmers SET wallet_balance = wallet_balance + $1 WHERE id = $2
     RETURNING wallet_balance`,
    [parseFloat(amount), req.farmer.id]
  );
  await db.query(
    `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'wallet', $2, 'arrow-down-circle-outline')`,
    [req.farmer.id, `Deposited ${CURRENCY} ${amount} to wallet`]
  );
  res.json({ wallet_balance: rows[0].wallet_balance, payment_ref });
});

// POST /wallet/withdraw
router.post('/withdraw', auth, async (req, res) => {
  const { amount, phone, channel: channelKey } = req.body;
  if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const { rows: farmerRows } = await db.query(
    `SELECT wallet_balance FROM farmers WHERE id = $1`, [req.farmer.id]
  );
  const currentBalance = parseFloat(farmerRows[0]?.wallet_balance) || 0;
  if (currentBalance < parseFloat(amount)) {
    return res.status(400).json({ error: `Insufficient balance. Wallet has ${CURRENCY} ${currentBalance.toFixed(2)}` });
  }

  const channel     = CHANNEL_MAP[channelKey] || CHANNEL_MAP.mtn;
  const externalref = `withdraw_${req.farmer.id}_${Date.now()}`;
  let transfer_ref  = externalref;

  try {
    const { data } = await moolreTransfer.post('/open/transact/transfer', {
      type: 1, channel, currency: CURRENCY,
      amount: String(parseFloat(amount)), receiver: toMoolrePhone(phone),
      sublistid: '', externalref, reference: 'AgriPay wallet withdrawal',
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    transfer_ref = data?.reference || data?.transaction_id || externalref;
  } catch (e) {
    console.warn('[Moolre withdrawal error]', e?.response?.data || e.message);
    return res.status(502).json({ error: 'Withdrawal failed', detail: e?.response?.data || e.message });
  }

  const { rows } = await db.query(
    `UPDATE farmers SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance`,
    [parseFloat(amount), req.farmer.id]
  );
  await db.query(
    `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'wallet', $2, 'arrow-up-circle-outline')`,
    [req.farmer.id, `Withdrew ${CURRENCY} ${amount} to MoMo`]
  );
  res.json({ wallet_balance: rows[0].wallet_balance, transfer_ref });
});

// GET /wallet/status/:ref
router.get('/status/:ref', auth, async (req, res) => {
  try {
    const { data } = await moolrePaymentStatus.post('/open/transact/status', {
      type: 1, idtype: '1', id: req.params.ref, accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Status check failed', detail: e?.response?.data || e.message });
  }
});

// GET /wallet/transfer-status/:ref
router.get('/transfer-status/:ref', auth, async (req, res) => {
  try {
    const { data } = await moolreTransferStatus.post('/open/transact/status', {
      type: 1, idtype: '1', id: req.params.ref, accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Transfer status check failed', detail: e?.response?.data || e.message });
  }
});

module.exports = router;
