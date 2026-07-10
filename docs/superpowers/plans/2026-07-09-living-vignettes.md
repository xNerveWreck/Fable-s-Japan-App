# Living Vignettes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The six city paintings on the day screens gain tilt-parallax depth planes, ambient motion, timed visitors, and after-dark details — all CSS-driven, phase-aware, reduced-motion-safe.

**Architecture:** Vignette SVGs regroup into named depth planes (`vg-far/mid/near`); one new hook (`useTilt`) writes damped `--vg-x/--vg-y` custom properties (iOS permission from first tap, `tabi:tilt` persisted); every motion is a CSS keyframe in screens.css, phase-gated via existing `:root[data-phase]`, with a `data-vg='now'` root attribute (from `?vg=now` or demo mode) that jumps timed visitors mid-action for tests/demos.

**Tech Stack:** React 18 + TS + Vite, inline SVG, CSS custom properties/keyframes, Playwright story suite (`tests/story.mjs`).

**Spec:** `docs/superpowers/specs/2026-07-09-living-vignettes-design.md`

## Global Constraints

- Offline, no new dependencies, no image assets — inline SVG on `--art-*` tokens only.
- All colors via existing CSS custom properties; NEVER hardcode a color (semantic tokens per role).
- `prefers-reduced-motion: reduce` ⇒ paintings fully still (JS early-return like `src/lib/ink.ts:3` + one CSS block).
- Never CSS-animate an SVG group that carries an attribute `transform` (CSS overrides and destroys it) — wrap an inner group instead.
- Day→city: 1–5 Tokyo, 6 Hakone, 7–10 Kyoto, 11 Nara, 12–13 Osaka, 14 Home.
- localStorage keys are `tabi:*` with JSON values.
- Verify with `npm run build` then `npm run check` (build first — check serves `dist/`).

---

### Task 1: Story-suite checks (write failing first)

**Files:**
- Modify: `tests/story.mjs` (insert a new section 8 before the `} finally {` line, after the demo-mode section 7)

**Interfaces:**
- Consumes: existing helpers `check()`, `jstTimeAtAltitude()`, `BASE`, `browser`, `page`, `ctx`.
- Produces: the acceptance gate for Tasks 2–5. Class names it locks in: `.vg-far`, `.vg-mid`, `.vg-near`, `.vg-heron`, `.vg-gondola`, `.vg-neon`; animation names `vg-heron-fly`, `vg-gondola-run`, `vg-drift-*`, `vg-neon-*`; container attr `data-tilt='on'`; URL param `?vg=now`.

- [ ] **Step 1: Add the checks**

```js
  /* ---- 8. Living vignettes: the paintings breathe ---- */
  await page.goto(`${BASE}/?vg=now#journey/7`) // Kyoto
  await page.waitForTimeout(600)
  check(
    'kyoto painting has depth planes',
    (await page.locator('.vignette .vg-far').count()) === 1 &&
      (await page.locator('.vignette .vg-mid').count()) === 1 &&
      (await page.locator('.vignette .vg-near').count()) === 1
  )
  const heron = await page.locator('.vg-heron').evaluate((el) => getComputedStyle(el).animationName)
  check('the heron crosses the kyoto sky', heron.includes('vg-heron'), heron)
  const drift = await page.locator('.vignette .vg-near').evaluate((el) => getComputedStyle(el).animationName)
  check('planes drift when no tilt sensor', drift.includes('vg-drift'), drift)

  // synthetic tilt readings wake the parallax (Chromium has no real sensor)
  await page.evaluate(() => {
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 45, gamma: 0 }))
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 45, gamma: 12 }))
  })
  await page.waitForTimeout(200)
  check('tilt readings wake the parallax', (await page.locator('.vignette[data-tilt="on"]').count()) === 1)

  await page.goto(`${BASE}/?vg=now#journey/6`) // Hakone
  await page.waitForTimeout(500)
  const gondola = await page.locator('.vg-gondola').evaluate((el) => getComputedStyle(el).animationName)
  check('the gondola inches along its cable', gondola.includes('vg-gondola'), gondola)

  const lanternClock = jstTimeAtAltitude(-7, false)
  await page.goto(`${BASE}/?clock=${lanternClock}&vg=now#journey/12`) // Osaka at lantern hour
  await page.waitForTimeout(600)
  const neonNight = await page.locator('.vg-neon').first().evaluate((el) => getComputedStyle(el).animationName)
  check('osaka neon flickers after sunset', neonNight.includes('vg-neon'), neonNight)
  await page.goto(`${BASE}/?clock=12:00#journey/12`)
  await page.waitForTimeout(500)
  const neonDay = await page.locator('.vg-neon').first().evaluate((el) => getComputedStyle(el).animationName)
  check('osaka neon rests at noon', neonDay === 'none', neonDay)

  // reduce-motion: the painting holds perfectly still
  const rmCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  })
  const rmPage = await rmCtx.newPage()
  await rmPage.goto(`${BASE}/?vg=now#journey/7`)
  await rmPage.waitForTimeout(600)
  const rmHeron = await rmPage.locator('.vg-heron').evaluate((el) => getComputedStyle(el).animationName)
  const rmPlane = await rmPage.locator('.vignette .vg-near').evaluate((el) => getComputedStyle(el).animationName)
  check('reduce-motion stills the painting', rmHeron === 'none' && rmPlane === 'none', `${rmHeron} / ${rmPlane}`)
  await rmCtx.close()
