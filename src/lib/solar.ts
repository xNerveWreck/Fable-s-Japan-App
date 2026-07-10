/**
 * 日時計 — the solar palette clock.
 *
 * The painting follows Japan's sun, computed on-device: the current trip
 * city's sky during the trip, Tokyo's before and after. Five key moods —
 * night, asayake dawn, washi day, yūyake dusk, and the lantern hour —
 * interpolate continuously by real sun altitude, so the app never "switches
 * to dark mode"; the light just leaves, the way it does outside.
 *
 * Preview any moment with `?clock=HH:MM` (JST) — e.g. `?clock=05:10` for
 * dawn, `?clock=19:05` for the lantern hour.
 */

import { itinerary, TRIP_LENGTH } from '../data/itinerary'
import { daysBetween, jstToday } from './dates'

const RAD = Math.PI / 180

/** Sun altitude in degrees at an instant, for a lat/lon. Low-precision
 *  astronomy (±0.5° / a few minutes) — plenty for a palette. */
export function sunAltitude(at: Date, lat: number, lon: number): number {
  const d = (at.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000 // days since J2000
  const L = (280.46 + 0.9856474 * d) % 360 // mean longitude
  const g = ((357.528 + 0.9856003 * d) % 360) * RAD // mean anomaly
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD // ecliptic longitude
  const epsilon = 23.439 * RAD
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda))
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda))
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24 // sidereal time, hours
  const hourAngle = (gmst * 15 + lon) * RAD - ra
  const latR = lat * RAD
  const alt =
    Math.asin(Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(hourAngle)) / RAD
  return alt
}

/* ---------- where the sun is looked up from ---------- */

const CITY_COORDS: Record<string, [lat: number, lon: number]> = {
  Tokyo: [35.68, 139.77],
  Hakone: [35.19, 139.03],
  Kyoto: [35.01, 135.77],
  Nara: [34.69, 135.8],
  Osaka: [34.69, 135.5],
}

function currentCoords(): [number, number] {
  try {
    const raw = localStorage.getItem('tabi:departure')
    const departure = raw ? (JSON.parse(raw) as string) : ''
    if (departure) {
      const tripDay = daysBetween(departure, jstToday()) + 1
      if (tripDay >= 1 && tripDay <= TRIP_LENGTH) {
        const city = itinerary[tripDay - 1].city
        if (CITY_COORDS[city]) return CITY_COORDS[city]
      }
    }
  } catch {
    /* storage unavailable — Tokyo carries the sky */
  }
  return CITY_COORDS.Tokyo
}

/* ---------- the five key palettes ---------- */

type Rgba = [number, number, number, number]
type Palette = Record<string, Rgba>

function hex(h: string, a = 1): Rgba {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), a]
}

/** washi noon — matches the :root day theme in global.css */
const DAY: Palette = {
  paper: hex('#f6f1e7'),
  'paper-deep': hex('#efe8d9'),
  card: hex('#fdfaf3'),
  ink: hex('#262331'),
  'ink-soft': hex('#6b6577'),
  'ink-faint': hex('#a49dae'),
  hairline: hex('#262331', 0.12),
  sakura: hex('#d9536f'),
  'sakura-soft': hex('#f2c7d0'),
  'sakura-wash': hex('#d9536f', 0.1),
  vermillion: hex('#c43d33'),
  pine: hex('#46705c'),
  'pine-wash': hex('#46705c', 0.12),
  gold: hex('#b07d2f'),
  'gold-wash': hex('#b07d2f', 0.13),
  indigo: hex('#2b3a5c'),
  'indigo-wash': hex('#2b3a5c', 0.1),
  'blur-bg': hex('#f6f1e7', 0.82),
  'hero-sky-a': hex('#f9f3e6'),
  'hero-sky-b': hex('#f3e3d3'),
  'art-sun-a': hex('#e8506a'),
  'art-sun-b': hex('#cf3950'),
  'art-mtn-far': hex('#ded3c0'),
  'art-mtn-near': hex('#c9bca3'),
  'art-blossom-a': hex('#eeb5c2'),
  'art-blossom-b': hex('#dd8ba0'),
  'art-silhouette': hex('#2b2836'),
  'art-water': hex('#eae2d0'),
  'art-lantern': hex('#e8b04b'),
  'art-snow': hex('#f9f5ec'),
}

