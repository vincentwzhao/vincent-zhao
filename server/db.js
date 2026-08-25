const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "study-buddy.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stats (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    streak INTEGER NOT NULL DEFAULT 0,
    last_checkin TEXT,
    sessions_today INTEGER NOT NULL DEFAULT 0,
    last_session_date TEXT,
    jokes_heard INTEGER NOT NULL DEFAULT 0
  );
`);

module.exports = db;