```

- [ ] **Step 2: Run to verify the new checks fail**

Run: `npm run build; npm run check`
Expected: the 42 existing checks PASS; every new section-8 check FAILs (locators find nothing / animation names are `none`). If an existing check breaks, stop — something else is wrong.

- [ ] **Step 3: Commit**

```bash
git add tests/story.mjs
git commit -m "Story suite: living-vignette checks (red)"
```

---

### Task 2: `?vg=now` root attribute (demo/test hook)

**Files:**
- Modify: `src/main.tsx:5-14` (inside the existing demo `try` block)

**Interfaces:**
- Produces: `document.documentElement.dataset.vg === 'now'` when `?vg=now` or `?demo=1`; CSS in Task 5 keys `:root[data-vg='now']`.

- [ ] **Step 1: Extend the demo block**

Replace the body of the first `try` with:

```ts
  const params = new URLSearchParams(location.search)
  // ?vg=now (and demo mode) drop the visitors' long waits — the heron is
  // already mid-flight for screenshots, demos, and the story suite
  if (params.get('demo') === '1' || params.get('vg') === 'now') {
    document.documentElement.dataset.vg = 'now'
  }
  if (params.get('demo') === '1') {
    seedDemo()
    const clock = params.get('clock')
    history.replaceState(null, '', location.pathname + (clock ? `?clock=${clock}` : '') + location.hash)
  }
```

(The attribute is set before `replaceState` strips the param, so it survives.)

- [ ] **Step 2: Verify**

Run: `npm run build` → PASS. (Story checks still red — CSS lands in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "Demo/test hook: ?vg=now seeds visitors mid-scene"
```

---

### Task 3: `useTilt` hook + Journey wiring

**Files:**
- Create: `src/hooks/useTilt.ts`
- Modify: `src/screens/Journey.tsx:422-424` (the `.vignette` container) + imports at top

**Interfaces:**
- Produces: `useTilt<T extends HTMLElement>(): { ref: RefObject<T>; arm: () => void }`. Writes `--vg-x`/`--vg-y` ∈ [-1,1] and `data-tilt='on'` on the ref'd element. Persists `tabi:tilt` = `"granted" | "denied"` (JSON strings).

- [ ] **Step 1: Write the hook**

