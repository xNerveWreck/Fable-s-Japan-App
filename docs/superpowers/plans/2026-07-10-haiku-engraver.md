# Haiku Engraver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every loved moment receives a pre-authored 5-7-5 engraved into its treasure row, plus a full-screen tanzaku scroll of all loved poems in trip order.

**Architecture:** Static data (`src/data/haiku.ts`, 74 poems keyed by the existing `d{day}:{index}` moment key) rendered in two places — inline in the `Treasures` rows and in a new `TanzakuScroll` overlay. No runtime AI, no network, no sync changes.

**Tech Stack:** React 18 + TypeScript + Vite (existing); Playwright story suite (existing).

**Spec:** `docs/superpowers/specs/2026-07-10-haiku-engraver-design.md`

## Global Constraints

- No new npm dependencies; no image/font/audio assets; no runtime network calls.
- All styling on existing tokens (`--paper`, `--card`, `--ink`, `--ink-soft`, `--ink-faint`, `--hairline`, `--vermillion`, `--font-display`, `--radius`, `--ease-out`); never a hardcoded color.
- `prefers-reduced-motion: reduce` stills everything new — same scene, no motion.
- Story suite is the gate: red commit → green commit; `npm run build` before `npm run check`.
- Branch `claude/haiku-engraver`; push, never merge (owner merges on GitHub).
- Haiku content rules: English 5-7-5; kid-readable; concrete to the stop (a noun from its title/note/kidTip); **no apostrophes or backslashes** (values are single-quoted TS strings parsed by the suite's regex); exactly three lines joined by `\n`.

---

### Task 1: Story checks (red)

**Files:**
- Modify: `tests/story.mjs` (import `readFileSync`; append section 14 before the `} finally {` at line ~442)

**Interfaces:**
- Consumes: `?demo=1` seed (6 loved moments `d1:0`…`d6:0`), `.treasure-row` markup in `src/screens/Journey.tsx`.
- Produces: the contract later tasks must satisfy — selectors `.t-haiku` (with `<i>` per line), `.scroll-btn`, `.tanzaku`, `.tz-poem`, `.tz-mark`, `.tz-close`; data file `src/data/haiku.ts` with entries matching `/'(d\d+:\d+)':\s*\n?\s*'((?:[^'\\]|\\.)*)'/g`.

- [ ] **Step 1: Add `readFileSync` to the fs import**

```js
import { existsSync, mkdirSync, readFileSync } from 'fs'
```

- [ ] **Step 2: Append section 14 immediately before `} finally {`**

```js
  /* ---- 14. The haiku engraver: every loved moment carries a poem ---- */
  let haikuSrc = ''
  try {
    haikuSrc = readFileSync('src/data/haiku.ts', 'utf8')
  } catch {}
  const itinSrc = readFileSync('src/data/itinerary.ts', 'utf8')
  const stopCount = (itinSrc.match(/^\s*time: '/gm) ?? []).length
  const poems = [...haikuSrc.matchAll(/'(d\d+:\d+)':\s*\n?\s*'((?:[^'\\]|\\.)*)'/g)]
  check('every stop carries a poem', stopCount > 0 && poems.length === stopCount, `${poems.length}/${stopCount}`)
  check('every poem is three lines', poems.length > 0 && poems.every((m) => m[2].split('\\n').length === 3))
  check('no stop is engraved twice', poems.length > 0 && new Set(poems.map((m) => m[1])).size === poems.length)

  const hCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const hPage = await hCtx.newPage()
  await hPage.goto(`${BASE}/?demo=1#journey`)
  await hPage.waitForTimeout(700)
  check('loved moments are engraved', (await hPage.locator('.treasure-row .t-haiku').count()) === 6)
  const firstPoem = poems.find((m) => m[1] === 'd1:0')
  const firstLine = await hPage.locator('.treasure-row .t-haiku i').first().textContent()
  check('the engraving is the right poem', !!firstPoem && firstLine === firstPoem[2].split('\\n')[0], firstLine ?? '')
  await hPage.locator('.scroll-btn').click()
  await hPage.waitForTimeout(700)
  check('the tanzaku scroll unrolls', (await hPage.locator('.tanzaku .tz-poem').count()) === 6)
  check('the scroll reads in trip order', ((await hPage.locator('.tz-mark').first().textContent()) ?? '').startsWith('Day 1'))
  await shot(hPage, 'tanzaku')
  await hPage.locator('.tz-close').click()
  await hPage.waitForTimeout(300)
  check('the scroll rolls back up', (await hPage.locator('.tanzaku').count()) === 0)
  await hCtx.close()

  const rmCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const rmPage = await rmCtx.newPage()
  await rmPage.goto(`${BASE}/?demo=1#journey`)
  await rmPage.waitForTimeout(700)
  await rmPage.locator('.scroll-btn').click()
  await rmPage.waitForTimeout(400)
  const tzAnim = await rmPage.locator('.tanzaku').evaluate((el) => getComputedStyle(el).animationName)
  check('reduced motion stills the unroll', tzAnim === 'none', tzAnim)
  await rmCtx.close()
```

- [ ] **Step 3: Verify red**

Run: `npm run build` then `npm run check`
Expected: existing 79 PASS; the 10 new checks FAIL; exit code 1.

- [ ] **Step 4: Commit**

```bash
git add tests/story.mjs
git commit -m "Story suite: haiku engraver checks (red)"
```

### Task 2: The 74 poems (`src/data/haiku.ts`)

**Files:**
- Create: `src/data/haiku.ts`

**Interfaces:**
- Produces: `export const haiku: Record<string, string>` — key `d{dayId}:{activityIndex}` for every activity in `src/data/itinerary.ts`, value = three lines joined by `\n`.

- [ ] **Step 1: Author the data file** — header comment plus one entry per activity, in day order. Format (exactly this shape — the suite parses it):

```ts
/**
 * The haiku engraver: one 5-7-5 per itinerary stop, keyed by the moment key
 * `d{dayId}:{activityIndex}`. Authored in-session (Claude Fable, 2026-07-10)
 * and committed as data — no runtime AI (DECISIONS.md #14/#16). When a moment
 * is loved, its poem is engraved into the treasure card.
 * Rules: English 5-7-5, kid-readable, concrete to the stop, no apostrophes.
 */
export const haiku: Record<string, string> = {
  // Day 1 — Tokyo · Soft Landing
  'd1:0': 'Wheels kiss the runway\nfourteen mornings of Japan\nwait past the jet bridge',
  'd1:1': 'First konbini run\nmystery snacks in bright wrappers\ndinner is research',
  // … every remaining activity, same shape …
}
```

Each poem must name something real from its stop (the deer, the torii, the egg sando — pulled from that activity's `title`/`note`/`kidTip`). Never generic filler; never a placeholder.

- [ ] **Step 2: Verify the data checks pass** — `npm run build && npm run check`: the three source checks PASS (74/74); DOM checks still FAIL (UI not built).

- [ ] **Step 3: Commit**

```bash
git add src/data/haiku.ts
git commit -m "Haiku data: 74 poems, one per stop, pre-authored"
```

### Task 3: Engrave the treasure rows

**Files:**
- Modify: `src/screens/Journey.tsx` (the `Treasures` component, ~line 340)
- Modify: `src/styles/screens.css` (append)

**Interfaces:**
- Consumes: `haiku` from Task 2.
- Produces: `.t-haiku` with one `<i>` per line inside `.treasure-row .grow`.

- [ ] **Step 1: Import the data in Journey.tsx**

```ts
import { haiku } from '../data/haiku'
```

- [ ] **Step 2: In `Treasures`, after the `.t-sub` span, add**

```tsx
{haiku[key] && (
  <span className="t-haiku">
    {haiku[key].split('\n').map((line, li) => (
      <i key={li}>{line}</i>
    ))}
  </span>
)}
```

- [ ] **Step 3: Append CSS to screens.css**

```css
/* ================= v3.2 — the haiku engraver ================= */
.treasure-row .t-haiku {
  display: block;
  margin-top: 3px;
  color: var(--ink-faint);
  font-size: 12.5px;
  line-height: 1.5;
}
.treasure-row .t-haiku i {
  display: block;
  font-style: italic;
}
```

- [ ] **Step 4: Verify** — `npm run build && npm run check`: "loved moments are engraved" + "the engraving is the right poem" PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Journey.tsx src/styles/screens.css
git commit -m "Treasures: loved moments receive their engraving"
```

### Task 4: The tanzaku scroll

**Files:**
- Create: `src/components/TanzakuScroll.tsx`
- Modify: `src/screens/Journey.tsx` (`Treasures`: unroll button + overlay state)
- Modify: `src/styles/screens.css` (append)

**Interfaces:**
- Consumes: `haiku` (Task 2), `MomentMap` shape `Record<string, Moment>`.
- Produces: `TanzakuScroll({ moments, onClose })`; selectors `.tanzaku`, `.tz-poem`, `.tz-mark`, `.tz-close`, `.scroll-btn`.

- [ ] **Step 1: Create `src/components/TanzakuScroll.tsx`**

```tsx
import { itinerary } from '../data/itinerary'
import { haiku } from '../data/haiku'
import type { Moment } from '../lib/sync'

/** The flight-home payoff: every loved poem unrolled on one washi strip. */
export function TanzakuScroll({
  moments,
  onClose,
}: {
  moments: Record<string, Moment>
  onClose: () => void
}) {
  const loved = itinerary.flatMap((day) =>
    day.activities
      .map((act, i) => ({ day, act, key: `d${day.id}:${i}` }))
      .filter(({ key }) => moments[key] === 'loved' && haiku[key])
  )

  return (
    <div className="tanzaku" role="dialog" aria-label="The tanzaku scroll">
      <div className="tz-strip">
        <div className="tz-head">
          <span className="jp">短冊</span>
          <h2>The trip, written as poetry</h2>
        </div>
        {loved.map(({ day, act, key }) => (
          <div key={key} className="tz-poem">
            <div className="tz-mark">
              Day {day.id} · {day.city} — {act.title}
            </div>
            {haiku[key].split('\n').map((line, li) => (
              <div key={li} className="tz-line">
                {line}
              </div>
            ))}
          </div>
        ))}
        <div className="tz-seal" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle cx="20" cy="20" r="18" fill="var(--vermillion)" opacity="0.9" />
            <text x="20" y="26" textAnchor="middle" fontSize="15" fill="var(--paper)">
              旅
            </text>
          </svg>
        </div>
      </div>
      <button className="tz-close" onClick={onClose}>
        Roll it up
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `Treasures`** — add `unrolled` state, the header button, and the overlay:

```tsx
import { TanzakuScroll } from '../components/TanzakuScroll'
// inside Treasures:
const [unrolled, setUnrolled] = useState(false)
// in the section-title div, after the .jp span:
<button className="scroll-btn" onClick={() => setUnrolled(true)}>
  短冊 · unroll
</button>
// after the closing </div> of the card, before the fragment closes:
{unrolled && <TanzakuScroll moments={moments} onClose={() => setUnrolled(false)} />}
```

- [ ] **Step 3: Append CSS to screens.css**

```css
.section-title .scroll-btn {
  margin-left: auto;
  border: 1px solid var(--hairline);
  background: var(--card);
  color: var(--ink-soft);
  border-radius: var(--radius);
  padding: 4px 10px;
  font-size: 12px;
}
.tanzaku {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: var(--paper);
  overflow-y: auto;
  padding: 24px 16px 104px;
  animation: tz-unroll 600ms var(--ease-out);
}
@keyframes tz-unroll {
  from { transform: translateY(10%); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tanzaku { animation: none; }
}
.tz-strip {
  max-width: 340px;
  margin: 0 auto;
  background: var(--card);
  border-left: 1px solid var(--hairline);
  border-right: 1px solid var(--hairline);
  padding: 28px 22px 32px;
}
.tz-head .jp { color: var(--ink-faint); letter-spacing: 0.2em; }
.tz-head h2 { font-family: var(--font-display); font-size: 20px; margin: 4px 0 8px; }
.tz-poem { margin: 22px 0; }
.tz-mark {
  font-size: 11px;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.tz-line {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--ink);
}
.tz-seal { display: flex; justify-content: center; margin-top: 28px; }
.tz-close {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid var(--hairline);
  background: var(--card);
  color: var(--ink);
  border-radius: var(--radius-lg);
  padding: 10px 22px;
  box-shadow: var(--shadow-lift);
}
```

- [ ] **Step 4: Verify green** — `npm run build && npm run check`: **89/89**.

- [ ] **Step 5: Commit**

```bash
git add src/components/TanzakuScroll.tsx src/screens/Journey.tsx src/styles/screens.css
git commit -m "Tanzaku scroll: the trip written as poetry"
```

### Task 5: Ledger, decisions, docs, visual pass

**Files:**
- Modify: `ROADMAP.md` (Part II Haiku Engraver line → ✅ note; Part IV v3 shipped contents)
- Modify: `IMPLEMENTATION_PLAN.md` (plan index rows for both new plans; status line; invariant change note dated 2026-07-10)
- Modify: `DECISIONS.md` (entries #16 and #17 — see below)
- Modify: `README.md` (feature blurb)
- Modify: `SESSION_NOTES.md` (session entry)

- [ ] **Step 1: DECISIONS.md — append two entries**

| # | Date | Decision | Why |
|---|------|----------|-----|
| 16 | 2026-07-10 | Haiku Engraver content is **authored in-session by the model and committed as data** (`src/data/haiku.ts`) — supersedes #14's CI-pre-bake mechanism; the no-runtime-AI principle stands | Strictly less machinery than CI generation: no key in GitHub secrets, no per-build cost, and the diff is the review; suite enforces 74/74 coverage |
| 17 | 2026-07-10 | Runtime-AI key architecture (**resolves #14's deferral**): bring-your-own Anthropic key pasted on-device (`tabi:claude-key`, localStorage, never in `collectState()`), direct browser calls via the supported CORS header; decoder model `claude-opus-4-8` | Owner decision. No backend to build or babysit mid-trip; the key is bounded by a spend-capped workspace and revocable in Console; #11 precedent for never-synced device secrets |

- [ ] **Step 2: Update ROADMAP** — Part II: mark "Haiku Engraver" ✅ with "*(pre-authored, offline)*"; Part IV v3 row: add "Haiku Engraver (74 pre-authored poems + tanzaku scroll)" to Shipped.

- [ ] **Step 3: Update IMPLEMENTATION_PLAN.md** — index rows for `2026-07-10-haiku-engraver.md` (✅ when merged) and `2026-07-10-sign-decoder.md` (**planned, build deferred — owner says go**); add invariant change: "2026-07-10 — #14 resolved: runtime network permitted for the decoder feature when built (BYO on-device key, DECISIONS.md #17); everything else remains offline."

- [ ] **Step 4: README blurb + SESSION_NOTES entry; visual pass** — `SHOT_DIR=docs/screens npm run check` style screenshots at day + lantern; look at the render (field note 1).

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "Ledger + decisions: haiku engraver ships, decoder planned"
git push -u origin claude/haiku-engraver
```
