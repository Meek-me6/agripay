/**
 * backend/src/db.js
 *
 * PostgreSQL connection pool using the `pg` package.
 * Set DATABASE_URL in Railway environment variables.
 * Format: postgres://user:password@host:port/dbname
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err.message);
});

module.exports = pool;
