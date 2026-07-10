# Fuji Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A painted Tōkaidō scroll on Day 7 that tracks the train by GPS and calls the Mount Fuji moment ("Fuji on the right in N minutes" → "LOOK RIGHT" + bloom).

**Architecture:** Pure geometry in `src/lib/tokaido.ts` (stations, polyline projection, Fuji zone, status machine); one component `src/components/FujiWindow.tsx` (strip SVG, GPS watch begun by tap, `?ride=` override); CSS in the new fuji-window section of screens.css. Flag `fujiWindow: true` on itinerary day 7.

**Tech Stack:** React 18 + TS, Geolocation API, inline SVG on `--art-*` tokens, Playwright story suite (`setGeolocation` drives the real path).

**Spec:** `docs/superpowers/specs/2026-07-10-fuji-window-design.md`

## Global Constraints

- Offline, no new dependencies, no image assets; all colors via existing CSS custom properties.
- GPS permission may only be requested from the begin-button tap. Denied/no GPS → static painted card, never an error.
- `prefers-reduced-motion: reduce` ⇒ no bloom/pan animation; states still update (text is not motion).
- Branch `claude/fuji-window` is stacked on `claude/living-vignettes` — merges after it.
- Verify: `npm run build` then `npm run check`.

---

### Task 1: Red story checks (section 9 of tests/story.mjs)

Class/name contract locked here: `.fuji-window` (card, gains `.fw-bloom` in the zone), `.fw-begin` (button), `.fw-status` (status line). `?ride=<0..1>` forces the position.

- [ ] Add before `} finally {`:

```js
  /* ---- 9. Fuji Window: the Tōkaidō scroll keeps the appointment ---- */
  await page.goto(`${BASE}/#journey/6`)
  await page.waitForTimeout(400)
  check('no fuji window on other days', (await page.locator('.fuji-window').count()) === 0)
  await page.goto(`${BASE}/#journey/7`)
  await page.waitForTimeout(500)
  check('fuji window card on the bullet-train day', (await page.locator('.fuji-window').count()) === 1)
  check('the watch awaits a tap', (await page.locator('.fw-begin').count()) === 1)
  await page.goto(`${BASE}/?ride=0.15#journey/7`)
  await page.waitForTimeout(500)
  check('countdown before the window', ((await page.textContent('.fw-status')) ?? '').includes('Fuji on the right in'))
  await page.goto(`${BASE}/?ride=0.28#journey/7`)
  await page.waitForTimeout(500)
  check('LOOK RIGHT inside the window', ((await page.textContent('.fw-status')) ?? '').includes('LOOK RIGHT'))
  check('fuji blooms', (await page.locator('.fuji-window.fw-bloom').count()) === 1)
  await page.goto(`${BASE}/?ride=0.6#journey/7`)
  await page.waitForTimeout(500)
  check('fuji behind you', ((await page.textContent('.fw-status')) ?? '').includes('behind you'))

  // the real GPS path: grant geolocation, ride Shin-Yokohama → Shin-Fuji
  const gpsCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    geolocation: { latitude: 35.507, longitude: 139.617 },
    permissions: ['geolocation'],
  })
  const gpsPage = await gpsCtx.newPage()
  await gpsPage.goto(`${BASE}/#journey/7`)
  await gpsPage.waitForTimeout(500)
  await gpsPage.locator('.fw-begin').click()
  await gpsPage.waitForTimeout(800)
  const early = (await gpsPage.textContent('.fw-status')) ?? ''
  check('gps fix places the train early on the scroll', early.includes('Rolling') || early.includes('Fuji on the right'), early)
  await gpsCtx.setGeolocation({ latitude: 35.142, longitude: 138.663 })
  await gpsPage.waitForTimeout(1200)
  check('gps ride reaches LOOK RIGHT', ((await gpsPage.textContent('.fw-status')) ?? '').includes('LOOK RIGHT'))
  await gpsCtx.close()
```

- [ ] `npm run build; npm run check` → existing 51 PASS, section 9 fails (first locator returns 0 / times out on `.fw-status`). Commit "Story suite: Fuji Window checks (red)".

---

### Task 2: Geometry — `src/lib/tokaido.ts` + itinerary flag

`Day` gains `fujiWindow?: boolean`; day 7 object gets `fujiWindow: true,` after `stay:`.

Complete file:

```ts
/**
 * The Tōkaidō line as geometry: sixteen stations Tokyo→Kyoto, cumulative
 * kilometres by haversine, nearest-segment projection of a GPS fix onto the
 * polyline, and the Fuji viewing window (the train passes ~20 km south of
 * the summit around Shin-Fuji; Fuji rides on the RIGHT heading west).
 * Distances are internally consistent, not official rail km.
 */

