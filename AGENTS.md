# AGENTS.md — Tabi (旅), project-local rules

Scoped to THIS repo only. The owner's universal working-style rules live at
`C:\Users\xlr86\Documents\CS50x Vault\AGENTS.md` — read that first in any desktop
session; never copy universal rules here or project rules there.

**CLAUDE.md remains the authoritative session protocol for this repo** (web
SessionStart hook, `/pickup`, the full wrap-up, the Stop hook). This file adds
the read order, hard constraints, and hard-won quirks so a cold agent needs
nothing from anyone's head. If this file and CLAUDE.md ever disagree, CLAUDE.md
wins and the disagreement is a bug — fix this file.

## Read order (cold start)

1. `CLAUDE.md` — session protocol, commands, wrap-up rules
2. `README.md` — what the app is + Current state
3. `SESSION_NOTES.md` — newest entry has the "Pick up here:" line
4. `DECISIONS.md` — settled choices; do not re-litigate
5. `IMPLEMENTATION_PLAN.md` — invariants + plan index (plans in `docs/superpowers/plans/`)
6. `ROADMAP.md` Part IV — the shipped/remaining ledger · `PROCESS.md` — the method

Then `/pickup` (or follow its steps manually: sync origin, check state, verify
suite green, propose next increment).

## Hard constraints

- **Never merge to main. Never open a PR unless asked.** Push the session branch
  and stop; the owner reviews and merges on GitHub — always (universal rule,
  restated here because it has been violated once on another project).
- Offline-first; no new dependencies; no runtime network — sole sanctioned
  exception: the sign decoder (built 2026-07-11) calls `api.anthropic.com` with
  the owner's on-device key (DECISIONS.md #17; resolves #14). That key lives in
  `localStorage` only — it must never appear in `src/lib/sync.ts`, any sync
  payload, the repo, or a fixture; the story suite greps for it. All art inline
  SVG on `--art-*` tokens.
- Test-first against `tests/story.mjs`; everything green before any push.
- Multi-surface repo: `git fetch` FIRST, every session — claude.ai cloud sessions
  edit this repo too, and local may be stale.
- Feature branches touching the same ROADMAP/README lines: stack them and tell
  the owner the merge order (DECISIONS.md #10).

## Delegation

Wave-sized, plan-backed work goes to the versioned executor agent
(`.claude/agents/executor.md`): executor-grade plan first (self-contained,
decisions pre-made, do-not-touch list, escape hatches), Sonnet executor per wave,
orchestrator reviews the diff and re-runs gates between waves. Small or
interactive work: just do it directly.

## Testing & environment quirks (each cost real time once)

- `npm run check` serves `dist/` — **always `npm run build` first**.
- Windows: never `spawn('npx', …)` from Node (ENOENT); spawn vite's JS entry via
  `process.execPath` (already done in the suite — keep it that way).
- PowerShell 5.1: **no double quotes inside `git commit -m` messages** — argument
  passing shreds them into fake pathspecs.
- The solar clock follows the **current city's sun mid-trip** — night assertions
  use `?clock=00:30` (night in every trip city), never Tokyo's lantern minute.
- Trip-day math runs on JST (`jstToday()`); a locally-computed date can be a day
  off — seed test departures from the JST date.
- Deterministic hooks: `?clock=HH:MM` (solar), `?vg=now` (vignette visitors
  mid-scene), `?ride=0..1` (Fuji Window position), `?demo=1` (lived-in day 7).
- Two `useStored` hooks on the same key do NOT re-render each other — lift shared
  state (see Side Quests / DayDetail).
- Playwright specials in the suite: fake-mic browser launch for voice tests
  (`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` + mic
  permission), `setGeolocation` contexts for GPS tests.
- Visual pass: launch config `tabi-preview` (vite preview, port 4175, spawned via
  node). If the Browser-pane `preview_*` interaction tools are unavailable, the
  `mcp__playwright__*` MCP tools work. Look at 390×844 across solar phases —
  field note 1: the compiler can't see whether the deer's bow looks like a bow.
- Red-state TDD runs abort with a hard TimeoutError at the first missing locator
  (results don't print) — that IS the expected red state, not a broken suite.
  Guard red-phase clicks with `if (await locator.count())` so the FAIL lines
  still print instead of the run dying at the first absent element.
- The itinerary has **62** activities since the 2026-07-11 real-itinerary swap
  (73 before it) — count with the strict `^\s*time: '` regex; a loose
  `^\s*time:` over-counts. The suite enforces haiku coverage at exactly one
  poem per stop, so itinerary and `haiku.ts` must change together.
- If the Browser-pane screenshot tool times out (it did, twice, restart
  included), don't fight it: `SHOT_DIR=<dir> npm run check` makes Playwright
  capture real screenshots of the key screens.
- Full-screen overlays must beat the tab bar: `.tabbar` is `z-index: 100`, so
  overlays go higher (the tanzaku sits at 120) or taps land on the tabbar.
- The story suite is one ESM scope — top-level `const` names collide across
  sections and kill the whole run at parse time; give each new section fresh
  context/page variable names.

## Wrap-up (every session that changed anything)

CLAUDE.md's five steps (verify → commit/push → ROADMAP ledger → docs → report),
PLUS: SESSION_NOTES.md entry with a "Pick up here:" line, DECISIONS.md for
anything settled, README "Current state" refresh, this file for new quirks.

## Versioning

Semver tags + GitHub Releases start at v3.1.0 (the trip-pack merge; DECISIONS.md
#15). On ship: `git tag -a vX.Y.Z -m "summary"`, push the tag, publish a Release
with a plain-English what's-new and `dist/` zipped as the asset, update README's
Current state. Deploys themselves are automatic (GitHub Pages workflow on main).
