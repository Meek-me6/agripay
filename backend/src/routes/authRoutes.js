const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const { moolreAccount } = require('../moolre');
const { BCRYPT_ROUNDS, JWT_EXPIRY } = require('../config');

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, phone, region, pin, coopGroup } = req.body;
  if (!name || !phone || !region || !pin) return res.status(400).json({ error: 'Missing fields' });
  if (pin.length < 4) return res.status(400).json({ error: 'PIN must be at least 4 digits' });

  const pin_hash = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  const coopGroupName = coopGroup || `${region} Farmers Cooperative`;

  // Create a Moolre account (non-fatal)
  let moolre_account_id = null;
  try {
    const callbackUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook/moolre`
      : (process.env.BACKEND_URL || 'https://agripay-backend-production.up.railway.app') + '/webhook/moolre';

    const acctRes = await moolreAccount.post('/open/account/create', {
      type: 1, currency: 'GHS', accountname: name, api: true, callback: callbackUrl,
      settlement: { currency: 'GHS', frequency: '', channel: '', recipient: '', sublist: '' },
    });
    const acct = acctRes?.data;
    moolre_account_id = acct?.account_id || acct?.id || acct?.accountid || null;
  } catch (e) {
    console.warn('[Moolre account creation failed — continuing]', e?.response?.data || e?.message);
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO farmers (name, phone, region, pin_hash, moolre_account_id, coop_group)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, phone, region, coop_group, wallet_balance, coop_savings, credit_score, moolre_account_id, created_at`,
      [name, phone, region, pin_hash, moolre_account_id, coopGroupName]
    );
    const farmer = rows[0];
    await db.query(
      `INSERT INTO activity (farmer_id, type, text, icon) VALUES ($1, 'profile', 'Welcome to AgriPay!', 'person-outline')`,
      [farmer.id]
    );
    const token = jwt.sign({ id: farmer.id, phone: farmer.phone }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token, farmer });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Phone already registered' });
    console.error('[register]', e.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Missing fields' });

  const { rows } = await db.query(`SELECT * FROM farmers WHERE phone = $1`, [phone]);
  const farmer = rows[0];
  if (!farmer) return res.status(401).json({ error: 'Phone not found' });

  const ok = await bcrypt.compare(pin, farmer.pin_hash);
  if (!ok) return res.status(401).json({ error: 'Wrong PIN' });

  const token = jwt.sign({ id: farmer.id, phone: farmer.phone }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const { pin_hash: _, ...farmerData } = farmer;
  res.json({ token, farmer: farmerData });
});

// GET /auth/me
router.get('/me', require('../auth'), async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, name, phone, region, coop_group, wallet_balance, coop_savings, credit_score, moolre_account_id, created_at
     FROM farmers WHERE id = $1`,
    [req.farmer.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Farmer not found' });
  res.json(rows[0]);
});

module.exports = router;
