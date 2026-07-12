const router = require('express').Router();
const db     = require('../db');

const WEBHOOK_SECRET = '58cf387b-9823-4a4b-b753-abc30392e400';

// POST /webhook/payment
router.post('/payment', async (req, res) => {
  const payload = req.body;
  const secret  = payload?.data?.secret;

  if (!secret || secret.trim() !== WEBHOOK_SECRET) {
    console.warn('[Webhook] Invalid secret:', secret);
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const { txstatus, externalref, transactionid, thirdpartyref } = payload.data || {};
  const success = txstatus === 1 || payload.code === 'P01';

  console.log(`[Webhook] payment — externalref: ${externalref}, success: ${success}`);

  try {
    if (externalref?.startsWith('deposit_')) {
      await db.query(
        `INSERT INTO activity (farmer_id, type, text, icon) VALUES (NULL, 'wallet', $1, $2)`,
        [
          success ? `Deposit confirmed — ref: ${externalref}` : `Deposit failed — ref: ${externalref}`,
          success ? 'checkmark-circle-outline' : 'close-circle-outline',
        ]
      );
    } else if (externalref?.startsWith('coop_') && success) {
      await db.query(
        `UPDATE coop_contributions SET payment_ref = $1, confirmed = true WHERE payment_ref = $2`,
        [transactionid || thirdpartyref || externalref, externalref]
      );
    } else if (externalref?.startsWith('escrow_') && success) {
      const listingId = externalref.split('_')[1];
      if (listingId) {
        await db.query(
          `UPDATE listings SET in_escrow = true, escrow_ref = $1 WHERE id = $2`,
          [transactionid || externalref, listingId]
        );
      }
    }
  } catch (e) {
    console.error('[Webhook] DB error:', e.message);
  }

  res.json({ received: true });
});

module.exports = router;
