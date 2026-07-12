const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase  = require('../supabase');
const { moolreAccount } = require('../moolre');
const { BCRYPT_ROUNDS, JWT_EXPIRY, PHONE_COUNTRY_CODE } = require('../config');

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, phone, region, pin, coopGroup } = req.body;
  if (!name || !phone || !region || !pin) return res.status(400).json({ error: 'Missing fields' });
  if (pin.length < 4) return res.status(400).json({ error: 'PIN must be at least 4 digits' });

  const pin_hash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

  // Derive cooperative group name: use the hint from the app, or fall back to region default
  const coopGroupName = coopGroup || `${region} Farmers Cooperative`;

  // Create a Moolre account for the farmer (non-fatal — registration succeeds even if this fails)
  let moolre_account_id = null;
  try {
    const callbackUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook/moolre`
      : (process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/webhook/moolre`
          : 'https://agripay-backend-production.up.railway.app/webhook/moolre');

    const acctRes = await moolreAccount.post('/open/account/create', {
      type:        1,
      currency:    'GHS',
      accountname: name,
      api:         true,
      callback:    callbackUrl,
      settlement: {
        currency:   'GHS',
        frequency:  '',
        channel:    '',
        recipient:  '',
        sublist:    '',
      },
    });
    const acct = acctRes?.data;
    moolre_account_id = acct?.account_id || acct?.id || acct?.accountid || null;
    console.log('[Moolre account created]', JSON.stringify(acct));
  } catch (e) {
    // Non-fatal — farmer is still registered without a Moolre account id for now
    console.warn('[Moolre account creation failed — continuing registration]',
      e?.response?.status, e?.response?.data || e?.message || String(e));
  }

  const { data, error } = await supabase
    .from('farmers')
    .insert({ name, phone, region, pin_hash, moolre_account_id, coop_group: coopGroupName })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Phone already registered' });
    return res.status(500).json({ error: error.message });
  }

  // Log activity
  await supabase.from('activity').insert({
    farmer_id: data.id, type: 'profile', text: 'Welcome to AgriPay!', icon: 'person-outline',
  });

  const token = jwt.sign({ id: data.id, phone: data.phone }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const { pin_hash: _, ...farmer } = data;
  res.json({ token, farmer });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone || !pin) return res.status(400).json({ error: 'Missing fields' });

  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return res.status(401).json({ error: 'Phone not found' });

  const ok = await bcrypt.compare(pin, data.pin_hash);
  if (!ok) return res.status(401).json({ error: 'Wrong PIN' });

  const token = jwt.sign({ id: data.id, phone: data.phone }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  const { pin_hash: _, ...farmer } = data;
  res.json({ token, farmer });
});

// GET /auth/me  — refresh farmer profile
router.get('/me', require('../auth'), async (req, res) => {
  const { data, error } = await supabase
    .from('farmers')
    .select('id,name,phone,region,coop_group,wallet_balance,coop_savings,credit_score,moolre_account_id,created_at')
    .eq('id', req.farmer.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
