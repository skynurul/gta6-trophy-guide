# GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/skynurul/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/skynurul/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI**, built as an entry for make.fun's bounty “Build the best GTA 6 trophy guide” (gta6-trophy-guide-01).

## What it is

Open `app/index.html` in a desktop browser — it works with the network off. It is a complete trophy guide and checklist:

- **Tracker** — check off all 55 trophies; progress is saved in your browser (localStorage) and survives reloads. Export your progress to a file and import it back, or reset it.
- **A real guide for every trophy** — what to do, where and how, and when it can be missed, written in our own words. The official trophy names, descriptions and grades are shown exactly as PlayStation publishes them.
- **Roadmap to platinum** — the order to earn them in: Stage 1 play the story, Stage 2 the 100% Completion checklist, Stage 3 strangers and cleanup. Roughly 200 hours, difficulty about 4/10.
- **Missable warning** — only one trophy can be missed: **Positive Mental Attitude** (meditate at every spot) has a first step that only exists in Chapter 1. The guide flags it and tells you exactly what to do. Everything else can be cleaned up after the story.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade (platinum, gold, silver, bronze), by earned status, and by search.
- **Spoiler setting** — hide story trophy names and descriptions until you have earned them.
- **Progress** — X/55 earned, % to platinum, and counts by grade, plus a progress bar.
- **Sources** — every guide cites its sources (PowerPyx, PlayStationTrophies.org, PSNProfiles, TrueTrophies, Exophase and others). Five trophies are still unconfirmed by any guide; the page says so plainly instead of guessing a method.

## Facts about the list

- 55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. 27 visible, 28 hidden.
- All 55 are offline and single-player — there are no online trophies, no difficulty settings, no mission replay and no New Game+.
- Cheats disable trophies and saving.
- There are 15 manual save slots plus 1 autosave. Keep a save at the start and end of each chapter (10 saves), then rotate the other 5 for free-roam cleanup.

## How to run it

Serve the folder and open `app/index.html`:

```sh
node serve.ts        # or any static server
```

Then open the address it prints. The app loads nothing over the network — every file it needs is under `app/`.

## How to build the entry

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there with the vendored make.fun library (`vendor/makefun-frontend.ts`, never modified). Run it with Node 22:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

| Path | What it is |
| --- | --- |
| `app/index.html` | The page (structure, toolbar, roadmap, tracker, sources). |
| `app/app.js` | The tracker: renders the list, filters, spoiler mode, localStorage, export/import. |
| `app/style.css` | The look (dark, system fonts, no external assets). |
| `app/data/trophies.json` | The 55 trophies: official name/description/grade, plus kind, missable flag, roadmap stage and a guide with sources for each. |
| `screenshots/` | 4 screenshots of the running app (the first by name is the cover). See `shots.json`. |
| `main.ts` | Builds the entry (copies app/ + screenshots/, writes dossier.json). |
| `vendor/makefun-frontend.ts` | The make.fun dossier library (vendored, unmodified). |

## Sources

The guides were checked against PowerPyx, Push Square, PlayStationTrophies.org, PSNProfiles, TrueTrophies, Exophase, GTA Zone, Output Lag, KeenGamer and EGamers. See `app/data/trophies.json` (`sourceList` and each trophy's `sources`) for the exact source of every guide.

Unofficial fan guide. Not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork, box art or game screenshots are used here.
