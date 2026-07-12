const router = require('express').Router();
const db     = require('../db');
const auth   = require('../auth');
const { ACTIVITY_FEED_LIMIT } = require('../config');

// GET /activity
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM activity WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [req.farmer.id, ACTIVITY_FEED_LIMIT]
    );
    res.json(rows);
  } catch (e) {
    console.error('[activity]', e.message);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

module.exports = router;
