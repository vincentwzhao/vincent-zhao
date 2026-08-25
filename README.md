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

## Running it

### Frontend only (no accounts, stats stay in this browser)

Open `index.html` directly, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

### With the backend (accounts + persistent stats)

The `server/` folder is a small Express + SQLite API that also serves the frontend, so this is the way to run the full app:

```bash
cd server
npm install
npm start
```

Then visit `http://localhost:3000`. A `study-buddy.db` SQLite file is created automatically on first run (gitignored). The JWT signing secret is generated on first run and saved to `server/.jwt-secret` (also gitignored) — delete it to invalidate all existing login sessions.

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
