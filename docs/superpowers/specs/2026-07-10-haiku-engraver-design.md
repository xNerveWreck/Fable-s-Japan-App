# Haiku Engraver — Design

**Date:** 2026-07-10 · **Roadmap item:** 🤖 AI companion, "Haiku Engraver" (`S · AI`)
**Why now:** owner picked it from the next-build candidates; it is the one AI-tagged item
that can ship fully offline before the flight, because the poems are pre-authored.

## Intent

Every loved moment quietly receives a 5-7-5 — engraved into its treasure card the instant
the heart lands. Post-trip payoff: the loved poems unroll as a single **tanzaku scroll**,
the trip written as poetry, by the day it was lived.

Compass fit: **data becomes heirloom** — the poems make the treasures list an illustrated
diary worth keeping. **Offline-first** — all 74 haiku ship in the bundle as static data;
nothing is generated at runtime (upholds DECISIONS.md #14's no-runtime-AI principle).
**Quiet by default** — nothing new prompts or interrupts; the poem is simply there when
the moment is loved.

## Authorship (supersedes the CI mechanism sketched in #14)

The haiku are authored **in-session by the model** (Claude Fable, 2026-07-10) with the
full itinerary in context — one poem per activity, specific to that stop's note and kid
tip — and committed as reviewable data. This satisfies #14's intent (haiku describe
static stops; no runtime AI) with strictly less machinery than a CI pipeline: no API key
in GitHub secrets, no generation cost per build, and the diff **is** the review.
Recorded as a new DECISIONS.md entry.

## Data (`src/data/haiku.ts`)

```ts
/** Moment key `d{dayId}:{activityIndex}` → three lines joined by '\n'. */
export const haiku: Record<string, string>
```

- English 5-7-5, kid-readable, concrete to the stop (the deer, the gates, the egg sando) —
  never generic filler.
- **Complete coverage is a tested invariant**: every key produced by
  `itinerary.flatMap((d) => d.activities.map((_, i) => `d${d.id}:${i}`))` must exist in
  `haiku`. A new activity without a poem turns the suite red.

## Where it lives

**Treasure rows (Journey tab).** The existing `Treasures` list renders each loved moment
as a row (title, day · city). The row gains the engraving: the poem's three lines in
`--ink-faint`, small italic serif, under the title. Row tap still opens the day. The list
grows taller — that is the point; it is the diary.

**The tanzaku scroll.** When ≥ 1 moment is loved, the Loved moments section header gains
an "Unroll the scroll · 短冊" affordance. It opens a full-screen overlay: a vertical washi
strip on the solar paper tokens, every loved haiku in trip order, each with a small
day-number/city mark; a hanko seal closes the strip. CSS-only unroll transition
(translate/opacity), stilled under `prefers-reduced-motion` (same scene, no motion —
DECISIONS.md #7). Close button returns to Journey. Works in airplane mode.

## Sync

No changes. Haiku are static bundle data; loved state (`moments`) already syncs. `v: 1`
untouched.

## Verification

New story-suite section (test-first, red commit → green):
1. every itinerary moment key has a haiku (data completeness);
2. loving a moment engraves its poem in the treasure row;
3. two loved moments → the scroll unrolls with both poems in trip order;
4. reduced-motion: overlay appears with no animation.
Field-note-1 visual pass at 390×844, day and lantern phases.

## Out of scope (v1)

Haiku on DayDetail activity cards; per-traveler ink-colored poems; export/print of the
scroll (v4.5 physical pipeline); any runtime generation; Japanese-language haiku.
