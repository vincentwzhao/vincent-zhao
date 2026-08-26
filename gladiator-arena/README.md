# Gladiator — Coliseum Deathmatch

A 2D top-down arena brawler loosely inspired by the gladiator movies: you're
condemned to the sand and must survive endless waves of enemy gladiators in
front of a roaring crowd. Pure static HTML/CSS/JS — no build step, no
dependencies, no external assets (even the sound effects are synthesized in
the browser with the Web Audio API).

## Running it

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

| Input | Action |
| --- | --- |
| `WASD` / Arrow keys | Move |
| Mouse | Aim / face direction |
| Left click / `Space` | Attack (sword swing) |
| Right click / `E` | Shield block (reduces damage, drains stamina) |
| `Shift` | Dodge roll (brief invulnerability) |
| `P` / `Esc` | Pause |

## How it plays

- Fight through escalating waves of gladiators in a sand-floored coliseum,
  ringed by a cheering crowd and flickering torches.
- Three enemy types (Swordsman, Spearman, Brute) mix into each wave, with a
  tougher **Champion** boss every 5th wave.
- Enemies telegraph their attacks with a red flash before swinging — dodge
  or block to avoid the hit.
- Managing stamina matters: attacking, blocking, and dodging all consume it,
  and it only regenerates after a short delay.
- Score and best score (stored in `localStorage`) track your run; the game
  is endless survival, with waves getting larger and nastier over time.

## Files

- `index.html` — page structure, HUD, and overlay screens (start/pause/game
  over).
- `style.css` — coliseum-themed visual styling.
- `game.js` — the entire game: input handling, entity/AI logic, particle
  effects, synthesized audio, and canvas rendering.
