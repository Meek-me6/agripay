/**
 * backend/src/routes/validateRoutes.js
 *
 * POST /transfer/validate  — validate a recipient's name before sending money
 *
 * Calls Moolre: POST /open/transact/validate
 * Headers: X-API-USER + X-API-KEY
 *
 * Request body: { receiver, channel, sublistid }
 *   receiver  — phone number of the recipient
 *   channel   — '1' MTN | '6' Telecel | '7' AirtelTigo | '2' Bank
 *   sublistid — bank account id if channel=2, otherwise ''
 */

const router   = require('express').Router();
const { moolreValidate } = require('../moolre');
const auth      = require('../auth');
const { MOOLRE_ACCOUNT_NUMBER } = require('../config');

router.post('/', auth, async (req, res) => {
  const { receiver, channel, sublistid } = req.body;

  if (!receiver) return res.status(400).json({ error: 'receiver (phone number) is required' });
  if (!channel)  return res.status(400).json({ error: 'channel is required' });

  try {
    const { data } = await moolreValidate.post('/open/transact/validate', {
      type:          1,
      receiver,
      channel,
      sublistid:     sublistid || '',
      currency:      'GHS',
      accountnumber: MOOLRE_ACCOUNT_NUMBER,
    });
    res.json(data);
  } catch (e) {
    return res.status(502).json({
      error:  'Name validation failed',
      detail: e?.response?.data || e.message,
    });
  }
});

module.exports = router;