export type Fix = { lat: number; lon: number }

const R = 6371
const toRad = (d: number) => (d * Math.PI) / 180

export function haversineKm(a: Fix, b: Fix): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export interface Station { name: string; jp: string; lat: number; lon: number; major?: boolean }

export const STATIONS: Station[] = [
  { name: 'Tokyo', jp: '東京', lat: 35.681, lon: 139.767, major: true },
  { name: 'Shinagawa', jp: '品川', lat: 35.629, lon: 139.739 },
  { name: 'Shin-Yokohama', jp: '新横浜', lat: 35.507, lon: 139.617 },
  { name: 'Odawara', jp: '小田原', lat: 35.256, lon: 139.155, major: true },
  { name: 'Atami', jp: '熱海', lat: 35.104, lon: 139.078 },
  { name: 'Mishima', jp: '三島', lat: 35.126, lon: 138.911 },
  { name: 'Shin-Fuji', jp: '新富士', lat: 35.142, lon: 138.663, major: true },
  { name: 'Shizuoka', jp: '静岡', lat: 34.972, lon: 138.389 },
  { name: 'Kakegawa', jp: '掛川', lat: 34.769, lon: 138.014 },
  { name: 'Hamamatsu', jp: '浜松', lat: 34.704, lon: 137.735, major: true },
  { name: 'Toyohashi', jp: '豊橋', lat: 34.763, lon: 137.382 },
  { name: 'Mikawa-Anjō', jp: '三河安城', lat: 34.969, lon: 137.061 },
  { name: 'Nagoya', jp: '名古屋', lat: 35.17, lon: 136.882, major: true },
  { name: 'Gifu-Hashima', jp: '岐阜羽島', lat: 35.316, lon: 136.686 },
  { name: 'Maibara', jp: '米原', lat: 35.314, lon: 136.29 },
  { name: 'Kyoto', jp: '京都', lat: 34.985, lon: 135.758, major: true },
]

export const CUM_KM: number[] = STATIONS.reduce<number[]>((acc, st, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + haversineKm(STATIONS[i - 1], st))
  return acc
}, [])

export const ROUTE_KM = CUM_KM[CUM_KM.length - 1]

/** Nearest point on the station polyline: km along the route, fraction, and
 *  perpendicular offset (flat-earth per segment — fine at these scales). */
export function project(fix: Fix): { km: number; s: number; offKm: number } {
  let best = { km: 0, offKm: Infinity }
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const a = STATIONS[i]
    const b = STATIONS[i + 1]
    const k = Math.cos(toRad((a.lat + b.lat) / 2))
    const ax = a.lon * k
    const ay = a.lat
    const dx = b.lon * k - ax
    const dy = b.lat - ay
    const len2 = dx * dx + dy * dy
    let t = len2 === 0 ? 0 : ((fix.lon * k - ax) * dx + (fix.lat - ay) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const off = haversineKm(fix, { lat: ay + t * dy, lon: (ax + t * dx) / k })
    if (off < best.offKm) best = { km: CUM_KM[i] + t * (CUM_KM[i + 1] - CUM_KM[i]), offKm: off }
  }
  return { km: best.km, s: best.km / ROUTE_KM, offKm: best.offKm }
}

const iMishima = STATIONS.findIndex((st) => st.name === 'Mishima')
const iShinFuji = STATIONS.findIndex((st) => st.name === 'Shin-Fuji')
export const FUJI_ZONE = { startKm: CUM_KM[iMishima], endKm: CUM_KM[iShinFuji] + 20 }

export type RideStatus =
  | { kind: 'rolling' }
  | { kind: 'soon'; minutes: number }
  | { kind: 'look' }
  | { kind: 'past' }
  | { kind: 'kyoto' }
  | { kind: 'tunnel' }

