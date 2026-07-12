# The overnight batch: Menu Lens · Generative Kamon · Sumi v1 — design

*2026-07-12, trip night one. Owner picked three of the six features from the vision talk ("knock out all of
them at once. Menu, kiwi, Sumi, and Kamon") and went to bed. Phrase Dojo, the generative soundscape, and the
opening cinematic were explicitly deferred. Build order was utility-first with a drop-line: Menu Lens (+ the
kiwi allergen) → kamon → Sumi, one branch, feature-per-commit, suite green at every commit, pushed as each
landed — so a session cutoff at any point left a mergeable branch.*

## Menu Lens — dinner through the decoder's eye

The second Aibō lens, riding the Sign Decoder's rails (DECISIONS #17) unchanged: same BYO on-device key, same
`claude-opus-4-8`, same browser-direct CORS call. What's new is the ask and the answer:

- **`decodeMenu(imageB64, key, allergies)`** in `lens.ts` — the family's allergy card (en + jp, from the Kit
  picker) is injected into the system prompt. A shared **`lensCall`** helper now carries both lenses' fetch,
  error mapping, and JSON parsing; `max_tokens` 2048 because menus run long.
- **Structured result**: `dishes[{ jp, en, price, flag: avoid|caution|ok, kid, why }]`, `picks`, `warnings`
  (allergy heads-ups first, then how-ordering-works-here notes), `order` (the polite Japanese to say or show).
- **`MenuLens.tsx`** mirrors SignLens's idle → reading → done/failed machine under the same `.lens-*`
  clothing (kanji 食). Done state: warnings first, then dish rows — avoid struck in vermillion with a
  kid-plain why, caution's why in gold, kid picks marked 子 in pine, prices right-aligned — then picks and
  the order line. Fail copy (`FAIL_FACE`) moved to `lens.ts` and is shared.
- **Offline discipline**: `?menu=ok|offline|badkey` fixtures short-circuit the network exactly like
  `?lens=`; the story suite never goes online. Both lens cards share `.lens-card`, so the sign checks were
  scoped to `.sign-lens` (Playwright strict mode would otherwise see two `.lens-begin`s).
- **Kiwi** (キウイフルーツ, one of Japan's recommended-label allergens) appended to the `allergens` picker in
  `kit.ts`. `allergies` is one of the seven live-synced monotonic fields, so one tap on any phone unions to
  all four.

## Generative Kamon — the crest the trip paints

**It derives; it never asks** (DECISIONS #25). No picker: the crest is composed from the travelers the family
already named (Kit → Settings) and the loved moments they already collected.

- **Construction** (`art/Kamon.tsx`, viewBox 96, the eki-stamps' visual grammar): double maru enclosure
  (2.4 outer / 0.8 inner at half opacity), k-fold rotational symmetry where k = traveler count — each fold
  one traveler's animal motif in their ink-color **token** (`var(--sakura)` etc., so the crest re-tints
  through every solar phase for free), fold-divider strokes between folds, a center knot (dot + thin ring).
  Motifs are geometric abstractions on the stamps' 24×24 grid, designed to read at any rotation: fox wedge,
  antler branches, tsuru-no-maru wing, fan-bodied crab, rabbit ears, tanuki belly-and-leaf.
- **Growth**: one sakura petal per loved moment, evenly ringed between the enclosure lines, capped at 36 for
  composition. Backfills instantly from existing state and converges across phones as the ink syncs.
- **Fallbacks**: zero travelers → a five-petal blossom; one traveler → their motif centered, no dividers.
- **Mounts**: sealing the Family Ink card in Kit (76px) and the Treasures shelf header (64px).

## Sumi v1 — the ink spirit, ambient scope (DECISIONS #26)

A fox-tanuki blob in three brushstrokes (body, ears, tail; paper-colored eyes), mounted once in `App.tsx`,
fixed above the tab bar (z-index 60 — under the tabbar's 100 and every modal). The Claude brain stays on the
Moonshot Shelf; v1 is presence, not conversation:

1. **Breathes** (4.4s scale cycle, transform-origin at the feet), blinks, twitches an ear — pure CSS.
2. **Sleeps at night** — keyed entirely off `:root[data-phase='night']`, which the solar palette already
   stamps: eyes swap for closed lids, a z-wisp drifts, the breath slows. Under the night palette
   `var(--ink)` runs pale, so sleeping Sumi renders as a faint moonlit spirit — kept deliberately.
3. **Joy** — Journey's moment-setter now dispatches `CustomEvent('tabi:loved')`; Sumi hops twice with four
   ink droplets flying (per-droplet CSS vars). Joy wakes it even at night. Petting (a tap) does the same.
4. **Nara antlers** — `currentCity()` (newly exported from `solar.ts`; derives today's city from the
   departure date + itinerary, same math the palette uses) dresses it on the Nara day.
5. **Reduced motion stills everything** — one media-query kill switch over all its animations.

## Verification

Story suite grew 107 → **130** (menu fixtures and fail faces, kamon folds/petals/growth/fallback, Sumi
presence/sleep/joy/antlers/reduced-motion), fully offline. Visual pass via Playwright element screenshots at
iPhone viewport (day and night palettes): menu result card, kamon close-up + both mounts, Sumi awake, asleep,
antlered, and in place above the tab bar. Real-key Menu Lens smoke test is owner-side (his key + a real menu).
