/**
 * backend/src/db.js
 *
 * PostgreSQL connection pool using the `pg` package.
 * DATABASE_URL is injected by Railway when you link the Postgres plugin.
 */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] WARNING: DATABASE_URL is not set!');
}

const pool = connectionString ? new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
}) : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('[pg] Unexpected pool error:', err.message);
  });

  pool.connect((err, client, release) => {
    if (err) {
      console.error('[db] STARTUP CONNECTION FAILED:', err.message);
      console.error('[db] URL preview:', connectionString.replace(/:([^:@]+)@/, ':***@').slice(0, 60));
    } else {
      console.log('[db] Connected to PostgreSQL successfully');
      release();
    }
  });
}

module.exports = pool;
