/**
 * Live Family Ink — real-network E2E against the real Supabase project.
 * NOT part of `npm run check` (the story suite stays offline — DECISIONS #3).
 * Run:  npm run build && npm run check:live
 * Gate: Anonymous sign-ins enabled in the Supabase dashboard.
 * Prints the created family id — the orchestrator deletes it afterwards.
 */
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { existsSync } from 'fs'

const PORT = 4176
const BASE = `http://localhost:${PORT}`
const URL = 'https://utvrwvxlkfbmlswcrxkc.supabase.co'
const KEY = 'sb_publishable_HZzYgmIHjooWVZWtIieUdg_JrA_JUNW'

/* 0. the dashboard gate, with a plain face */
const probe = await fetch(`${URL}/auth/v1/signup`, {
  method: 'POST',
  headers: { apikey: KEY, 'content-type': 'application/json' },
  body: '{}',
})
if (!probe.ok) {
  const body = await probe.json().catch(() => ({}))
  if (body.error_code === 'anonymous_provider_disabled' || /anonymous/i.test(body.msg ?? '')) {
    console.error('GATE: Anonymous sign-ins are still OFF.')
    console.error('Supabase dashboard -> Authentication -> Sign In / Providers -> Anonymous sign-ins -> ON. Then rerun.')
    process.exit(1)
  }
}

const results = []
const check = (name, ok) => {
  results.push(`${ok ? 'PASS' : 'FAIL'} — ${name}`)
  console.log(`${ok ? '✅' : '❌'} ${name}`)
}
const settled = (p) => p.then(() => true, () => false)
/* Probe field: moments — notes/travelers/departure/rate are pinned out of the
 * live payload (non-converging merges; see the spec's SyncPayload paragraph). */
const addMoment = (pg, id, val) =>
  pg.evaluate(([k, v]) => {
    const m = JSON.parse(localStorage.getItem('tabi:moments') ?? '{}')
    m[k] = v
    localStorage.setItem('tabi:moments', JSON.stringify(m))
  }, [id, val])

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore' },
)
for (let i = 0; i < 50; i++) {
  try {
    await fetch(BASE)
    break
  } catch {
    await new Promise((r) => setTimeout(r, 200))
  }
}

const SYSTEM_CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(SYSTEM_CHROMIUM) ? { executablePath: SYSTEM_CHROMIUM } : {})
const mk = () =>
  browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

let fid = null
try {
  /* Phone A: seeded moments, starts the family */
  const ctxA = await mk()
  const A = await ctxA.newPage()
  await A.addInitScript(() => {
    if (!localStorage.getItem('tabi:moments'))
      localStorage.setItem('tabi:moments', JSON.stringify({ 'e2e-alpha': 'done' }))
  })
  await A.goto(`${BASE}/#kit`)
  await A.waitForTimeout(800)
  await A.click('text=Turn on live sync — start our family')
  const gotCode = await settled(A.waitForSelector('.ink-code', { timeout: 20000 }))
  check('A starts a family and a code appears', gotCode)
  const code = gotCode ? ((await A.textContent('.ink-code')) ?? '').trim() : ''
  check('the code looks like FUJI-42', /^[A-Z]+-\d\d$/.test(code))
  fid = await A.evaluate(() => localStorage.getItem('tabi:family'))
  console.log(`   family (for cleanup): ${fid}`)

  /* Phone B: joins by code, receives A's moments */
  const ctxB = await mk()
  const B = await ctxB.newPage()
  await B.goto(`${BASE}/#kit`)
  await B.waitForTimeout(800)
  await B.click('text=Join a family')
  await B.fill('input[placeholder="FUJI-42"]', code)
  await B.click('text=Join')
  check(
    "B joins and A's moments arrive",
    await settled(
      B.waitForFunction(() => (localStorage.getItem('tabi:moments') ?? '').includes('e2e-alpha'), null, {
        timeout: 20000,
      }),
    ),
  )
  check(
    'A sees two phones',
    await settled(
      A.waitForFunction(() => document.querySelector('.ink-status')?.textContent?.includes('2 phones'), null, {
        timeout: 20000,
      }),
    ),
  )

  /* invite a third phone: the SYNCED card must mint and SHOW a fresh code */
  await A.click('text=Invite another phone')
  const invited = await settled(A.waitForSelector('.ink-code', { timeout: 15000 }))
  const code2 = invited ? ((await A.textContent('.ink-code')) ?? '').trim() : ''
  check('invite another phone shows a fresh code on the synced card', invited && /^[A-Z]+-\d\d$/.test(code2))

  /* realtime: B writes, A blooms without touching anything */
  await addMoment(B, 'e2e-beta', 'loved')
  check(
    "A blooms with B's loved moment (realtime)",
    await settled(
      A.waitForFunction(() => (localStorage.getItem('tabi:moments') ?? '').includes('e2e-beta'), null, {
        timeout: 25000,
      }),
    ),
  )

  /* the tunnel: B goes dark, both write, B resurfaces, both converge */
  await ctxB.setOffline(true)
  await addMoment(B, 'e2e-tunnel', 'done')
  await addMoment(A, 'e2e-meanwhile', 'loved')
  await A.waitForTimeout(8000) // A pushes while B is dark
  await ctxB.setOffline(false)
  const converged = (pg) =>
    pg.waitForFunction(
      () => {
        const m = localStorage.getItem('tabi:moments') ?? ''
        return m.includes('e2e-tunnel') && m.includes('e2e-meanwhile')
      },
      null,
      { timeout: 30000 },
    )
  check('the tunnel heals — both phones converge', (await settled(converged(A))) && (await settled(converged(B))))

  /* the line that must never travel: reservations stay off the server */
  await A.evaluate(() =>
    localStorage.setItem('tabi:reservations', JSON.stringify({ d1: [{ id: 'x', label: 'hotel', code: 'PNR-SECRET' }] })),
  )
  await A.waitForTimeout(8000) // a push cycle passes
  check(
    'reservations never reach the other phone',
    await B.evaluate(() => !(localStorage.getItem('tabi:reservations') ?? '').includes('PNR-SECRET')),
  )
} finally {
  await browser.close()
  server.kill()
  if (fid) console.log(`cleanup: delete from families where id = '${fid}';`)
}

const fails = results.filter((r) => r.startsWith('FAIL')).length
console.log(`\n${results.length - fails}/${results.length} live checks passed`)
process.exit(fails ? 1 : 0)
