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
- Offline-first; no new dependencies; no runtime network — exactly TWO
  sanctioned exceptions (no third without an owner decision): the sign decoder
  (`api.anthropic.com`, owner's on-device key, DECISIONS.md #17) and Family Ink
  live sync (`@supabase/supabase-js`, lazy-loaded, OFF by default, DECISIONS.md
  #22). The AI key lives in `localStorage` only — never in `src/lib/sync.ts`,
  any sync payload, the repo, or a fixture; the story suite greps for it. All
  art inline SVG on `--art-*` tokens.
- **Live-payload law (DECISIONS.md #23):** `collectLiveState()` carries only the
  converging fields — never re-add the pinned ones (reservations/notes/
  travelers/departure/rate); mine-wins/append merges make a polling loop
  ping-pong forever. The suite tripwires enforce this; read the spec's
  SyncPayload section before touching `src/lib/liveSync.ts`.
- **The family's REAL paired row lives in the `tabi-family-sync` Supabase
  project.** Never delete rows there except test families by their exact
  printed id (the live E2E prints a `cleanup:` line). Never run destructive
  SQL against that project without the owner's explicit go.
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
  Ambient chrome goes *lower*: Sumi floats at 60 so every modal covers it.
- Playwright `page.goto()` to the **same URL** (even with a different hash) does
  NOT reload the page — state and injected DOM survive. Navigate to a different
  query/hash or call `page.reload()` when a fresh boot matters.
- Playwright locators are **strict**: two lens cards live in Speak now, so lens
  assertions scope to `.sign-lens` / `.menu-lens` — a bare `.lens-begin` click
  throws on the two matches.
- Journey's moment-setter dispatches `CustomEvent('tabi:loved')` on every loved
  mark (Sumi listens); `currentCity()` in `solar.ts` is the one source for
  "which trip city is today" — derive costumes/features from it, don't re-math.
- The story suite is one ESM scope — top-level `const` names collide across
  sections and kill the whole run at parse time; give each new section fresh
  context/page variable names.
- `npm run check:live` (`tests/live-ink.mjs`) is the ONLY networked test —
  manual, never wired into `npm run check`. Build first; it needs Anonymous
  sign-ins enabled on the Supabase project (it probes and says so if not). It
  creates a real family and prints a `cleanup: delete from families where id =
  '…'` line — run exactly that (Supabase MCP `execute_sql`), only that id.
- Suite section 17 (live ink) drives fixture states via `?ink=off|solo|synced|
  invited|unreachable` — fixtures only take effect through `maybeStartInk()`,
  so they need App boot wiring to be in place (they are; don't move the call).
- Git Bash on this machine has no `zip`; build Release zips with PowerShell
  `Compress-Archive -Path dist\* -DestinationPath <name>.zip`.

## Wrap-up (every session that changed anything)

CLAUDE.md's five steps (verify → commit/push → ROADMAP ledger → docs → report),
PLUS: SESSION_NOTES.md entry with a "Pick up here:" line, DECISIONS.md for
anything settled, README "Current state" refresh, this file for new quirks.

## Versioning

Semver tags + GitHub Releases start at v3.1.0 (the trip-pack merge; DECISIONS.md
#15). On ship: `git tag -a vX.Y.Z -m "summary"`, push the tag, publish a Release
with a plain-English what's-new and `dist/` zipped as the asset, update README's
Current state. Deploys themselves are automatic (GitHub Pages workflow on main).