/** indigo snow-night — matches the dark theme in global.css */
const NIGHT: Palette = {
  paper: hex('#111726'),
  'paper-deep': hex('#0c111d'),
  card: hex('#1a2133'),
  ink: hex('#e9ecf4'),
  'ink-soft': hex('#9aa4bc'),
  'ink-faint': hex('#5f6a85'),
  hairline: hex('#e9ecf4', 0.14),
  sakura: hex('#e8798f'),
  'sakura-soft': hex('#7c3c4d'),
  'sakura-wash': hex('#e8798f', 0.14),
  vermillion: hex('#e05a48'),
  pine: hex('#6fae91'),
  'pine-wash': hex('#6fae91', 0.15),
  gold: hex('#e2ac52'),
  'gold-wash': hex('#e2ac52', 0.14),
  indigo: hex('#8fa3cf'),
  'indigo-wash': hex('#8fa3cf', 0.12),
  'blur-bg': hex('#111726', 0.82),
  'hero-sky-a': hex('#16203a'),
  'hero-sky-b': hex('#101626'),
  'art-sun-a': hex('#f4ecdc'),
  'art-sun-b': hex('#ddd2ba'),
  'art-mtn-far': hex('#1c2640'),
  'art-mtn-near': hex('#273450'),
  'art-blossom-a': hex('#c7d3e8'),
  'art-blossom-b': hex('#9fb2d4'),
  'art-silhouette': hex('#0a0e18'),
  'art-water': hex('#182136'),
  'art-lantern': hex('#f0b653'),
  'art-snow': hex('#e6ecf7'),
}

/** asayake — pink-washed morning paper, the sun still low and kind */
const DAWN: Palette = {
  ...DAY,
  paper: hex('#f5eae2'),
  'paper-deep': hex('#eeddd2'),
  card: hex('#fdf7f0'),
  ink: hex('#2d2733'),
  'ink-soft': hex('#6f6377'),
  'ink-faint': hex('#a795a4'),
  hairline: hex('#2d2733', 0.12),
  indigo: hex('#3a4468'),
  'indigo-wash': hex('#3a4468', 0.1),
  'blur-bg': hex('#f5eae2', 0.82),
  'hero-sky-a': hex('#f6d8c8'),
  'hero-sky-b': hex('#e9b7b4'),
  'art-sun-a': hex('#f06d67'),
  'art-sun-b': hex('#d94f4a'),
  'art-mtn-far': hex('#e3cbc0'),
  'art-mtn-near': hex('#cfae9f'),
  'art-blossom-a': hex('#f2bcc4'),
  'art-blossom-b': hex('#e097a4'),
  'art-silhouette': hex('#332b3a'),
  'art-water': hex('#f0dcd2'),
  'art-snow': hex('#fbf1e9'),
}

/** yūyake — the vermillion evening wash */
const DUSK: Palette = {
  ...DAY,
  paper: hex('#f3e2d3'),
  'paper-deep': hex('#ecd5bf'),
  card: hex('#fcf2e4'),
  ink: hex('#322838'),
  'ink-soft': hex('#75616e'),
  'ink-faint': hex('#a98f97'),
  hairline: hex('#322838', 0.13),
  sakura: hex('#cf4a63'),
  'sakura-wash': hex('#cf4a63', 0.11),
  gold: hex('#b3782a'),
  'gold-wash': hex('#b3782a', 0.14),
  indigo: hex('#47466b'),
  'indigo-wash': hex('#47466b', 0.1),
  'blur-bg': hex('#f3e2d3', 0.82),
  'hero-sky-a': hex('#f2c193'),
  'hero-sky-b': hex('#dd9078'),
  'art-sun-a': hex('#e2543f'),
  'art-sun-b': hex('#c53a2f'),
  'art-mtn-far': hex('#dfc0a4'),
  'art-mtn-near': hex('#c69c82'),
  'art-blossom-a': hex('#eeb0ad'),
  'art-blossom-b': hex('#d98b8b'),
  'art-silhouette': hex('#35283a'),
  'art-water': hex('#ecd3bb'),
  'art-lantern': hex('#eda93f'),
  'art-snow': hex('#f9eddd'),
}

/** 灯ともし頃 — the lamp-lighting hour, indigo warming around lanterns */
const LANTERN: Palette = {
  ...NIGHT,
  paper: hex('#232741'),
  'paper-deep': hex('#1b1f35'),
  card: hex('#2e3350'),
  ink: hex('#ece7df'),
  'ink-soft': hex('#aca4b0'),
  'ink-faint': hex('#6e6a80'),
  hairline: hex('#ece7df', 0.14),
  gold: hex('#eebc63'),
  'gold-wash': hex('#eebc63', 0.16),
  indigo: hex('#97a4d2'),
  'indigo-wash': hex('#97a4d2', 0.12),
  'blur-bg': hex('#232741', 0.82),
  'hero-sky-a': hex('#3a3a66'),
  'hero-sky-b': hex('#262a4a'),
  'art-sun-a': hex('#f4e3c2'),
  'art-sun-b': hex('#e0cfa6'),
  'art-mtn-far': hex('#2c3153'),
  'art-mtn-near': hex('#3a4064'),
  'art-blossom-a': hex('#cbb9d6'),
  'art-blossom-b': hex('#a894c2'),
  'art-silhouette': hex('#12131f'),
  'art-water': hex('#232a49'),
  'art-lantern': hex('#f7bd55'),
  'art-snow': hex('#efe9f2'),
}

