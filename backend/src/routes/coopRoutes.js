const router = require('express').Router();
const db     = require('../db');
const { moolrePayment } = require('../moolre');
const auth   = require('../auth');
const { CURRENCY, MOOLRE_ACCOUNT_NUMBER } = require('../config');

function toMoolrePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0'))   return '233' + digits.slice(1);
  return '233' + digits;
}

const NETWORK_CHANNEL = {
  'MTN MoMo': '1', 'Telecel Cash': '6', 'AirtelTigo Money': '7', 'Bank Transfer': '2',
};

// GET /coop
router.get('/', auth, async (req, res) => {
  try {
    const { rows: farmerRows } = await db.query(
      `SELECT coop_group FROM farmers WHERE id = $1`, [req.farmer.id]
    );
    const { rows: all } = await db.query(
      `SELECT cc.amount, cc.farmer_id, f.name
       FROM coop_contributions cc JOIN farmers f ON f.id = cc.farmer_id
       ORDER BY cc.created_at DESC`
    );
    const { rows: mine } = await db.query(
      `SELECT * FROM coop_contributions WHERE farmer_id = $1 ORDER BY created_at DESC`,
      [req.farmer.id]
    );

    const totals = {};
    all.forEach(c => {
      if (!totals[c.farmer_id]) totals[c.farmer_id] = { farmer_id: c.farmer_id, name: c.name, contributions: 0 };
      totals[c.farmer_id].contributions += parseFloat(c.amount);
    });
    const leaderboard = Object.values(totals)
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 10)
      .map((m, i) => ({
        ...m, rank: i + 1,
        avatar: m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }));

    const pool = leaderboard.reduce((s, m) => s + m.contributions, 0);
    res.json({ group: farmerRows[0]?.coop_group, pool, leaderboard, my_contributions: mine });
  } catch (e) {
    console.error('[coop]', e.message);
    res.status(500).json({ error: 'Failed to load coop data' });
  }
});

// POST /coop/contribute
router.post('/contribute', auth, async (req, res) => {
  const { amount, phone, method } = req.body;
  if (!amount || amount <= 0 || !phone) return res.status(400).json({ error: 'Missing amount or phone' });

  const channel   = NETWORK_CHANNEL[method] || '1';
  const reference = `coop_${req.farmer.id}_${Date.now()}`;
  let payment_ref = reference;

  try {
    const { data } = await moolrePayment.post('/open/transact/payment', {
      type: 1, channel, currency: CURRENCY,
      payer: toMoolrePhone(phone), amount: String(parseFloat(amount)),
      externalref: reference, otpcode: '',
      reference: 'AgriPay cooperative contribution', sessionid: '',
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    payment_ref = data?.reference || data?.transaction_id || reference;
  } catch (e) {
    console.warn('[coop payment failed]', e?.response?.data || e.message);
    return res.status(502).json({ error: 'Payment failed', detail: e?.response?.data });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO coop_contributions (farmer_id, amount, method, payment_ref)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.farmer.id, amount, method || 'MTN MoMo', payment_ref]
    );
    await db.query(
      `UPDATE farmers SET coop_savings = coop_savings + $1 WHERE id = $2`,
      [parseFloat(amount), req.farmer.id]
    );
    await db.query(
      `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'coop', $2, 'people-outline')`,
      [req.farmer.id, `Cooperative contribution of ${CURRENCY} ${amount} recorded`]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('[coop insert]', e.message);
    res.status(500).json({ error: 'Failed to save contribution' });
  }
});

module.exports = router;
