/**
 * backend/src/db.js
 *
 * PostgreSQL connection pool using the `pg` package.
 * DATABASE_URL is injected by Railway when you link the Postgres plugin.
 */
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] DATABASE_URL is not set! Check Railway environment variables.');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err.message);
});

module.exports = pool;
