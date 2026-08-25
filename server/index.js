const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

// Persist a JWT secret across restarts so logged-in users aren't kicked out
// every time the server restarts, without requiring env setup for local dev.
function loadOrCreateSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretPath = path.join(__dirname, ".jwt-secret");
  if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, "utf8").trim();
  const secret = crypto.randomBytes(48).toString("hex");
  fs.writeFileSync(secretPath, secret, { mode: 0o600 });
  return secret;
}

const JWT_SECRET = loadOrCreateSecret();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

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

function statsRow(userId) {
  let row = db.prepare("SELECT * FROM stats WHERE user_id = ?").get(userId);
  if (!row) {
    db.prepare("INSERT INTO stats (user_id) VALUES (?)").run(userId);
    row = db.prepare("SELECT * FROM stats WHERE user_id = ?").get(userId);
  }
  return row;
}

function serializeStats(row) {
  return {
    streak: row.streak,
    lastCheckin: row.last_checkin,
    sessionsToday: row.last_session_date === todayStr() ? row.sessions_today : 0,
    lastSessionDate: row.last_session_date,
    jokesHeard: row.jokes_heard,
  };
}

app.post("/api/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Username and a password of at least 6 characters are required" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) return res.status(409).json({ error: "Username already taken" });

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, passwordHash);
  statsRow(result.lastInsertRowid);

  const user = { id: result.lastInsertRowid, username };
  res.status(201).json({ token: issueToken(user), username });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  res.json({ token: issueToken(user), username: user.username });
});

app.get("/api/stats", requireAuth, (req, res) => {
  res.json(serializeStats(statsRow(req.user.sub)));
});

app.post("/api/checkin", requireAuth, (req, res) => {
  const row = statsRow(req.user.sub);
  const today = todayStr();
  if (row.last_checkin === today) {
    return res.json({ ...serializeStats(row), alreadyCheckedIn: true });
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newStreak = row.last_checkin === yesterday.toDateString() ? row.streak + 1 : 1;

  db.prepare("UPDATE stats SET streak = ?, last_checkin = ? WHERE user_id = ?").run(newStreak, today, req.user.sub);
  res.json({ ...serializeStats(statsRow(req.user.sub)), alreadyCheckedIn: false });
});

app.post("/api/session-complete", requireAuth, (req, res) => {
  const row = statsRow(req.user.sub);
  const today = todayStr();
  const sessionsToday = row.last_session_date === today ? row.sessions_today + 1 : 1;

  db.prepare("UPDATE stats SET sessions_today = ?, last_session_date = ? WHERE user_id = ?").run(
    sessionsToday,
    today,
    req.user.sub
  );
  res.json(serializeStats(statsRow(req.user.sub)));
});

app.post("/api/joke-heard", requireAuth, (req, res) => {
  db.prepare("UPDATE stats SET jokes_heard = jokes_heard + 1 WHERE user_id = ?").run(req.user.sub);
  res.json(serializeStats(statsRow(req.user.sub)));
});

app.listen(PORT, () => {
  console.log(`Study Buddy server running at http://localhost:${PORT}`);
});
