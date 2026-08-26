# Study Buddy

A single-page website that keeps you motivated while you grind through hard CMPT (computer science) concepts. It's just static HTML/CSS/JS — no build step, no dependencies.

## Features

- **Motivate me / Tell me a joke** — rotating motivational one-liners ("Am I testing my code, or is it testing me?") and programmer jokes.
- **Focus Sprint timer** — a Pomodoro-style study/break timer with encouragement messages while it runs.
- **Concept rescue deck** — flip cards covering core CMPT topics (Big-O, recursion, linked lists, trees, hash tables, sorting, dynamic programming, graphs, pointers, threads, deadlock, induction, P vs NP, SQL joins, TCP vs UDP), each paired with a joke.
- **Streak tracker** — a daily check-in button and session counter backed by `localStorage`.
- **Rubber duck debugging corner** — type out your bug and get a canned duck response to help you think it through.

## Running it

Just open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Organizing your projects

`organize_projects.py` is a standalone local script (not related to the site above) that scans your
Downloads folder (or any directory you point it at), detects what each project is (Python, Node,
Rust, static site, etc.) from marker files like `package.json` or `requirements.txt`, and sorts them
into per-language subfolders. It handles both plain project folders and zipped project archives
(e.g. `my-project.zip` downloaded from GitHub) — zips get extracted into place, and the original
archive is left untouched.

```bash
# Dry run against ~/Downloads: just show what would happen
python3 organize_projects.py

# Write a Markdown/JSON summary
python3 organize_projects.py --report projects.md --json projects.json

# Actually move folders / extract zips into ~/Downloads/organized/<language>/<project>
python3 organize_projects.py --apply

# Point it at a different folder
python3 organize_projects.py --root ~/Projects --apply
```