```ts
import { useEffect, useRef } from 'react'

const KEY = 'tabi:tilt'

type DOEC = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Tilt-parallax for the vignette paintings. Writes damped --vg-x/--vg-y
 * onto the container and flips data-tilt='on' once real readings arrive,
 * which switches the CSS planes from autonomous drift to sensor-driven.
 * iOS only summons its motion-permission popup from a tap — arm() is that
 * tap handler; a remembered grant re-arms silently on mount. Denied, no
 * sensor, or reduced motion all fall back to the CSS drift (or stillness).
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const detach = useRef<(() => void) | null>(null)

  const attach = () => {
    const el = ref.current
    if (!el || detach.current) return
    let base: { b: number; g: number } | null = null
    let x = 0
    let y = 0
    const onTurn = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null || !ref.current) return
      if (!base) {
        base = { b: e.beta, g: e.gamma } // however the phone is held is neutral
        ref.current.dataset.tilt = 'on'
      }
      const tx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 18))
      const ty = Math.max(-1, Math.min(1, (e.beta - base.b) / 18))
      x += (tx - x) * 0.12 // heavy paper, not a game
      y += (ty - y) * 0.12
      ref.current.style.setProperty('--vg-x', x.toFixed(3))
      ref.current.style.setProperty('--vg-y', y.toFixed(3))
    }
    window.addEventListener('deviceorientation', onTurn)
    detach.current = () => window.removeEventListener('deviceorientation', onTurn)
  }

  const arm = () => {
    if (detach.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof DeviceOrientationEvent === 'undefined') return
    const req = (DeviceOrientationEvent as DOEC).requestPermission
    if (typeof req === 'function') {
      req()
        .then((r) => {
          localStorage.setItem(KEY, JSON.stringify(r))
          if (r === 'granted') attach()
        })
        .catch(() => {
          /* stays on drift — quiet by default */
        })
    } else {
      attach()
    }
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof DeviceOrientationEvent === 'undefined') return
    const req = (DeviceOrientationEvent as DOEC).requestPermission
    if (typeof req !== 'function') {
      attach() // Android/desktop: listening is free; data-tilt flips only on real readings
    } else if (localStorage.getItem(KEY) === '"granted"') {
      req()
        .then((r) => r === 'granted' && attach())
        .catch(() => {})
    }
    return () => {
      detach.current?.()
      detach.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, arm }
}
```

- [ ] **Step 2: Wire into Journey**

In `src/screens/Journey.tsx`, add `import { useTilt } from '../hooks/useTilt'`; inside the day-detail component (the one rendering `.vignette card`), add `const { ref: tiltRef, arm: armTilt } = useTilt<HTMLDivElement>()`, then:

```tsx
      <div className="vignette card" ref={tiltRef} onClick={armTilt}>
        <CityVignette city={day.city} />
      </div>
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build` → PASS.

```bash
git add src/hooks/useTilt.ts src/screens/Journey.tsx
git commit -m "useTilt: sensor-driven parallax vars, iOS permission from first tap"
```

---

### Task 4: Regroup the six scenes into depth planes + new inhabitants

**Files:**
- Modify: `src/art/Vignettes.tsx` (all six scene components)

**Interfaces:**
- Consumes: nothing new.
- Produces: per scene, exactly one each of `<g className="vg-far">`, `<g className="vg-mid">`, `<g className="vg-near">` (sky rect + sun stay outside the planes, first in paint order). Inhabitant groups: `vg-birds`, `vg-win` (×5 rects), `vg-mist`, `vg-ship`, `vg-gondola` (inside new `vg-ropeway`), `vg-heron` (+inner `vg-heron-flap`), `vg-blossom`, `vg-deer-head`, `vg-flame`, `vg-grass`, `vg-neon` (×3 circles), `vg-blink` (×2 eyes), `vg-claw` (right claw), `vg-clouds`, `vg-waves`, `vg-plane-ride` (inner wrapper — the outer plane group KEEPS its attribute transform).

**Plane assignment map (existing elements → plane):**

