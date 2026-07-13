require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth',              require('./routes/authRoutes'));
app.use('/prices',           require('./routes/pricesRoutes'));
app.use('/listings',         require('./routes/listingsRoutes'));
app.use('/subsidy',          require('./routes/subsidyRoutes'));
app.use('/coop',             require('./routes/coopRoutes'));
app.use('/credit',           require('./routes/creditRoutes'));
app.use('/activity',         require('./routes/activityRoutes'));
app.use('/wallet',           require('./routes/walletRoutes'));
app.use('/account',          require('./routes/accountRoutes'));
app.use('/internal-transfer',require('./routes/internalTransferRoutes'));
app.use('/payment-tools',    require('./routes/paymentToolsRoutes'));
app.use('/transfer/validate',require('./routes/validateRoutes'));
app.use('/webhook',          require('./routes/webhookRoutes'));

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get('/debug', async (_, res) => {
  const db = require('./db');
  const hasUrl = !!process.env.DATABASE_URL;
  const urlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@').slice(0, 60)
    : 'NOT SET';
  try {
    await db.query('SELECT 1');
    res.json({ db: 'connected', hasUrl, urlPreview });
  } catch (e) {
    res.json({ db: 'failed', error: e.message, hasUrl, urlPreview });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AgriPay backend running on port ${PORT}`));
