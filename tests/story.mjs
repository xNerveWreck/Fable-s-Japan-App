/**
 * The story suite — tests the narrative of use, not the functions
 * (PROCESS.md, field note 4). Serves the production build, drives it in a
 * phone-sized Chromium, and walks the stories that have bitten us before:
 * set a departure date and correct it, flip between days, watch the sun
 * move the palette, tap a moment and see the ink bloom.
 *
 * Run with `npm run check` (builds are not triggered — run `npm run build`
 * first). Set SHOT_DIR=/some/dir to also capture screenshots.
 */
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'

const PORT = 4174
const BASE = `http://localhost:${PORT}`
const SHOT_DIR = process.env.SHOT_DIR
if (SHOT_DIR) mkdirSync(SHOT_DIR, { recursive: true })

/* ---------- date + solar helpers (mirroring src/lib/dates.ts, solar.ts) ---------- */

const jstToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
const localToday = () => new Date().toLocaleDateString('en-CA')

function shiftDate(date, delta) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10)
}

const RAD = Math.PI / 180
function sunAltitude(at, lat, lon) {
  const d = (at.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000
  const L = (280.46 + 0.9856474 * d) % 360
  const g = ((357.528 + 0.9856003 * d) % 360) * RAD
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD
  const epsilon = 23.439 * RAD
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda))
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda))
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24
  const h = (gmst * 15 + lon) * RAD - ra
  return Math.asin(Math.sin(lat * RAD) * Math.sin(decl) + Math.cos(lat * RAD) * Math.cos(decl) * Math.cos(h)) / RAD
}

/** Find the JST clock time (HH:MM) today when Tokyo's sun is nearest `target`
 *  degrees, rising or falling — so the phase checks hold in any season. */
