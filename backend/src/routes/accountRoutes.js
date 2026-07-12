/**
 * backend/src/routes/accountRoutes.js
 *
 * POST /account/update          — update Moolre account settings
 * POST /account/status          — get Moolre account status
 * POST /account/transactions     — list transactions for the account
 */

const router  = require('express').Router();
const { moolreAccount } = require('../moolre');
const auth    = require('../auth');
const { MOOLRE_ACCOUNT_NUMBER } = require('../config');

const CALLBACK_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook/moolre`
  : (process.env.BACKEND_URL || 'https://agripay-backend-production.up.railway.app') + '/webhook/moolre';

// ─── POST /account/update ─────────────────────────────────────────────────────
// Update Moolre account name, API flag, callback, settlement config
router.post('/update', auth, async (req, res) => {
  const { accountname, api, callback, settlement } = req.body;

  try {
    const { data } = await moolreAccount.post('/open/account/update', {
      type:          1,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
      accountname:   accountname  || 'AgriPay',
      api:           api          !== undefined ? api : false,
      callback:      callback     || CALLBACK_URL,
      settlement: {
        currency:   settlement?.currency   || 'GHS',
        frequency:  settlement?.frequency  || '',
        channel:    settlement?.channel    || '',
        recipient:  settlement?.recipient  || '',
        sublist:    settlement?.sublist    || '',
      },
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Account update failed', detail: e?.response?.data || e.message });
  }
});

// ─── POST /account/status ─────────────────────────────────────────────────────
// Get current Moolre account status and balance
router.post('/status', auth, async (req, res) => {
  try {
    const { data } = await moolreAccount.post('/open/account/status', {
      type:          1,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Account status check failed', detail: e?.response?.data || e.message });
  }
});

// ─── POST /account/transactions ───────────────────────────────────────────────
// List transactions — caller can pass date range, pagination, status filter
router.post('/transactions', auth, async (req, res) => {
  const {
    startdate,
    enddate,
    startid = 0,
    endid   = 0,
    limit   = 10,
    status  = 1,
  } = req.body;

  // Default date range: last 2 years if not provided
  const now   = new Date();
  const start = startdate || new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
                              .toISOString().replace('T', ' ').slice(0, 19);
  const end   = enddate   || now.toISOString().replace('T', ' ').slice(0, 19);

  try {
    const { data } = await moolreAccount.post('/open/account/status', {
      type:          2,
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
      startdate:     start,
      enddate:       end,
      startid,
      endid,
      limit,
      status,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({ error: 'List transactions failed', detail: e?.response?.data || e.message });
  }
});

module.exports = router;
