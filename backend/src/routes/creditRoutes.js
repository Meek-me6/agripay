const router = require('express').Router();
const db     = require('../db');
const { moolreTransfer } = require('../moolre');
const auth   = require('../auth');
const { CREDIT, CURRENCY, PHONE_COUNTRY_CODE, MOOLRE_ACCOUNT_NUMBER } = require('../config');

// GET /credit
router.get('/', auth, async (req, res) => {
  try {
    const { rows: farmerRows } = await db.query(
      `SELECT credit_score, moolre_account_id FROM farmers WHERE id = $1`, [req.farmer.id]
    );
    const { rows: loans } = await db.query(
      `SELECT * FROM loans WHERE farmer_id = $1 ORDER BY created_at DESC`, [req.farmer.id]
    );
    const score = await calcCreditScore(req.farmer.id, farmerRows[0]?.credit_score || CREDIT.BASE_SCORE);
    res.json({
      credit_score: score,
      max_loan: Math.floor(score * CREDIT.LOAN_MULTIPLIER),
      loans,
    });
  } catch (e) {
    console.error('[credit]', e.message);
    res.status(500).json({ error: 'Failed to load credit data' });
  }
});

// POST /credit/apply
router.post('/apply', auth, async (req, res) => {
  const { amount, term_months, purpose } = req.body;
  if (!amount || !term_months) return res.status(400).json({ error: 'Missing fields' });

  const { rows: farmerRows } = await db.query(
    `SELECT credit_score FROM farmers WHERE id = $1`, [req.farmer.id]
  );
  const maxLoan = Math.floor((farmerRows[0]?.credit_score || CREDIT.BASE_SCORE) * CREDIT.LOAN_MULTIPLIER);
  if (amount > maxLoan) return res.status(400).json({ error: `Exceeds max loan of ${CURRENCY} ${maxLoan}` });

  const monthly_payment = parseFloat(((amount * (1 + CREDIT.INTEREST_RATE)) / term_months).toFixed(2));

  try {
    const { rows } = await db.query(
      `INSERT INTO loans (farmer_id, amount, term_months, purpose, monthly_payment, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [req.farmer.id, amount, term_months, purpose, monthly_payment]
    );
    await db.query(
      `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'credit', $2, 'card-outline')`,
      [req.farmer.id, `Loan application of ${CURRENCY} ${amount} submitted`]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('[credit apply]', e.message);
    res.status(500).json({ error: 'Failed to submit loan application' });
  }
});

// POST /credit/loans/:id/approve — admin disburses via Moolre
router.post('/loans/:id/approve', async (req, res) => {
  const { rows } = await db.query(
    `SELECT l.*, f.phone, f.credit_score FROM loans l
     JOIN farmers f ON f.id = l.farmer_id WHERE l.id = $1`,
    [req.params.id]
  );
  const loan = rows[0];
  if (!loan) return res.status(404).json({ error: 'Not found' });

  let transfer_ref = null;
  try {
    const { data } = await moolreTransfer.post('/open/transact/transfer', {
      type: 1, channel: '1', currency: CURRENCY,
      amount: String(parseFloat(loan.amount)),
      receiver: `${PHONE_COUNTRY_CODE}${loan.phone.replace(/^0/, '')}`,
      sublistid: '', externalref: `loan_${loan.id}_${Date.now()}`,
      reference: `AgriPay loan: ${loan.purpose || 'Agricultural credit'}`,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    transfer_ref = data?.transfer_id || data?.reference;
  } catch (e) {
    return res.status(502).json({ error: 'Disbursement failed', detail: e?.response?.data });
  }

  const { rows: updated } = await db.query(
    `UPDATE loans SET status = 'active', disbursed_at = now(), transfer_ref = $1
     WHERE id = $2 RETURNING *`,
    [transfer_ref, loan.id]
  );
  await db.query(
    `UPDATE farmers SET credit_score = credit_score + $1 WHERE id = $2`,
    [CREDIT.APPROVAL_BOOST, loan.farmer_id]
  );
  res.json(updated[0]);
});

async function calcCreditScore(farmerId, currentScore) {
  const { rows: contrib } = await db.query(
    `SELECT COUNT(*) AS cnt FROM coop_contributions WHERE farmer_id = $1`, [farmerId]
  );
  const { rows: loans } = await db.query(
    `SELECT status FROM loans WHERE farmer_id = $1`, [farmerId]
  );
  const { rows: activity } = await db.query(
    `SELECT COUNT(*) AS cnt FROM activity WHERE farmer_id = $1`, [farmerId]
  );

  let score = CREDIT.BASE_SCORE;
  score += Math.min(parseInt(contrib[0].cnt) * CREDIT.PER_CONTRIBUTION_PTS, CREDIT.MAX_CONTRIBUTION_BONUS);
  score += Math.min(parseInt(activity[0].cnt) * CREDIT.PER_ACTIVITY_PTS, CREDIT.MAX_ACTIVITY_BONUS);
  loans.forEach(l => {
    if (l.status === 'repaid') score += CREDIT.REPAID_LOAN_BONUS;
    if (l.status === 'active') score += CREDIT.ACTIVE_LOAN_BONUS;
  });
  score = Math.min(score, CREDIT.MAX_SCORE);

  if (score !== currentScore) {
    await db.query(`UPDATE farmers SET credit_score = $1 WHERE id = $2`, [score, farmerId]);
  }
  return score;
}

module.exports = router;
