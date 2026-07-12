# Implementation Plan of Record — Tabi (旅)

**Status (2026-07-12, departure morning):** **v3.5.0 merged and live** (real
itinerary + Sign Decoder; tag + Release pending the owner's go). **v3.6.0 is
BUILT** on `claude/treasures-tab` (98-check suite green), awaiting merge: the
Treasures tab reorg from the owner's first on-device feedback (DECISIONS.md
#21) — collection layer to its own tab, travelers to Kit settings, The Road
retired.

## How planning works in this repo

Feature-level plans are **not** written in this file — they live as dated,
executor-grade documents in `docs/superpowers/plans/` with their specs in
`docs/superpowers/specs/`. This file is the index and the invariants. The
sequencing vision lives in ROADMAP.md (Part IV is the shipped/remaining ledger —
keep it updated, it is a rule here, not a nicety).

| Plan | Spec | Status |
|------|------|--------|
| `2026-07-09-living-vignettes.md` | `2026-07-09-living-vignettes-design.md` | ✅ shipped (merged to main) |
| `2026-07-10-fuji-window.md` | `2026-07-10-fuji-window-design.md` | ✅ shipped (merged to main) |
| `2026-07-10-trip-pack.md` (4 waves) | decisions inline in the plan | ✅ shipped (merged to main, tagged v3.1.0) |
| `2026-07-10-haiku-engraver.md` | `2026-07-10-haiku-engraver-design.md` | ✅ shipped (merged to main, tagged v3.2.0) |
| `2026-07-10-sign-decoder.md` | `2026-07-10-sign-decoder-design.md` | ✅ built — **on `claude/real-itinerary`, awaiting merge** (owner gave the go 2026-07-11; built on the shared branch per DECISIONS.md #20) |
| Real itinerary swap (Claude Code plan-mode session, 2026-07-11) | decisions in DECISIONS.md #18–#19 | ✅ shipped (merged to main 2026-07-12, PR #17) |
| Treasures tab reorg (owner field feedback, 2026-07-12) | decision in DECISIONS.md #21 | ✅ built — **on `claude/treasures-tab`, awaiting merge** |

## Hard invariants (bind every plan and every session)

- No new npm dependencies; no image/font/audio assets; no network calls at runtime
  (until DECISIONS.md #14 is resolved for the AI layer).
- All art inline SVG on existing `--art-*`/theme tokens; never a hardcoded color;
  semantic tokens per role.
- `prefers-reduced-motion: reduce` stills everything new — same scene, no motion.
- Never strand state: schema changes to stored data ship with silent migrations
  (localStorage) or additive upgrades (IndexedDB version bumps, `contains()`-guarded).
- Family Sync (`src/lib/sync.ts`): only OPTIONAL additive `TripState` fields with
  additive merge semantics; old links must always still decode; `v: 1` frozen.
- Story suite is the gate: test-first (red commit → green commit), append-only
  sections, `npm run build` before `npm run check`, everything green before push.
- Branch-per-feature, pushed, never merged by an agent (owner merges on GitHub).

## Invariant changes (dated)

- 2026-07-10 — "No network, ever" is formally a *principle* (offline-first, never
  offline-only), per ROADMAP's preamble; runtime network remains unused in
  practice until the AI-layer key decision (DECISIONS.md #14).
- 2026-07-10 (later) — #14 is **resolved** (DECISIONS.md #17): when the sign
  decoder is built, it may call `api.anthropic.com` at runtime with the owner's
  on-device key. Everything else remains offline; no feature may *require* the
  network to leave the family stranded.

## Next-build candidates (owner picks; none started)

In rough value order (2026-07-10 list, updated 2026-07-11 — the decoder and
engraver have shipped off it):
1. **During-trip polish** driven by real family use (tilt feel tuning is a
   two-number CSS change; expect it). The trip is Jul 12–23 — this is now live.
2. **Living Sky Engine** (`net`) — good rainy-week or post-trip build.
3. **Sumi, the ink spirit** — L-size, post-trip, do it properly.
4. **Side Quests v2** — photo proof via the journal's IndexedDB photo store.
5. **Meltdown SOS** — descoped to the calm-breathing screen if built (see
   DECISIONS.md context; the "nearest toilet" finder is not worth its data cost).
