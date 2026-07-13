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
      // externalref format: deposit_{farmerId}_{amount}_{timestamp}
      const parts    = externalref.split('_');
      const farmerId = parts[1];
      const amount   = parseFloat(parts[2]);

      if (success && farmerId && !isNaN(amount)) {
        // Credit the wallet now that payment is confirmed
        await db.query(
          `UPDATE farmers SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
          [amount, farmerId]
        );
        await db.query(
          `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'wallet', $2, 'arrow-down-circle-outline')`,
          [farmerId, `Deposit of GHS ${amount.toFixed(2)} confirmed`]
        );
        console.log(`[Webhook] Credited GHS ${amount} to farmer ${farmerId}`);
      } else if (!success && farmerId) {
        await db.query(
          `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'wallet', $2, 'close-circle-outline')`,
          [farmerId, `Deposit failed — ref: ${externalref}`]
        );
        console.warn(`[Webhook] Deposit failed for farmer ${farmerId}, ref: ${externalref}`);
      }
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
