# Implementation Plan of Record — Tabi (旅)

**Status (2026-07-10, late session):** trip pack merged and tagged v3.1.0. The
**Haiku Engraver is BUILT** on branch `claude/haiku-engraver` (88-check suite
green) awaiting the owner's merge; the **Sign & Etiquette Decoder is designed
and planned, build deferred** until the owner says go (key architecture
decided — DECISIONS.md #17).

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
| `2026-07-10-haiku-engraver.md` | `2026-07-10-haiku-engraver-design.md` | ✅ built — **on `claude/haiku-engraver`, awaiting merge** |
| `2026-07-10-sign-decoder.md` | `2026-07-10-sign-decoder-design.md` | 📐 planned, executor-grade — **build deferred, owner says go** |

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

In rough value order, from the 2026-07-10 discussion:
1. **During-trip polish** driven by real family use (tilt feel tuning is a
   two-number CSS change; expect it).
2. **Living Sky Engine** (`net`) — first network feature; good rainy-week or
   post-trip build.
3. **Sumi, the ink spirit** — L-size, post-trip, do it properly.
4. **Sign & Etiquette Decoder** — blocked on the API-key architecture decision.
5. **Haiku Engraver** — build-time generation, can ship offline any time.
6. **Side Quests v2** — photo proof via the journal's IndexedDB photo store.
7. **Meltdown SOS** — descoped to the calm-breathing screen if built (see
   DECISIONS.md context; the "nearest toilet" finder is not worth its data cost).
