# Implementation Plan of Record — Tabi (旅)

**Status (2026-07-12, overnight — trip underway):** everything through
**v4.0.1 is merged, tagged, and live.** v3.5.0/v3.6.0 shipped departure
morning; **v4.0.0 Family Ink live sync** (Supabase realtime, DECISIONS.md
#22–#23) shipped the same day and the family paired both phones; **v4.0.1**
fixed the synced card's invite-code display hours later. The **Michizure
batch** (Menu Lens + kiwi, generative kamon, Sumi v1 — DECISIONS.md #24–#26)
is built and pushed on `claude/menu-kamon-sumi`, **awaiting owner merge →
v4.1.0**. Suite 130/130; live E2E (`npm run check:live`) 8/8 against the
real project.

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
| `2026-07-10-sign-decoder.md` | `2026-07-10-sign-decoder-design.md` | ✅ shipped (merged to main 2026-07-12, PR #17, tagged v3.5.0) |
| Real itinerary swap (Claude Code plan-mode session, 2026-07-11) | decisions in DECISIONS.md #18–#19 | ✅ shipped (merged to main 2026-07-12, PR #17) |
| Treasures tab reorg (owner field feedback, 2026-07-12) | decision in DECISIONS.md #21 | ✅ shipped (merged to main 2026-07-12, PR #18, tagged v3.6.0) |
| `2026-07-12-live-family-sync.md` (6 tasks, subagent-driven) | `2026-07-12-live-family-sync-design.md` | ✅ shipped (merged 2026-07-12, PR #20, tagged v4.0.0; field fix PR #22 tagged v4.0.1 the same night) |
| Michizure batch (plan-mode session, built in-session, 2026-07-12 overnight) | `2026-07-12-menu-lens-kamon-sumi-design.md` | 🖌️ built + pushed on `claude/menu-kamon-sumi`, awaiting owner merge (→ v4.1.0) |

## Hard invariants (bind every plan and every session)

- No new npm dependencies; no image/font/audio assets; no runtime network —
  with exactly TWO sanctioned exceptions, both opt-in and both degrading to a
  working offline app: the Aibō lenses — Sign Decoder and Menu Lens, one shared
  call path (`api.anthropic.com`, on-device key,
  DECISIONS.md #17/#24) and Family Ink live sync (`@supabase/supabase-js`,
  lazy-loaded, OFF by default, DECISIONS.md #22). No third exception without an
  owner decision.
- All art inline SVG on existing `--art-*`/theme tokens; never a hardcoded color;
  semantic tokens per role.
- `prefers-reduced-motion: reduce` stills everything new — same scene, no motion.
- Never strand state: schema changes to stored data ship with silent migrations
  (localStorage) or additive upgrades (IndexedDB version bumps, `contains()`-guarded).
- Family Sync (`src/lib/sync.ts`): only OPTIONAL additive `TripState` fields with
  additive merge semantics; old links must always still decode; `v: 1` frozen.
- Live Family Ink (`src/lib/liveSync.ts`): the live payload carries ONLY fields
  whose merges converge (DECISIONS.md #23) — never re-add the pinned fields
  (reservations/notes/travelers/departure/rate); the suite tripwires enforce it.
  Never delete non-test rows in the `tabi-family-sync` Supabase project — the
  family's real paired row lives there.
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
- 2026-07-12 — the "no new dependencies / no runtime network" invariant gains
  its second and final-for-now exception (DECISIONS.md #22): Family Ink live
  sync adds `@supabase/supabase-js` (dynamic-imported; the suite proves it
  stays off the startup path) and talks to the owner's Supabase project. The
  principle stands: OFF by default, the folded link is the permanent floor,
  and nothing requires the network.

## Next-build candidates (owner picks; none started)

In rough value order (2026-07-10 list, updated 2026-07-12 — the decoder,
engraver, and live sync have shipped off/around it):
0. **Family Ink follow-up hardening** — the small post-ship list in
   SESSION_NOTES (2026-07-12): revoke anon EXECUTE on the definer RPCs +
   attempt-cap the code-mint loops (one migration), soften the unreachable-face
   flicker, the bloom-remount-closes-modals edge. Rainy-day sized.
1. **During-trip polish** driven by real family use (tilt feel tuning is a
   two-number CSS change; expect it). The trip is Jul 12–23 — this is now live.
2. **Living Sky Engine** (`net`) — good rainy-week or post-trip build.
3. **Sumi, the ink spirit** — L-size, post-trip, do it properly.
4. **Side Quests v2** — photo proof via the journal's IndexedDB photo store.
5. **Meltdown SOS** — descoped to the calm-breathing screen if built (see
   DECISIONS.md context; the "nearest toilet" finder is not worth its data cost).
