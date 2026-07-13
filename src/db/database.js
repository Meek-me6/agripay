/**
 * src/db/database.js
 *
 * The backend + Supabase is now the source of truth.
 * Local SQLite is no longer used — this file is kept as a no-op
 * so that App.js can still call setupDB() without crashing.
 *
 * If you need offline caching in the future, re-implement here.
 */

// Export a minimal no-op so App.js imports don't break
export function setupDB() {
  // No-op — database is hosted on Supabase via the Express backend.
}

// Default export also a no-op object (screens that still import `db` won't crash)
const db = {
  getAllSync:    () => [],
  getFirstSync:  () => null,
  runSync:       () => {},
  execSync:      () => {},
};

export default db;