/* ---------- altitude → mood ---------- */

export type SolarPhase = 'night' | 'dawn' | 'day' | 'dusk' | 'lantern'

export const PHASE_LABEL: Record<SolarPhase, string> = {
  dawn: '朝焼け · dawn',
  day: '昼 · midday',
  dusk: '夕焼け · dusk',
  lantern: '灯ともし頃 · lantern hour',
  night: '夜 · night',
}

interface Mix {
  a: Palette
  b: Palette
  t: number
  phase: SolarPhase
}

function solarMix(alt: number, rising: boolean): Mix {
  const seg = (from: number, to: number) => Math.min(1, Math.max(0, (alt - from) / (to - from)))
  if (rising) {
    if (alt <= -14) return { a: NIGHT, b: NIGHT, t: 0, phase: 'night' }
    if (alt <= -4) return { a: NIGHT, b: DAWN, t: seg(-14, -4), phase: alt < -9 ? 'night' : 'dawn' }
    if (alt <= 12) return { a: DAWN, b: DAY, t: seg(-4, 12), phase: alt < 5 ? 'dawn' : 'day' }
    return { a: DAY, b: DAY, t: 0, phase: 'day' }
  }
  if (alt > 10) return { a: DAY, b: DAY, t: 0, phase: 'day' }
  if (alt > -3) return { a: DAY, b: DUSK, t: seg(10, -3), phase: alt > 4 ? 'day' : 'dusk' }
  if (alt > -9) return { a: DUSK, b: LANTERN, t: seg(-3, -9), phase: alt > -6 ? 'dusk' : 'lantern' }
  if (alt > -15) return { a: LANTERN, b: NIGHT, t: seg(-9, -15), phase: alt > -12 ? 'lantern' : 'night' }
  return { a: NIGHT, b: NIGHT, t: 0, phase: 'night' }
}

/* ---------- application ---------- */

/** `?clock=HH:MM` previews any JST moment; otherwise the real now. */
function clockNow(): Date {
  try {
    const v = new URLSearchParams(window.location.search).get('clock')
    if (v && /^\d{1,2}:\d{2}$/.test(v)) {
      const [h, m] = v.split(':').map(Number)
      const [y, mo, d] = jstToday().split('-').map(Number)
      return new Date(Date.UTC(y, mo - 1, d, h - 9, m)) // JST = UTC+9
    }
  } catch {
    /* no window/search — fall through to the real clock */
  }
  return new Date()
}

export function currentSolar(): { phase: SolarPhase; altitude: number } {
  const [lat, lon] = currentCoords()
  const now = clockNow()
  const alt = sunAltitude(now, lat, lon)
  const rising = sunAltitude(new Date(now.getTime() + 5 * 60000), lat, lon) > alt
  return { phase: solarMix(alt, rising).phase, altitude: alt }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Reading-surface tokens. Lerping these between a light and a dark palette
 *  meets in a mid-gray where paper and ink converge and text disappears —
 *  so across a polarity change they snap at the midpoint instead, while the
 *  sky and artwork keep moving continuously (a gray 薄暮 dusk sky is honest;
 *  gray-on-gray text is not). */
const CHROME_TOKENS = new Set([
  'paper',
  'paper-deep',
  'card',
  'ink',
  'ink-soft',
  'ink-faint',
  'hairline',
  'blur-bg',
  'sakura-soft',
])

const DARK_PALETTES = new Set<Palette>([LANTERN, NIGHT])

/** Interpolate the palette for this moment and write it onto :root. */
export function applySolarPalette() {
  const [lat, lon] = currentCoords()
  const now = clockNow()
  const alt = sunAltitude(now, lat, lon)
  const rising = sunAltitude(new Date(now.getTime() + 5 * 60000), lat, lon) > alt
  const { a, b, t, phase } = solarMix(alt, rising)
  const crossesPolarity = DARK_PALETTES.has(a) !== DARK_PALETTES.has(b)

  const root = document.documentElement
  for (const token of Object.keys(DAY)) {
    const tt = crossesPolarity && CHROME_TOKENS.has(token) ? (t < 0.5 ? 0 : 1) : t
    const [r1, g1, b1, a1] = a[token]
    const [r2, g2, b2, a2] = b[token]
    const css = `rgba(${Math.round(lerp(r1, r2, tt))}, ${Math.round(lerp(g1, g2, tt))}, ${Math.round(
      lerp(b1, b2, tt)
    )}, ${+lerp(a1, a2, tt).toFixed(3)})`
    root.style.setProperty(`--${token}`, css)
  }
  root.dataset.phase = phase
  root.style.colorScheme = phase === 'night' || phase === 'lantern' ? 'dark' : 'light'

  // the browser chrome (iOS status bar, PWA title bar) follows the sun too —
  // the static media-scoped metas in index.html only cover the pre-JS frame
  const paper = root.style.getPropertyValue('--paper')
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = paper
  })
}