| Scene | vg-far | vg-mid | vg-near | stays in sky |
|---|---|---|---|---|
| Tokyo | far-skyline `<g opacity=0.6>` | near-skyline `<g>` + lit-windows `<g>` | Tokyo Tower (both `<g>` + cap path) | sun, birds (`vg-birds` on the two stroke paths' `<g>`) |
| Hakone | Fuji + snowcap + `vg-ropeway` (new) | mist rect (`vg-mist`) + lake + wave strokes + torii + torii shadow | pirate ship `<g>` (`vg-ship`) | — |
| Kyoto | gates idx 3–5 (three smallest) | gates idx 1–2 | gate idx 0 + path | blossoms (`vg-blossom` wrapping both ellipses), heron |
| Nara | ground path | deer (all groups: body, antlers, spots) with head/neck/antlers/ear wrapped as inner `vg-deer-head`; grass (`vg-grass`) | stone lantern `<g>` + light rect (`vg-flame`) | sun |
| Osaka | castle `<g>` | neon circles (each `className="vg-neon"`) | crab `<g>` (eyes get `vg-blink`, right-claw parts wrapped as `vg-claw`) | — |
| Home | clouds (`vg-clouds` wrapping both ellipses) | sea rect + wave strokes (`vg-waves`) + contrail | plane outer `<g transform=...>` with NEW inner `<g className="vg-plane-ride">` wrapping its children | sun |

Kyoto note: the gates are one `.map()` — split into two arrays or filter by index to place them in different planes; keep the exact same `translate/scale` per gate.
Nara note: `vg-deer-head` wraps the neck path (`M258 76 …`), the two head ellipses, the ear path, and the antlers `<g>` — one new group inside the deer.

- [ ] **Step 1: New art — Hakone ropeway (inside vg-far, after Fuji)**

```tsx
      {/* ropeway: cable up the sky, gondola inching along it */}
      <g className="vg-ropeway">
        <path d="M252 44 L388 14" stroke="var(--art-silhouette)" strokeWidth="1.2" opacity="0.5" fill="none" />
        <g className="vg-gondola">
          <path d="M262 42 v5" stroke="var(--art-silhouette)" strokeWidth="1.4" />
          <rect x="257" y="47" width="11" height="8" rx="2.5" fill="var(--art-silhouette)" />
          <rect x="259.5" y="49" width="2.5" height="3" fill="var(--art-lantern)" opacity="0.9" />
        </g>
      </g>
```

- [ ] **Step 2: New art — Kyoto heron (in the sky, before the planes so it flies behind the torii tops)**

```tsx
      {/* the heron: parked offscreen left; the CSS keyframe flies it across */}
      <g className="vg-heron">
        <g className="vg-heron-flap">
          <path d="M-40 24 Q-34 14 -26 12 Q-32 20 -38 26 Z" fill="var(--art-silhouette)" />
        </g>
        <path d="M-48 26 Q-38 23 -26 25 L-18 27 Q-30 30 -42 29 Q-47 28 -48 26 Z" fill="var(--art-silhouette)" />
        <path d="M-20 26 l7 1.5 -7 1.5 z" fill="var(--art-silhouette)" />
        <path d="M-48 27 L-56 31" stroke="var(--art-silhouette)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>
```

- [ ] **Step 3: Regroup all six scenes per the plane-assignment map**

Purely structural: wrap existing elements in the three plane `<g>`s with classes, add the inhabitant classes, change no path data and no tokens. Tokyo windows: give each of the five rects `className="vg-win"`. Osaka neon: move each circle's opacity from attribute to CSS (delete the `opacity` attributes — Task 5 owns neon opacity).

- [ ] **Step 4: Verify + commit**

Run: `npm run build` → PASS. Then `npm run check` → the depth-plane check goes green; animation checks still red (no CSS yet).

```bash
git add src/art/Vignettes.tsx
git commit -m "Vignettes: depth planes + heron and ropeway join the paintings"
```

---

### Task 5: The motion layer (CSS)

**Files:**
- Modify: `src/styles/screens.css` (extend the `/* ---------- vignettes ---------- */` section at :1150)

**Interfaces:**
- Consumes: `--vg-x/--vg-y` (Task 3), plane/inhabitant classes (Task 4), `:root[data-phase]`, `:root[data-vg='now']` (Task 2).
- Produces: animation names asserted by Task 1 (`vg-drift-*`, `vg-heron-fly`, `vg-gondola-run`, `vg-neon-flicker`).

- [ ] **Step 1: Append the motion layer**

```css
/* The paintings live: depth planes (tilt or drift), one ambient motion,
   one timed visitor, one after-dark detail per scene. All browser-native
   animation; reduced motion stills everything at the bottom. */

.vg-far, .vg-mid, .vg-near,
.vg-ship, .vg-mist, .vg-blossom, .vg-grass, .vg-deer-head, .vg-heron,
.vg-heron-flap, .vg-gondola, .vg-claw, .vg-blink, .vg-clouds, .vg-waves,
.vg-plane-ride, .vg-birds {
  transform-box: fill-box;
  transform-origin: center;
}

/* depth: baked scale hides the edges parallax would reveal */
.vignette:not([data-tilt='on']) .vg-far  { animation: vg-drift-far 44s ease-in-out infinite alternate; }
.vignette:not([data-tilt='on']) .vg-mid  { animation: vg-drift-mid 34s ease-in-out infinite alternate; }
.vignette:not([data-tilt='on']) .vg-near { animation: vg-drift-near 26s ease-in-out infinite alternate; }

@keyframes vg-drift-far  { from { transform: translateX(-2px) scale(1.04); } to { transform: translateX(2px)  scale(1.04); } }
@keyframes vg-drift-mid  { from { transform: translateX(3px)  scale(1.06); } to { transform: translateX(-3px) scale(1.06); } }
@keyframes vg-drift-near { from { transform: translateX(-4px) scale(1.08); } to { transform: translateX(4px)  scale(1.08); } }

.vignette[data-tilt='on'] .vg-far  { transform: translate(calc(var(--vg-x, 0) * -3px), calc(var(--vg-y, 0) * -1.5px)) scale(1.04); }
.vignette[data-tilt='on'] .vg-mid  { transform: translate(calc(var(--vg-x, 0) * 5px),  calc(var(--vg-y, 0) * 2.5px))  scale(1.06); }
.vignette[data-tilt='on'] .vg-near { transform: translate(calc(var(--vg-x, 0) * 9px),  calc(var(--vg-y, 0) * 4px))    scale(1.08); }

/* ambient — always on, slow and small */
.vg-birds   { animation: vg-birds-cross 76s linear infinite; }
.vg-ship    { animation: vg-bob 9s ease-in-out infinite alternate; }
.vg-mist    { animation: vg-mist-drift 47s ease-in-out infinite alternate; }
.vg-blossom { animation: vg-sway 13s ease-in-out infinite alternate; }
.vg-grass   { animation: vg-sway 6s ease-in-out infinite alternate; transform-origin: center bottom; }
.vg-blink   { animation: vg-blink 9s linear infinite; }
.vg-clouds  { animation: vg-mist-drift 53s ease-in-out infinite alternate; }
.vg-waves   { animation: vg-bob 11s ease-in-out infinite alternate; }
.vg-plane-ride { animation: vg-ride 12s ease-in-out infinite alternate; }

@keyframes vg-birds-cross {
  0%   { transform: translateX(-170px); opacity: 0; }
  6%   { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(240px); opacity: 0; }
}
@keyframes vg-bob        { from { transform: translateY(-1.5px) rotate(-0.6deg); } to { transform: translateY(1.5px) rotate(0.6deg); } }
@keyframes vg-mist-drift { from { transform: translateX(-14px); } to { transform: translateX(14px); } }
@keyframes vg-sway       { from { transform: rotate(-1.4deg); } to { transform: rotate(1.4deg); } }
@keyframes vg-blink      { 0%, 96.5%, 100% { transform: scaleY(1); } 98% { transform: scaleY(0.12); } }
@keyframes vg-ride       { from { transform: translateY(-2px) rotate(-0.5deg); } to { transform: translateY(2px) rotate(0.5deg); } }

/* timed visitors — long cycles, active only in the opening seconds,
   staggered starts so no two cities share a rhythm */
.vg-heron     { animation: vg-heron-fly 165s linear 20s infinite; }
.vg-heron-flap{ animation: vg-flap 0.9s ease-in-out infinite; transform-origin: center bottom; }
.vg-gondola   { animation: vg-gondola-run 150s linear 35s infinite; }
.vg-deer-head { animation: vg-bow 140s ease-in-out 60s infinite; transform-origin: left bottom; }
.vg-claw      { animation: vg-claw-wave 155s ease-in-out 50s infinite; transform-origin: left bottom; }

@keyframes vg-heron-fly {
  0%      { transform: translate(0, 6px); }
  6%      { transform: translate(255px, -6px); }
  12%     { transform: translate(500px, 2px); }
  12.01%, 100% { transform: translate(0, 6px); }
}
@keyframes vg-flap { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(-0.55); } }
@keyframes vg-gondola-run {
  0%      { transform: translate(0, 0); }
  16%     { transform: translate(122px, -27px); }
  16.01%, 100% { transform: translate(0, 0); }
}
@keyframes vg-bow {
  0%, 3%  { transform: rotate(0deg); }
  6%      { transform: rotate(15deg); }
  9%      { transform: rotate(13deg); }
  12%     { transform: rotate(0deg); }
  100%    { transform: rotate(0deg); }
}
@keyframes vg-claw-wave {
  0%, 2%  { transform: rotate(0deg); }
  4%      { transform: rotate(-14deg); }
  6%      { transform: rotate(-2deg); }
  8%      { transform: rotate(-14deg); }
  10%     { transform: rotate(0deg); }
  100%    { transform: rotate(0deg); }
}

/* after dark — gated on the solar clock, so the paintings keep Tokyo time */
.vg-neon { opacity: 0.16; }
:root[data-phase='lantern'] .vg-win,
:root[data-phase='night'] .vg-win { animation: vg-twinkle 6s ease-in-out infinite; }
.vg-win:nth-of-type(2) { animation-delay: -1.7s; }
.vg-win:nth-of-type(3) { animation-delay: -3.1s; }
.vg-win:nth-of-type(4) { animation-delay: -4.3s; }
.vg-win:nth-of-type(5) { animation-delay: -5.2s; }
:root[data-phase='lantern'] .vg-neon,
:root[data-phase='night'] .vg-neon { animation: vg-neon-flicker 7s linear infinite; }
:root[data-phase='lantern'] .vg-neon:nth-of-type(2),
:root[data-phase='night'] .vg-neon:nth-of-type(2) { animation-delay: -2.3s; }
:root[data-phase='lantern'] .vg-neon:nth-of-type(3),
:root[data-phase='night'] .vg-neon:nth-of-type(3) { animation-delay: -4.6s; }
:root[data-phase='lantern'] .vg-flame,
:root[data-phase='night'] .vg-flame { animation: vg-flame 1.8s linear infinite; }

@keyframes vg-twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
@keyframes vg-neon-flicker {
  0% { opacity: 0.16; } 3% { opacity: 0.75; } 4% { opacity: 0.3; } 6% { opacity: 0.8; }
  50% { opacity: 0.7; } 52% { opacity: 0.45; } 54% { opacity: 0.78; } 100% { opacity: 0.72; }
}
@keyframes vg-flame { 0%, 100% { opacity: 0.9; } 30% { opacity: 0.55; } 60% { opacity: 0.8; } 80% { opacity: 0.6; } }

/* demos, screenshots, and the story suite: visitors are already mid-scene */
:root[data-vg='now'] .vg-heron     { animation-delay: -8s; }
:root[data-vg='now'] .vg-gondola   { animation-delay: -10s; }
:root[data-vg='now'] .vg-deer-head { animation-delay: -6s; }
:root[data-vg='now'] .vg-claw      { animation-delay: -4s; }

/* accessibility: a still painting is still a painting */
@media (prefers-reduced-motion: reduce) {
  .vignette [class^='vg-'],
  .vignette [class*=' vg-'] {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Full verify**

Run: `npm run build; npm run check`
Expected: **all** checks green — the original 42 plus every section-8 check.

- [ ] **Step 3: Commit**

```bash
git add src/styles/screens.css
git commit -m "The paintings live: drift/tilt planes, visitors, after-dark details"
```

---

### Task 6: Look at the work (field note 1), ledger, docs, wrap-up

**Files:**
- Modify: `ROADMAP.md:384` (move "living vignettes" from Remaining to Shipped in the v3 row)
- Modify: `README.md` (the artwork paragraph — one sentence that the paintings now live)

- [ ] **Step 1: Art-direct the real render**

Serve `dist/` and open day 7 (Kyoto), 6 (Hakone), 11 (Nara), 12 (Osaka), 2 (Tokyo), 14 (Home) at 390×844 with `?vg=now`, each at `?clock=` noon AND the lantern hour. Look: does the heron read as a heron mid-flight? Does the bow look like a bow, not a glitch? Do plane edges stay hidden while drifting? Fix what looks wrong (amplitudes/durations in CSS, art geometry in Vignettes.tsx), re-run `npm run check`, screenshot each city for the report.

- [ ] **Step 2: Ledger + README**

ROADMAP v3 row: move living vignettes into **Shipped**. README artwork paragraph: append one sentence (e.g. "Since v3.1 the paintings live: depth planes tilt with the phone (or drift on their own), a heron crosses Kyoto every few minutes, and Osaka's neon flickers on after sunset — all CSS, all still offline.")

- [ ] **Step 3: Final green + push**

Run: `npm run build; npm run check` → all green. `git status` → clean after:

```bash
git add ROADMAP.md README.md
git commit -m "Ledger + README: living vignettes shipped"
git push -u origin claude/living-vignettes
```

No PR, no merge — the owner reviews and merges (house rule).

---

## Self-review notes

- Spec coverage: depth planes/tilt (T3+T5), permission dance + `tabi:tilt` (T3), drift fallback (T5), all six cities' inhabitants (T4+T5), phase gating (T5), reduced motion (T3+T5), `?vg=now` (T2), story checks (T1), ledger/README (T6). Nara flame + Tokyo windows are after-dark details beyond the two the tests assert — tests assert the representative pair (Osaka neon + reduced motion) to keep the suite lean; the rest is covered by the field-note-1 visual pass.
- Type consistency: `useTilt` returns `{ ref, arm }` — consumed exactly so in T3 step 2. Class/animation names in T1 match T4/T5.
- No placeholders; all code complete.