export function statusFor(km: number, speedKmh: number, staleSec: number): RideStatus {
  if (staleSec > 25) return { kind: 'tunnel' }
  if (km < FUJI_ZONE.startKm) {
    const eta = ((FUJI_ZONE.startKm - km) / Math.max(speedKmh, 60)) * 60
    return eta <= 20 ? { kind: 'soon', minutes: Math.max(1, Math.ceil(eta)) } : { kind: 'rolling' }
  }
  if (km <= FUJI_ZONE.endKm) return { kind: 'look' }
  if (km / ROUTE_KM > 0.93) return { kind: 'kyoto' }
  return { kind: 'past' }
}
```

- [ ] Build green; commit "Tōkaidō geometry: stations, projection, the Fuji window".

---

### Task 3: The card — `src/components/FujiWindow.tsx`, wiring, CSS

**Component contract:** root `<section className={fuji-window card${bloom}}>`; `.fw-status` always present; `.fw-begin` button rendered until watching or `?ride` forces; strip pans via inline transform on `.fw-strip`; speed chip `.fw-speed` shown when a real speed exists. GPS: `watchPosition` from the tap; error → back to un-watching (painting stays); `clearWatch` + interval cleanup on unmount; staleness re-render every 5 s drives the tunnel state. Status lines:

- rolling: `Rolling southwest — the scroll unrolls`
- soon: `Fuji on the right in ~N min — window seats ready`
- look: `いまだ — LOOK RIGHT. Mount Fuji.`
- past: `Fuji is behind you — tea fields, then Nagoya`
- kyoto: `The old capital approaches — gather the bags`
- tunnel: `In the mountains — tunnels eat the signal; the scroll waits`
- no fix yet: `Board, then begin the watch — the scroll knows the way`

**Strip art (inline SVG, viewBox `0 0 1560 120`):** landmark x-positions from `kmToX = km/ROUTE_KM*1560` — Tokyo skyline at 0–90, Odawara castle glyph ~kmToX(Odawara), **Fuji** centered ~kmToX(128) spanning ±90 px with `.fw-fuji` group + wash layers `.fw-wash` (mountain, snowcap, halo), Fuji-zone band `.fw-zone` from kmToX(startKm)→kmToX(endKm), tea rows, Lake Hamana water band ~kmToX(Hamamatsu), Nagoya castle glyph, Kyoto pagoda at right edge; major-station ticks + names along the baseline from STATIONS/CUM_KM; hanko-red train dot `.fw-train` at kmToX(km). All fills/strokes existing tokens (`--art-mtn-near`, `--art-snow`, `--art-water`, `--vermillion`, `--art-lantern`, `--art-silhouette`, `--ink-faint`).

**Wiring:** `DayDetail` renders `{day.fujiWindow && <FujiWindow />}` directly under the vignette card. Import at top of Journey.tsx.

**CSS (screens.css, new section):** card padding, `.fw-viewport { overflow: hidden }`, `.fw-strip { transition: transform 1.8s ease-out }`, status typography (display font for the look state), begin-button matching existing button idiom, bloom keyframes (washes fade/scale in sequence, `forwards`), zone band soft glow at night via `data-phase`, and a reduced-motion block: strip transition none + wash animation none with final opacity.

- [ ] Build green → `npm run check` → **all green (51 + 10 new = 61)**. If the two GPS checks flake on timing, bump the post-click wait to 1200 ms before touching anything else.
- [ ] Commit "Fuji Window: the scroll keeps the appointment".

---

### Task 4: Look at it, ledger, README, push

- [ ] Preview at 390×844: `?ride=0.15`, `0.28` (bloom), `0.6`, plus night (`?clock=00:30&ride=0.28`). Fix what reads wrong; re-run check.
- [ ] ROADMAP v3 row: move Fuji Window to Shipped. README: add a design bullet (GPS scroll, LOOK RIGHT moment, offline).
- [ ] Final `npm run build; npm run check` green, tree clean, `git push -u origin claude/fuji-window`. No PR, no merge — owner reviews; merges after living-vignettes.

## Self-review

Spec coverage: geometry/projection/zone (T2), card+GPS+ride override+statuses+strip art (T3), tests incl. real-GPS path (T1), ledger/docs (T4). Names consistent: `.fuji-window`, `.fw-begin`, `.fw-status`, `.fw-bloom`, `.fw-strip`, `.fw-train`, `.fw-zone`, `.fw-wash`, `statusFor`, `project`, `FUJI_ZONE`, `ROUTE_KM`, `CUM_KM`. Test fractions verified against computed km (0.15→~66 km, soon; 0.28→~124 km, look; 0.6→~266 km, past). No placeholders.
