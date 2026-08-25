const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, ensureSchema } = require("./db");

// Persist a JWT secret across restarts for local dev convenience. In
// production (Vercel) the filesystem isn't writable/persistent, so set
// JWT_SECRET as an env var there — otherwise sessions reset on every cold start.
function loadOrCreateSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretPath = path.join(__dirname, ".jwt-secret");
  try {
    if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, "utf8").trim();
    const secret = crypto.randomBytes(48).toString("hex");
    fs.writeFileSync(secretPath, secret, { mode: 0o600 });
    return secret;
  } catch {
    return crypto.randomBytes(48).toString("hex");
  }
}

const JWT_SECRET = loadOrCreateSecret();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));
app.use((req, res, next) => {
  ensureSchema().then(() => next(), next);
});

function todayStr() {
  return new Date().toDateString();
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "30d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function getOrCreateStats(userId) {
  let rs = await db.execute({ sql: "SELECT * FROM stats WHERE user_id = ?", args: [userId] });
  if (!rs.rows.length) {
    await db.execute({ sql: "INSERT INTO stats (user_id) VALUES (?)", args: [userId] });
    rs = await db.execute({ sql: "SELECT * FROM stats WHERE user_id = ?", args: [userId] });
  }
  return rs.rows[0];
}

function serializeStats(row) {
  return {
    streak: Number(row.streak),
    lastCheckin: row.last_checkin,
    sessionsToday: row.last_session_date === todayStr() ? Number(row.sessions_today) : 0,
    lastSessionDate: row.last_session_date,
    jokesHeard: Number(row.jokes_heard),
  };
}

function asyncRoute(handler) {
  return (req, res, next) => handler(req, res, next).catch(next);
}

app.post(
  "/api/register",
  asyncRoute(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ error: "Username and a password of at least 6 characters are required" });
    }
    const existing = await db.execute({ sql: "SELECT id FROM users WHERE username = ?", args: [username] });
    if (existing.rows.length) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await db.execute({
      sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      args: [username, passwordHash],
    });
    const userId = Number(result.lastInsertRowid);
    await getOrCreateStats(userId);

    res.status(201).json({ token: issueToken({ id: userId, username }), username });
  })
);

app.post(
  "/api/login",
  asyncRoute(async (req, res) => {
    const { username, password } = req.body || {};
    const rs = await db.execute({ sql: "SELECT * FROM users WHERE username = ?", args: [username] });
    const user = rs.rows[0];
    if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    res.json({ token: issueToken({ id: Number(user.id), username: user.username }), username: user.username });
  })
);

app.get(
  "/api/stats",
  requireAuth,
  asyncRoute(async (req, res) => {
    res.json(serializeStats(await getOrCreateStats(req.user.sub)));
  })
);

app.post(
  "/api/checkin",
  requireAuth,
  asyncRoute(async (req, res) => {
    const row = await getOrCreateStats(req.user.sub);
    const today = todayStr();
    if (row.last_checkin === today) {
      return res.json({ ...serializeStats(row), alreadyCheckedIn: true });
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak = row.last_checkin === yesterday.toDateString() ? Number(row.streak) + 1 : 1;

    await db.execute({
      sql: "UPDATE stats SET streak = ?, last_checkin = ? WHERE user_id = ?",
      args: [newStreak, today, req.user.sub],
    });
    res.json({ ...serializeStats(await getOrCreateStats(req.user.sub)), alreadyCheckedIn: false });
  })
);

app.post(
  "/api/session-complete",
  requireAuth,
  asyncRoute(async (req, res) => {
    const row = await getOrCreateStats(req.user.sub);
    const today = todayStr();
    const sessionsToday = row.last_session_date === today ? Number(row.sessions_today) + 1 : 1;

    await db.execute({
      sql: "UPDATE stats SET sessions_today = ?, last_session_date = ? WHERE user_id = ?",
      args: [sessionsToday, today, req.user.sub],
    });
    res.json(serializeStats(await getOrCreateStats(req.user.sub)));
  })
);

app.post(
  "/api/joke-heard",
  requireAuth,
  asyncRoute(async (req, res) => {
    await db.execute({ sql: "UPDATE stats SET jokes_heard = jokes_heard + 1 WHERE user_id = ?", args: [req.user.sub] });
    res.json(serializeStats(await getOrCreateStats(req.user.sub)));
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
