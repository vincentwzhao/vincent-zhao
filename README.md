# Study Buddy

A single-page website that keeps you motivated while you grind through hard CMPT (computer science) concepts.

## Features

- **Motivate me / Tell me a joke** — rotating motivational one-liners ("Am I testing my code, or is it testing me?") and programmer jokes.
- **Focus Sprint timer** — a Pomodoro-style study/break timer with encouragement messages while it runs.
- **Concept rescue deck** — flip cards covering core CMPT topics (Big-O, recursion, linked lists, trees, hash tables, sorting, dynamic programming, graphs, pointers, threads, deadlock, induction, P vs NP, SQL joins, TCP vs UDP), each paired with a joke.
- **Concept Visualizer** — an animated, step-by-step BFS/DFS graph traversal with play/pause/step controls and a live explanation of why both run in O(V + E).
- **Streak tracker** — a daily check-in button and session counter, synced to your account when logged in (falls back to `localStorage` as a guest).
- **Rubber duck debugging corner** — type out your bug and get a canned duck response to help you think it through.
- **Accounts** — optional sign-up/login so your streak and stats follow you across devices.

## Project layout

```
index.html, style.css, script.js   — static frontend
server/app.js                      — Express app (routes, auth, DB access)
server/db.js                       — database client (SQLite locally, Turso in production)
server/index.js                    — local dev entry point (calls app.listen)
api/[...path].js                   — Vercel serverless entry point (re-exports the same app)
```

The Express app in `server/app.js` is shared between local dev and Vercel — same routes, same code, just a different entry point.

## Running it locally

```bash
npm install
npm start
```

Then visit `http://localhost:3000`. A `study-buddy.db` SQLite file and a `.jwt-secret` file are created automatically in `server/` on first run (both gitignored).

If you just want the frontend without accounts, open `index.html` directly, or `python3 -m http.server 8000` from the repo root — the account card just won't be able to reach an API.

## Deploying to Vercel (with working accounts)

Vercel's functions are serverless — no persistent local disk — so production needs a hosted database instead of a local SQLite file. This project uses [Turso](https://turso.tech) (SQLite-compatible, has a free tier) via `@libsql/client`, which is why `server/db.js` works unchanged in both places: locally it opens a file, in production it talks to Turso over HTTPS.

1. **Create a Turso database** (needs the [Turso CLI](https://docs.turso.tech/cli/installation)):
   ```bash
   turso auth login
   turso db create study-buddy
   turso db show study-buddy --url        # → TURSO_DATABASE_URL
   turso db tokens create study-buddy      # → TURSO_AUTH_TOKEN
   ```

2. **Generate a JWT secret** (production needs this set explicitly — there's no writable disk to persist an auto-generated one):
   ```bash
   openssl rand -hex 32                    # → JWT_SECRET
   ```

3. **Deploy with the [Vercel CLI](https://vercel.com/docs/cli)**:
   ```bash
   npm i -g vercel
   vercel login
   vercel                                  # links/creates the project, deploys a preview
   ```

4. **Set the three environment variables** on the Vercel project (dashboard → Settings → Environment Variables, or via CLI):
   ```bash
   vercel env add TURSO_DATABASE_URL production
   vercel env add TURSO_AUTH_TOKEN production
   vercel env add JWT_SECRET production
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

No `vercel.json` is needed — the frontend files at the repo root are served as static assets, and every request under `/api/*` is automatically routed to `api/[...path].js`, which just re-exports the Express app.

#### API

| Method | Path                   | Auth | Description                          |
| ------ | ---------------------- | ---- | ------------------------------------ |
| POST   | `/api/register`        | —    | Create an account, returns a token   |
| POST   | `/api/login`           | —    | Log in, returns a token              |
| GET    | `/api/stats`           | ✅   | Get streak/session/joke stats        |
| POST   | `/api/checkin`         | ✅   | Record today's check-in              |
| POST   | `/api/session-complete`| ✅   | Record a completed Focus Sprint      |
| POST   | `/api/joke-heard`      | ✅   | Increment the jokes-heard counter    |

Authenticated requests send `Authorization: Bearer <token>`.
