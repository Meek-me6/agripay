/**
 * backend/src/routes/internalTransferRoutes.js
 *
 * POST /internal-transfer  — transfer between Moolre accounts internally
 *
 * Calls Moolre: POST /open/transact/internal
 * Headers: X-API-USER + X-API-KEY
 *
 * Body: { amount, receiver, reference }
 *   amount    — transfer amount (from app)
 *   receiver  — recipient's Moolre account number or phone (from app)
 *   reference — narration/description (from app, defaults to "AgriPay internal transfer")
 */

const router  = require('express').Router();
const { moolreInternal } = require('../moolre');
const auth    = require('../auth');
const { MOOLRE_ACCOUNT_NUMBER } = require('../config');

// ─── POST /internal-transfer ──────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { amount, receiver, reference } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!receiver) {
    return res.status(400).json({ error: 'receiver is required' });
  }

  const externalref = `internal_${req.farmer.id}_${Date.now()}`;

  try {
    const { data } = await moolreInternal.post('/open/transact/internal', {
      type:          1,
      currency:      'GHS',
      amount:        String(parseFloat(amount)),
      receiver,
      externalref,
      reference:     reference || 'AgriPay internal transfer',
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({
      error:  'Internal transfer failed',
      detail: e?.response?.data || e.message,
    });
  }
});

module.exports = router;
