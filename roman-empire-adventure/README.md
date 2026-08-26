# Via Imperii — A Roman Empire Adventure

An interactive, choose-your-own-adventure map of the Roman Empire at its height
(117 A.D.). Explore a stylized parchment map of twelve provinces — from
Britannia to Aegyptus — traveling along roads and sea routes, making choices
at each stop that shape your health, gold, and glory before your season
of travel runs out. Pure static HTML/CSS/JS — no build step, no
dependencies, no external assets (sound effects are synthesized in the
browser with the Web Audio API).
<img width="765" height="497" alt="image" src="https://github.com/user-attachments/assets/76412a58-68f5-4834-94a6-d94cc8b06165" />

## Running it

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it plays

- Choose a background — Retired Legionary, Traveling Merchant, or Senator's
  Envoy — each with different starting Health, Denarii, and Glory.
- Set out from Rome. Click any province on the map to inspect it; you can
  only travel directly to a province connected to your current location by
  a road or sea route (dashed gold lines), at a turn cost shown on the road.
- Arriving somewhere for the first time triggers a unique story event with
  two choices, each trading off Health, Gold, and Glory differently.
  Revisiting a province, or a long journey between provinces, may trigger a
  different, replayable encounter instead.
- Manage your turns and health carefully: running out of turns, or
  returning to Rome to voluntarily conclude your journey, ends the game and
  scores your Glory and Gold into one of several endings. Running out of
  health ends it early and less happily.
- Your goal: build a reputation — and a purse — worth remembering by the
  time your journey ends.

## Files

- `index.html` — page structure: HUD, SVG map container, sidebar, and
  overlay screens (start / event scroll / end).
- `style.css` — parchment-map visual styling.
- `game.js` — map data (provinces, roads, cities), narrative content,
  game state, synthesized audio, and all SVG rendering/interaction logic.