function jstTimeAtAltitude(target, rising) {
  const [y, m, d] = jstToday().split('-').map(Number)
  let best = null
  for (let min = 0; min < 1440; min += 2) {
    const at = new Date(Date.UTC(y, m - 1, d, -9, min)) // JST midnight + min
    const alt = sunAltitude(at, 35.68, 139.77)
    const later = sunAltitude(new Date(at.getTime() + 300000), 35.68, 139.77)
    if (later > alt !== rising) continue
    const err = Math.abs(alt - target)
    if (!best || err < best.err) best = { err, min }
  }
  const hh = String(Math.floor(best.min / 60)).padStart(2, '0')
  const mm = String(best.min % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/* ---------- harness ---------- */

const results = []
const check = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`)
const shot = (page, name) => (SHOT_DIR ? page.screenshot({ path: `${SHOT_DIR}/${name}.png` }) : Promise.resolve())

// spawn vite's JS entry with the current node binary — `npx` is a .cmd on
// Windows, which spawn() can't execute without a shell (and a shell would
// orphan the preview server on kill())
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})
for (let i = 0; i < 50; i++) {
  try {
    await fetch(BASE)
    break
  } catch {
    await new Promise((r) => setTimeout(r, 200))
  }
}

// prefer a system-provided chromium (e.g. sandboxed dev containers);
// otherwise use whatever `npx playwright install chromium` put in place
const SYSTEM_CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(SYSTEM_CHROMIUM) ? { executablePath: SYSTEM_CHROMIUM } : {})
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()

try {
  /* ---- 1. The departure-date story: set, survive, correct ---- */
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(700)
  const dateInput = page.locator('input[type="date"]')
  check('date input visible on fresh open', await dateInput.isVisible())
  await dateInput.fill(shiftDate(jstToday(), -6)) // today becomes trip day 7
  await page.waitForTimeout(400)
  check('date input still mounted after set (iOS picker survives)', await dateInput.isVisible())
  check(
    'countdown flipped to trip day 7',
    (await page.textContent('.countdown h2'))?.includes('Day 7') ?? false,
    (await page.textContent('.countdown h2')) ?? ''
  )
  await dateInput.fill(shiftDate(localToday(), 10)) // correcting a mistake
  await page.waitForTimeout(400)
  const h2 = await page.textContent('.countdown h2')
  check('date is correctable after being set', h2?.includes('10 days until Japan') ?? false, h2 ?? '')
  const persisted = await page.evaluate(() => localStorage.getItem('tabi:departure'))
  check('departure persisted', persisted === JSON.stringify(shiftDate(localToday(), 10)), persisted ?? 'null')
  await dateInput.blur()
  await page.waitForTimeout(300)
  check('date prompt retires after the picker closes', (await page.locator('.depart-row').count()) === 0)

  /* ---- 1b. Editing the date moves to Kit → Settings ---- */
  await page.goto(`${BASE}/#kit`)
  await page.waitForTimeout(500)
  await page.locator('.settings-btn').click()
  const kitDate = page.locator('[data-testid="kit-settings"] input[type="date"]')
  check('Kit settings holds the departure date', await kitDate.isVisible())
  await kitDate.fill(shiftDate(jstToday(), -6)) // back to trip day 7
  await page.goto(`${BASE}/#journey`)
  await page.waitForTimeout(500)
  check(
    'Kit-edited date drives the countdown',
    (await page.textContent('.countdown h2'))?.includes('Day 7') ?? false
  )

  /* ---- 1c. Notes: write in the margin, survive a reload ---- */
  await page.goto(`${BASE}/#kit`)
  await page.waitForTimeout(500)
  await page.locator('.pack-group .head', { hasText: 'Notes' }).click()
  await page.locator('.notes-body textarea').fill('Coin locker B-24 at Kyoto Station')
  await page.waitForTimeout(300)
  await page.reload()
  await page.waitForTimeout(600)
  await page.locator('.pack-group .head', { hasText: 'Notes' }).click()
  check(
    'notes persist across reload',
    (await page.locator('.notes-body textarea').inputValue()) === 'Coin locker B-24 at Kyoto Station'
  )

  /* ---- 2. The day-pager story: flip through the trip like scroll pages ---- */
  await page.goto(`${BASE}/#journey/7`)
  await page.waitForTimeout(600)
  check('header day-steps present', (await page.locator('.day-steps .step').count()) === 2)
  check('footer pager shows both neighbours on day 7', (await page.locator('.pager-card').count()) === 2)
  await page.locator('.pager-card.pager-next').click()
  await page.waitForTimeout(500)
  check('pager-next lands on day 8', (await page.textContent('.detail-top .title'))?.includes('Day 8') ?? false)
  await page.locator('.day-steps .step-prev').click()
  await page.waitForTimeout(500)
  check('header prev returns to day 7', (await page.textContent('.detail-top .title'))?.includes('Day 7') ?? false)
  await page.goto(`${BASE}/#journey/1`)
  await page.waitForTimeout(400)
  check('day 1 has no prev card, one next', (await page.locator('.pager-card').count()) === 1)
  check('day 1 prev step disabled', await page.locator('.day-steps .step-prev').isDisabled())
  await shot(page, 'day-detail-pager')
  await page.goto(`${BASE}/#journey/14`)
  await page.waitForTimeout(400)
  check('day 14 next step disabled', await page.locator('.day-steps .step').last().isDisabled())

  /* ---- 3. The solar clock: the palette follows Tokyo's real sun ---- */
  await page.evaluate(() => localStorage.removeItem('tabi:departure')) // Tokyo fallback
  const phases = [
    [jstTimeAtAltitude(-8, true), 'dawn'],
    ['12:00', 'day'],
    [jstTimeAtAltitude(1, false), 'dusk'],
    [jstTimeAtAltitude(-7, false), 'lantern'],
    ['00:30', 'night'],
  ]
  for (const [clock, expect] of phases) {
    await page.goto(`${BASE}/?clock=${clock}#journey`)
    await page.waitForTimeout(700)
    const phase = await page.evaluate(() => document.documentElement.dataset.phase)
    const paper = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--paper'))
    check(`clock ${clock} → phase ${expect}`, phase === expect, `got ${phase}, paper ${paper.trim()}`)
    const themeColor = await page.evaluate(
      () => document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? ''
    )
    check(`browser chrome follows the sun at ${clock}`, themeColor.trim() === paper.trim(), themeColor)
    await shot(page, `solar-${expect}`)
  }
  // the reading surface must never be twilight mud: paper and ink stay apart
  for (const [clock] of phases) {
    await page.goto(`${BASE}/?clock=${clock}#journey`)
    await page.waitForTimeout(500)
    const gap = await page.evaluate(() => {
      const readCh = (name) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).match(/\d+/g).slice(0, 3).map(Number)
      const [pr, pg, pb] = readCh('--paper')
      const [ir, ig, ib] = readCh('--ink')
      return Math.abs(pr - ir) + Math.abs(pg - ig) + Math.abs(pb - ib)
    })
    check(`paper/ink contrast holds at ${clock}`, gap > 300, `Σ|Δrgb| = ${gap}`)
  }

  /* ---- 4. The microseason calligraphy renders with real height ---- */
  await page.goto(`${BASE}/#journey`)
  await page.waitForTimeout(600)
  const kanji = (await page.locator('.hero-sekki .sekki-kanji').allTextContents()).join('')
  const box = await page.locator('.hero-sekki').boundingBox()
  check('microseason kanji present (3–4 glyphs)', kanji.length >= 3 && kanji.length <= 4, kanji)
  check('microseason column has real height', (box?.height ?? 0) > 60, `h=${box?.height}`)
  check('season note present', ((await page.textContent('.hero-season-note')) ?? '').length > 3)

  /* ---- 5. Nijimi: a tri-state tap blooms and cleans up ---- */
  await page.goto(`${BASE}/#journey/7`)
  await page.waitForTimeout(500)
  await page.locator('.state-btn.sb-loved').first().click()
  check('ink bloom spawns on loved tap', (await page.locator('.ink-bloom').count()) >= 1)
  await page.waitForTimeout(1400)
  check('ink bloom cleans itself up', (await page.locator('.ink-bloom').count()) === 0)

  /* ---- 6. Regression sweep: all tabs render ---- */
  for (const tab of ['journey', 'discover', 'speak', 'kit']) {
    await page.goto(`${BASE}/#${tab}`)
    await page.waitForTimeout(400)
    check(`tab ${tab} renders`, (await page.locator('.screen').count()) > 0)
  }

  /* ---- 7. Demo mode seeds day 7 and ?clock survives its replaceState ---- */
  const p2 = await ctx.newPage()
  await p2.goto(`${BASE}/?demo=1&clock=00:30#journey`)
  await p2.waitForTimeout(800)
  check('demo seeds day 7', (await p2.textContent('.countdown h2'))?.includes('Day 7') ?? false)
  check(
    '?clock survives demo replaceState',
    (await p2.evaluate(() => document.documentElement.dataset.phase)) === 'night'
  )

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

  // 00:30 is night in every trip city — the solar clock follows the current
  // city's sun mid-trip, so a Tokyo lantern-minute here would be too early
  await page.goto(`${BASE}/?clock=00:30&vg=now#journey/12`) // Osaka after dark
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
  // …but stillness must not change the scene: neon is lit at night, just not flickering
  await rmPage.goto(`${BASE}/?clock=00:30#journey/12`)
  await rmPage.waitForTimeout(600)
  const rmNeon = await rmPage
    .locator('.vg-neon')
    .first()
    .evaluate((el) => ({ anim: getComputedStyle(el).animationName, o: getComputedStyle(el).opacity }))
  check('reduce-motion neon stays lit at night', rmNeon.anim === 'none' && Number(rmNeon.o) > 0.5, `${rmNeon.anim} @ ${rmNeon.o}`)
  await rmCtx.close()

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

  /* ---- 10. Family voice phrasebook: their own voices, kept ---- */
  const micBrowser = await chromium.launch({
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  })
  const micCtx = await micBrowser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    permissions: ['microphone'],
  })
  const micPage = await micCtx.newPage()
  await micPage.goto(`${BASE}/#speak`)
  await micPage.waitForTimeout(600)
  check('every phrase row offers a mic', (await micPage.locator('.voice-btn').count()) > 10)
  // (sanctioned flexibility: if the Speak screen renders phrases in collapsed groups so fewer
  //  rows are visible, lower this threshold to match reality and note it in your report)
  await micPage.locator('.voice-btn').first().click()
  await micPage.waitForTimeout(1200)
  check('recording state shows', (await micPage.locator('.voice-btn.vb-recording').count()) === 1)
  await micPage.locator('.voice-btn.vb-recording').click()
  await micPage.waitForTimeout(800)
  check('family voice saved: play appears', (await micPage.locator('.voice-play').count()) >= 1)
  await micPage.reload()
  await micPage.waitForTimeout(800)
  check('family voice survives reload (IndexedDB)', (await micPage.locator('.voice-play').count()) >= 1)
  await micBrowser.close()

  /* ---- 11. Denshadex: gotta ride them all ---- */
  await page.goto(`${BASE}/#discover`)
  await page.waitForTimeout(500)
  await page.locator('.seg button', { hasText: 'Denshadex' }).click()
  await page.waitForTimeout(400)
  check('denshadex roster renders', (await page.locator('.dx-card').count()) >= 10)
  check('cards start locked', (await page.locator('.dx-card.dx-locked').count()) >= 10)
  await page.locator('.dx-card[data-train="n700s"]').click()
  await page.waitForTimeout(300)
  await page.locator('.dx-log').click()
  await page.waitForTimeout(400)
  check('logging floods the card with ink', (await page.locator('.dx-card[data-train="n700s"].dx-logged').count()) === 1)
  await page.reload()
  await page.waitForTimeout(600)
  await page.locator('.seg button', { hasText: 'Denshadex' }).click()
  await page.waitForTimeout(400)
  check('the ride is remembered', (await page.locator('.dx-card[data-train="n700s"].dx-logged').count()) === 1)

  /* ---- 12. Deer Diplomacy: the protocol has three moves ---- */
  await page.goto(`${BASE}/#journey/11`)
  await page.waitForTimeout(500)
  check('the dojo waits in Nara', (await page.locator('.deer-dojo').count()) === 1)
  await page.locator('.dd-offer').click() // offering before bowing — rude!
  await page.waitForTimeout(300)
  check('skipping the bow is called out', ((await page.textContent('.dd-note')) ?? '').includes('bow'))
  await page.locator('.dd-bow').click()
  await page.locator('.dd-offer').click()
  await page.locator('.dd-retreat').click()
  await page.waitForTimeout(600)
  check('a full exchange lands', ((await page.textContent('.dd-count')) ?? '').includes('1'))
  check('first rank earned', ((await page.textContent('.dd-rank')) ?? '').includes('Nervous Envoy'))
  await page.reload()
  await page.waitForTimeout(600)
  check('diplomacy is remembered', ((await page.textContent('.dd-count')) ?? '').includes('1'))
} finally {
  await browser.close()
  server.kill()
}

console.log(results.join('\n'))
const fails = results.filter((r) => r.startsWith('FAIL')).length
console.log(`\n${results.length - fails}/${results.length} checks green`)
process.exit(fails ? 1 : 0)
