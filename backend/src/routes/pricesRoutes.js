const router = require('express').Router();
const db     = require('../db');

// GET /prices — latest price per crop+market combo
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT ON (crop, market) *
       FROM prices
       ORDER BY crop, market, recorded_at DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('[prices]', e.message);
    res.status(500).json({ error: 'Failed to load prices' });
  }
});

// POST /prices — admin: add a price entry
router.post('/', async (req, res) => {
  const { crop, market, price, unit, trend, change_pct } = req.body;
  if (!crop || !market || !price || !unit) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { rows } = await db.query(
      `INSERT INTO prices (crop, market, price, unit, trend, change_pct)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [crop, market, price, unit, trend || 'flat', change_pct || '0%']
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('[prices insert]', e.message);
    res.status(500).json({ error: 'Failed to insert price' });
  }
});

module.exports = router;
