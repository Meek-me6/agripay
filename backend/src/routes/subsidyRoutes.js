const router = require('express').Router();
const db     = require('../db');
const { moolreTransfer } = require('../moolre');
const auth   = require('../auth');
const { CURRENCY, PHONE_COUNTRY_CODE, MOOLRE_ACCOUNT_NUMBER } = require('../config');

// GET /subsidy
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM subsidies WHERE farmer_id = $1 ORDER BY allocated_at DESC LIMIT 1`,
      [req.farmer.id]
    );
    res.json(rows[0] || null);
  } catch (e) {
    console.error('[subsidy]', e.message);
    res.status(500).json({ error: 'Failed to load subsidy' });
  }
});

// POST /subsidy/apply
router.post('/apply', auth, async (req, res) => {
  const { programme, amount, items } = req.body;
  if (!programme || !amount) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { rows } = await db.query(
      `INSERT INTO subsidies (farmer_id, programme, amount, items, status, allocated_at)
       VALUES ($1, $2, $3, $4, 'allocated', now()) RETURNING *`,
      [req.farmer.id, programme, amount, JSON.stringify(items || [])]
    );
    await db.query(
      `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'subsidy', $2, 'cash-outline')`,
      [req.farmer.id, `Subsidy application for ${programme} submitted`]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('[subsidy apply]', e.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// POST /subsidy/:id/disburse — admin/webhook
router.post('/:id/disburse', async (req, res) => {
  const { rows } = await db.query(
    `SELECT s.*, f.phone, f.moolre_account_id, f.id AS farmer_id
     FROM subsidies s JOIN farmers f ON f.id = s.farmer_id WHERE s.id = $1`,
    [req.params.id]
  );
  const sub = rows[0];
  if (!sub) return res.status(404).json({ error: 'Not found' });

  let transfer_ref = null;
  try {
    const { data } = await moolreTransfer.post('/open/transact/transfer', {
      type: 1, channel: '1', currency: CURRENCY,
      amount: String(parseFloat(sub.amount)),
      receiver: `${PHONE_COUNTRY_CODE}${sub.phone.replace(/^0/, '')}`,
      sublistid: '', externalref: `sub_${sub.id}_${Date.now()}`,
      reference: `AgriPay subsidy: ${sub.programme}`, accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    transfer_ref = data?.transfer_id || data?.reference || null;
  } catch (e) {
    return res.status(502).json({ error: 'Moolre transfer failed', detail: e?.response?.data });
  }

  const { rows: updated } = await db.query(
    `UPDATE subsidies SET status = 'disbursed', disbursed_at = now(), transfer_ref = $1
     WHERE id = $2 RETURNING *`,
    [transfer_ref, sub.id]
  );
  await db.query(
    `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'subsidy', $2, 'cash-outline')`,
    [sub.farmer_id, `${CURRENCY} ${sub.amount} subsidy disbursed via Moolre`]
  );
  res.json(updated[0]);
});

module.exports = router;
