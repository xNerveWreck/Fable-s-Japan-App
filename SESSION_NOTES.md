# Session Notes — Tabi (旅)

Running log, newest entry on top. Read after README, before DECISIONS.md and the
plan. The repo is the only memory shared between the laptop and claude.ai cloud
sessions — never end a session without an entry here or a wrapped report.

---

## 2026-07-10 — Living vignettes, Fuji Window, and the four-feature trip pack

**What happened (three arcs, one desktop session):**

1. **Living vignettes** shipped (owner merged as PR #10/#12 chain): every city
   painting split into depth planes that tilt with the phone (iOS permission from
   the first tap on a painting; autonomous drift without it), plus inhabitants —
   Kyoto's heron, Hakone's new ropeway gondola, Nara's bowing deer head, Osaka's
   claw wave and after-dark neon, Tokyo's twinkling windows, all pure CSS on the
   solar palette. Test/demo hook: `?vg=now` puts timed visitors mid-scene.
2. **Fuji Window** shipped (merged with the above): day 7's GPS Tōkaidō scroll
   (`src/lib/tokaido.ts` geometry + `src/components/FujiWindow.tsx`). Counts down
   to the real Fuji viewing window near Shin-Fuji, LOOK RIGHT bloom, tunnel-patient
   status. `?ride=<0..1>` drives it without GPS.
3. **Trip pack** built on branch `claude/trip-pack` (12 commits, **awaiting owner
   merge**): family voice phrasebook (mic per phrase → IndexedDB `voices` store,
   DB v2), Denshadex (10 train cards in a new Discover tab, synced via
   `tabi:densha`), Deer Diplomacy (day-11 dojo, ranks, synced count), Side Quests
   v1 (3 hunts × 5 cities, unlock by trip-day city or already-granted GPS; 2 finds
   reveal a hidden `vq-bonus` detail in that city's vignette). Built via
   executor-grade plan (`docs/superpowers/plans/2026-07-10-trip-pack.md`) + four
   Sonnet executor subagent waves with orchestrator diff review between each.

**Verified how:** story suite grew 42 → 60 → **79 checks, all green** (every
feature test-first: red commit, then green); independent re-runs after every
executor wave; visual pass at 390×844 across solar phases for every feature
(screenshots confirmed the senbei stack appearing in the Nara vignette after two
quest finds — the whole side-quest loop live).

**Weird things hit (gold for the next agent):**
- Mid-trip the solar clock follows the **current city's** sun, not Tokyo's — any
  night-time test assertion must use `?clock=00:30`, never a computed Tokyo
  lantern minute. Same trap exists for trip-day math: the app runs on JST
  (`jstToday()`), so a locally-computed departure date can be a day off.
- PowerShell 5.1 mangles double quotes inside `git commit -m` here-strings —
  commit messages must avoid embedded `"` entirely.
- `npm run check` serves `dist/` — always `npm run build` first.
- The Browser-pane preview tools changed shape mid-session; the `mcp__playwright__*`
  tools are the reliable fallback for visual verification.
- React: two `useStored` instances on the same key do NOT re-render each other —
  quest state had to be lifted into `DayDetail` so a find repaints the vignette
  live (executor caught this against the plan's sketch).

**Shipped:** owner merged PR #13 the same day; tagged **v3.1.0** (the repo's
first tag) and published the GitHub Release with `dist/` zipped as the asset:
https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v3.1.0 — main
verified 79/79 green at the merge commit before tagging.

**Pick up here:** (1) owner opens the app once on each phone on Wi-Fi so the
service worker caches v3.1.0 before the 2026-07-12 flight; (2) on a real iPhone:
tap a painting (motion permission), record one phrase (mic permission), log one
Denshadex card — report anything that feels off (tilt amplitude is a two-number
CSS tune). Next build candidates are in IMPLEMENTATION_PLAN.md; nothing is
mid-flight.

---

## 2026-07-09 — Desktop clone bootstrapped; Windows test-suite fix

**What happened:** First desktop clone of this repo to
`C:\Users\xlr86\Documents\Fable-s-Japan-App` (canonical GitHub:
`xNerveWreck/Fable-s-Japan-App`). Setup per CLAUDE.md: `npm install`,
`npx playwright install chromium`. Found and fixed a Windows-only bug: the story
suite spawned `npx` directly (ENOENT on Windows) — now spawns vite's JS entry via
`process.execPath` (merged as PR #9). Suite was 42/42 green after.

**Pick up here:** superseded by the 2026-07-10 entry above.
