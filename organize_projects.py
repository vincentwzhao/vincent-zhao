#!/usr/bin/env python3
"""
organize_projects.py

A local script that scans a directory of your projects, figures out what
each one is (Python, Node, Rust, static site, etc.) using marker files, and
either reports on them or sorts them into per-language subfolders.

Usage:
    python3 organize_projects.py --root ~/Projects
    python3 organize_projects.py --root ~/Projects --apply
    python3 organize_projects.py --root ~/Projects --report projects.md

By default this only PRINTS a plan (dry run). Pass --apply to actually move
folders on disk.
"""

import argparse
import json
import subprocess
from pathlib import Path

# Marker file/glob -> category. Checked in order; first match wins.
MARKERS = [
    ("pyproject.toml", "Python"),
    ("requirements.txt", "Python"),
    ("Pipfile", "Python"),
    ("setup.py", "Python"),
    ("package.json", "JavaScript-Node"),
    ("Cargo.toml", "Rust"),
    ("go.mod", "Go"),
    ("pom.xml", "Java"),
    ("build.gradle", "Java"),
    ("build.gradle.kts", "Java"),
    ("Gemfile", "Ruby"),
    ("composer.json", "PHP"),
    ("*.csproj", "CSharp-DotNet"),
    ("*.sln", "CSharp-DotNet"),
    ("index.html", "Static-Web"),
]

DEST_DIRNAME = "organized"


def detect_category(project_dir: Path) -> str:
    for marker, category in MARKERS:
        if "*" in marker:
            if any(project_dir.glob(marker)):
                return category
        elif (project_dir / marker).exists():
            return category
    if (project_dir / ".git").exists():
        return "Other-Git"
    return "Uncategorized"


def git_info(project_dir: Path) -> dict:
    if not (project_dir / ".git").exists():
        return {}
    info = {}
    try:
        remote = subprocess.run(
            ["git", "-C", str(project_dir), "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=5,
        )
        if remote.returncode == 0:
            info["remote"] = remote.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        pass
    try:
        last_commit = subprocess.run(
            ["git", "-C", str(project_dir), "log", "-1", "--format=%ad", "--date=short"],
            capture_output=True, text=True, timeout=5,
        )
        if last_commit.returncode == 0 and last_commit.stdout.strip():
            info["last_commit"] = last_commit.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        pass
    return info


def scan_projects(root: Path):
    projects = []
    for entry in sorted(root.iterdir()):
        if not entry.is_dir():
            continue
        if entry.name in (DEST_DIRNAME, ".git"):
            continue
        category = detect_category(entry)
        projects.append({
            "name": entry.name,
            "path": str(entry),
            "category": category,
            **git_info(entry),
        })
    return projects


def write_markdown_report(projects, out_path: Path):
    by_category = {}
    for p in projects:
        by_category.setdefault(p["category"], []).append(p)

    lines = ["# Projects\n"]
    for category in sorted(by_category):
        lines.append(f"## {category}\n")
        for p in by_category[category]:
            extra = ""
            if "remote" in p:
                extra += f" — {p['remote']}"
            if "last_commit" in p:
                extra += f" (last commit {p['last_commit']})"
            lines.append(f"- **{p['name']}**{extra}")
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def apply_moves(projects, root: Path):
    dest_root = root / DEST_DIRNAME
    for p in projects:
        src = Path(p["path"])
        dest_dir = dest_root / p["category"]
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / src.name
        if dest.exists():
            print(f"SKIP (already exists): {dest}")
            continue
        print(f"MOVE: {src} -> {dest}")
        src.rename(dest)


def main():
    parser = argparse.ArgumentParser(description="Organize local project folders by type.")
    parser.add_argument("--root", default=".", help="Directory containing your project folders (default: current directory).")
    parser.add_argument("--apply", action="store_true", help="Actually move folders into organized/<category>/. Without this flag, only a plan is printed.")
    parser.add_argument("--report", help="Path to write a Markdown report (e.g. projects.md).")
    parser.add_argument("--json", help="Path to write a JSON report (e.g. projects.json).")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error(f"--root {root} is not a directory")

    projects = scan_projects(root)
    if not projects:
        print(f"No project folders found in {root}")
        return

    print(f"Found {len(projects)} project(s) in {root}:\n")
    for p in projects:
        extra = f" ({p['remote']})" if "remote" in p else ""
        print(f"  [{p['category']}] {p['name']}{extra}")

    if args.report:
        write_markdown_report(projects, Path(args.report).expanduser())
        print(f"\nMarkdown report written to {args.report}")

    if args.json:
        Path(args.json).expanduser().write_text(json.dumps(projects, indent=2), encoding="utf-8")
        print(f"JSON report written to {args.json}")

    if args.apply:
        print(f"\nMoving folders into {root / DEST_DIRNAME} ...")
        apply_moves(projects, root)
    else:
        print("\nDry run only — nothing was moved. Re-run with --apply to organize them into folders on disk.")


if __name__ == "__main__":
    main()
