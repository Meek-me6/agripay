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

// GET /listings
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT l.*, f.name AS seller, f.region AS seller_region
       FROM listings l JOIN farmers f ON f.id = l.farmer_id
       WHERE l.active = true ORDER BY l.created_at DESC`
    );
    res.json(rows.map(l => ({
      id: l.id, crop: l.crop, quantity: l.quantity, quantity_num: l.quantity_num,
      price: l.price, unit: l.unit, location: l.location, condition: l.condition,
      in_escrow: l.in_escrow, seller: l.seller, seller_region: l.seller_region, posted_at: l.created_at,
    })));
  } catch (e) {
    console.error('[listings]', e.message);
    res.status(500).json({ error: 'Failed to load listings' });
  }
});

// POST /listings
router.post('/', auth, async (req, res) => {
  const { crop, quantity, quantity_num, price, unit, location, condition } = req.body;
  if (!crop || !quantity || !price || !unit || !location) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO listings (farmer_id, crop, quantity, quantity_num, price, unit, location, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.farmer.id, crop, quantity, quantity_num || null, price, unit, location, condition || 'Grade A']
    );
    await db.query(
      `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'market', $2, 'cart-outline')`,
      [req.farmer.id, `You listed ${crop} — ${CURRENCY} ${price}/${unit}`]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('[listings insert]', e.message);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// POST /listings/:id/buy
router.post('/:id/buy', auth, async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Buyer phone required' });

  const { rows } = await db.query(
    `SELECT l.*, f.phone AS seller_phone FROM listings l
     JOIN farmers f ON f.id = l.farmer_id
     WHERE l.id = $1 AND l.active = true`,
    [req.params.id]
  );
  const listing = rows[0];
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.in_escrow) return res.status(409).json({ error: 'Already in escrow' });

  const reference = `escrow_${listing.id}_${Date.now()}`;
  let payment_ref = reference;

  try {
    const { data: pData } = await moolrePayment.post('/open/transact/payment', {
      type: 1, channel: '1', currency: CURRENCY,
      payer: toMoolrePhone(phone), amount: String(parseFloat(listing.price)),
      externalref: reference, otpcode: '', reference: 'AgriPay marketplace purchase (escrow)',
      sessionid: '', accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    payment_ref = pData?.reference || pData?.transaction_id || reference;
  } catch (e) {
    console.warn('[escrow payment failed]', e?.response?.data || e.message);
    return res.status(502).json({ error: 'Payment initiation failed', detail: e?.response?.data });
  }

  const { rows: updated } = await db.query(
    `UPDATE listings SET in_escrow = true, escrow_ref = $1 WHERE id = $2 RETURNING *`,
    [payment_ref, listing.id]
  );
  await db.query(
    `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'market', $2, 'shield-checkmark-outline')`,
    [listing.farmer_id, `Your ${listing.crop} listing is now in escrow`]
  );
  res.json({ listing: updated[0], payment_ref });
});

module.exports = router;
