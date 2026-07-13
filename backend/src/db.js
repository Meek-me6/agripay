/**
 * backend/src/db.js
 *
 * PostgreSQL connection pool using the `pg` package.
 * DATABASE_URL is injected by Railway when you link the Postgres plugin.
 */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] FATAL: DATABASE_URL is not set! Check Railway environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err.message);
});

// Test connection on startup so errors appear in Railway logs immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('[db] STARTUP CONNECTION FAILED:', err.message);
    console.error('[db] DATABASE_URL starts with:', connectionString.slice(0, 30));
  } else {
    console.log('[db] Connected to PostgreSQL successfully');
    release();
  }
});

module.exports = pool;
