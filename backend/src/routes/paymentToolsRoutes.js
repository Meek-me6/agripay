/**
 * backend/src/routes/paymentToolsRoutes.js
 *
 * POST /payment-tools/payment-id      — create a payment ID for a payer
 * POST /payment-tools/bank-account    — create a virtual bank account number
 * POST /payment-tools/payment-link    — generate a hosted payment link
 *
 * All three use X-API-PUBKEY.
 */

const router  = require('express').Router();
const { moolrePaymentId, moolreBankAccount, moolrePaymentLink } = require('../moolre');
const auth    = require('../auth');
const { MOOLRE_ACCOUNT_NUMBER } = require('../config');

const CALLBACK_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook/moolre`
  : (process.env.BACKEND_URL || 'https://agripay-backend-production.up.railway.app') + '/webhook/moolre';

// ─── POST /payment-tools/payment-id ──────────────────────────────────────────
// Create a payment ID tied to a payer's phone and amount
// Body: { phone, name, amount, externalref }
router.post('/payment-id', auth, async (req, res) => {
  const { phone, name, amount, externalref } = req.body;

  if (!phone)  return res.status(400).json({ error: 'phone is required' });
  if (!name)   return res.status(400).json({ error: 'name is required' });
  if (!amount) return res.status(400).json({ error: 'amount is required' });

  try {
    const { data } = await moolrePaymentId.post('/open/account/create', {
      type:          2,
      phone,
      name,
      currency:      'GHS',
      amount:        String(parseFloat(amount)),
      externalref:   externalref || `pid_${Date.now()}`,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Create payment ID failed', detail: e?.response?.data || e.message });
  }
});

// ─── POST /payment-tools/bank-account ────────────────────────────────────────
// Create a virtual bank account number for a user
// Body: { firstname, lastname, phone, email, amount, uref }
router.post('/bank-account', auth, async (req, res) => {
  const { firstname, lastname, phone, email, amount, uref } = req.body;

  if (!firstname) return res.status(400).json({ error: 'firstname is required' });
  if (!lastname)  return res.status(400).json({ error: 'lastname is required' });
  if (!phone)     return res.status(400).json({ error: 'phone is required' });

  try {
    const { data } = await moolreBankAccount.post('/open/account/create', {
      type:          9,
      currency:      'GHS',
      amount:        amount ? String(parseFloat(amount)) : '',
      firstname,
      lastname,
      phone,
      email:         email || '',
      uref:          uref  || `uref_${Date.now()}`,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Create bank account failed', detail: e?.response?.data || e.message });
  }
});

// ─── POST /payment-tools/payment-link ────────────────────────────────────────
// Generate a hosted Moolre payment link to share with a payer
// Body: { amount, email, externalref, redirect, reusable, expiration_time, metadata }
router.post('/payment-link', auth, async (req, res) => {
  const {
    amount,
    email,
    externalref,
    redirect,
    reusable        = '0',
    expiration_time = '',
    metadata        = {},
  } = req.body;

  if (!amount) return res.status(400).json({ error: 'amount is required' });

  try {
    const { data } = await moolrePaymentLink.post('/embed/link', {
      type:            1,
      amount:          String(parseFloat(amount)),
      email:           email           || '',
      externalref:     externalref     || `link_${Date.now()}`,
      callback:        CALLBACK_URL,
      redirect:        redirect        || '',
      reusable:        String(reusable),
      expiration_time: expiration_time || '',
      currency:        'GHS',
      accountnumber:   MOOLRE_ACCOUNT_NUMBER,
      metadata,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Generate payment link failed', detail: e?.response?.data || e.message });
  }
});

module.exports = router;
