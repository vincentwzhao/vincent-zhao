const path = require("path");
const { createClient } = require("@libsql/client");

// In production (Vercel), set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to point
// at a hosted Turso database — serverless functions have no persistent
// filesystem, so a local file won't survive between invocations there.
// Locally, with no env vars set, this just opens a SQLite file on disk.
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, "study-buddy.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS stats (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          streak INTEGER NOT NULL DEFAULT 0,
          last_checkin TEXT,
          sessions_today INTEGER NOT NULL DEFAULT 0,
          last_session_date TEXT,
          jokes_heard INTEGER NOT NULL DEFAULT 0
        )
      `);
    })();
  }
  return schemaReady;
}

module.exports = { db, ensureSchema };
