# Sign & Etiquette Decoder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **STATUS: BUILD DEFERRED.** Design + plan are committed; do not build until the owner says go. When they do, start from `origin/main` on a new branch `claude/sign-decoder`.

**Goal:** Photograph any Japanese sign from the Speak tab and get back what it says, what it means, and what the family should do — faux-pas warnings first — via a direct browser call to the Anthropic API with the owner's own key.

**Architecture:** A pure library (`src/lib/lens.ts`: downscale → fetch → typed result/typed failures, with a `?lens=` fixture hook so tests never touch the network), one component (`src/components/SignLens.tsx`, a four-state card in the Speak tab), and a Kit settings row that stores the key in `localStorage` only.

**Tech Stack:** React 18 + TypeScript + Vite (existing); Anthropic Messages API over raw `fetch` (no SDK — zero-dependency invariant); Playwright story suite.

**Spec:** `docs/superpowers/specs/2026-07-10-sign-decoder-design.md` · **Decisions:** DECISIONS.md #17 (BYO on-device key + `claude-opus-4-8`), #11 (device secrets never sync).

## Global Constraints

- No new npm dependencies. The API is called with raw `fetch` — never add the Anthropic SDK.
- The key lives ONLY in `localStorage` as `tabi:claude-key` (via `useStored('claude-key', '')`). It must never appear in `src/lib/sync.ts`, any sync payload, the repo, or a committed fixture.
- The story suite must never make a network call: every suite path goes through the `?lens=` fixture hook.
- Offline-first, never offline-only: every failure state renders a calm, styled card; nothing else in the app may depend on this feature.
- All styling on existing tokens (`--card`, `--ink`, `--ink-soft`, `--ink-faint`, `--hairline`, `--vermillion`, `--font-display`, `--radius`); never a hardcoded color.
- Story suite is the gate: red commit → green commit; `npm run build` before `npm run check`.
- Branch `claude/sign-decoder`; push, never merge (owner merges on GitHub).

---

### Task 1: Story checks (red)

**Files:**
- Modify: `tests/story.mjs` (append section 15 immediately before the `} finally {`)

**Interfaces:**
- Produces: the contract for Tasks 2–4 — selectors `.lens-card`, `.lens-begin`, `.lens-fail`, `.lens-result`, `.lens-warning`; fixture names `ok` / `offline`; hidden `input[type="file"]` inside `.lens-card`; a `src/lib/sync.ts` that never mentions the key.

- [ ] **Step 1: Append section 15** (note: `Buffer` is a Node global — no import; `readFileSync` is already imported after the haiku engraver landed):

```js
  /* ---- 15. The sign decoder: photograph a sign, learn what to do ---- */
  // a 1x1 JPEG — enough for the canvas downscale path; fixtures answer, not the network
  const tinyJpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==',
    'base64'
  )
  const lCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const lPage = await lCtx.newPage()

  await lPage.goto(`${BASE}/#speak`)
  await lPage.waitForTimeout(500)
  check('the decoder card waits in Speak', (await lPage.locator('.lens-card').count()) === 1)
  await lPage.locator('.lens-begin').click()
  await lPage.waitForTimeout(300)
  check('no key points at Kit', ((await lPage.textContent('.lens-fail')) ?? '').includes('Kit'))

  await lPage.goto(`${BASE}/?lens=ok#speak`)
  await lPage.waitForTimeout(500)
  await lPage.locator('.lens-begin').click()
  await lPage.locator('.lens-card input[type="file"]').setInputFiles({ name: 'sign.jpg', mimeType: 'image/jpeg', buffer: tinyJpeg })
  await lPage.waitForTimeout(900)
  check('the sign is decoded', (await lPage.locator('.lens-result').count()) === 1)
  const firstBlock = await lPage.locator('.lens-result > *').first().getAttribute('class')
  check('warnings come first', (firstBlock ?? '').includes('lens-warning'), firstBlock ?? '')

  await lPage.goto(`${BASE}/?lens=offline#speak`)
  await lPage.waitForTimeout(500)
  await lPage.locator('.lens-begin').click()
  await lPage.locator('.lens-card input[type="file"]').setInputFiles({ name: 'sign.jpg', mimeType: 'image/jpeg', buffer: tinyJpeg })
  await lPage.waitForTimeout(900)
  check('offline gets a calm face', ((await lPage.textContent('.lens-fail')) ?? '').includes('sky'))
  await shot(lPage, 'sign-lens')
  await lCtx.close()

  // the key must never be able to travel in a sync link
  const syncSrc = readFileSync('src/lib/sync.ts', 'utf8')
  check('the key never syncs', !syncSrc.includes('claude-key'))
```

- [ ] **Step 2: Verify red** — `npm run build && npm run check`: existing checks PASS, the 6 new checks FAIL (except "the key never syncs", green from the start — keep it as the tripwire).

- [ ] **Step 3: Commit**

```bash
git add tests/story.mjs
git commit -m "Story suite: sign decoder checks (red)"
```

### Task 2: The lens library (`src/lib/lens.ts`)

**Files:**
- Create: `src/lib/lens.ts`

**Interfaces:**
- Produces: `LensResult { reads: string; means: string; do: string[]; warnings: string[] }`; `LensFail` union; `class LensError extends Error { kind: LensFail }`; `downscale(file: File): Promise<string>`; `decodeSign(imageB64: string, key: string): Promise<LensResult>`.

- [ ] **Step 1: Create the file — complete content:**

```ts
/**
 * The Sign & Etiquette Decoder — Tabi's first runtime network feature.
 * BYO key: the owner pastes an Anthropic API key into Kit → Settings
 * (localStorage only); the browser calls api.anthropic.com directly, the
 * officially supported CORS mode. DECISIONS.md #17;
 * docs/superpowers/specs/2026-07-10-sign-decoder-design.md.
 * The `?lens=` fixture hook keeps the story suite fully offline.
 */

export interface LensResult {
  reads: string
  means: string
  do: string[]
  warnings: string[]
}

export type LensFail = 'no-key' | 'bad-key' | 'offline' | 'busy' | 'refused' | 'unreadable'

export class LensError extends Error {
  kind: LensFail
  constructor(kind: LensFail) {
    super(kind)
    this.kind = kind
  }
}

/** Downscale a camera photo to ≤1568px long edge, JPEG, return bare base64. */
export function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const long = Math.max(img.width, img.height)
      const scale = Math.min(1, 1568 / long)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1])
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new LensError('unreadable'))
    }
    img.src = url
  })
}

const FIXTURES: Record<string, LensResult | LensFail> = {
  ok: {
    reads: '入浴前に体を洗ってください',
    means: 'Wash your body before entering the bath.',
    do: [
      'Sit at a washing station and rinse fully first',
      'Tie up long hair before getting in',
      'Ease in slowly — the water is hot',
    ],
    warnings: ['Never let your towel touch the bath water — rest it on your head like the locals'],
  },
  offline: 'offline',
  badkey: 'bad-key',
}

/** ?lens=<name> short-circuits the network — the story suite never goes online. */
export function lensFixture(): LensResult | LensFail | null {
  const name = new URLSearchParams(location.search).get('lens')
  return name ? (FIXTURES[name] ?? null) : null
}

const SYSTEM = [
  'You decode Japanese signs, notices, and instruction boards for a family of',
  'four (two adults, two kids) on their first trip to Japan. From the photo,',
  'give: what the sign literally says, what it actually means, and what the',
  'family should do next — faux-pas warnings first, in plain, kid-friendly',
  'English. If the photo is not a readable sign, say so plainly in the reads',
  'and means fields and leave do and warnings empty.',
].join(' ')

const FORMAT = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      reads: { type: 'string', description: 'What the sign literally says, short' },
      means: { type: 'string', description: 'What it actually means, plain English' },
      do: { type: 'array', items: { type: 'string' }, description: 'What the family should do, short steps' },
      warnings: { type: 'array', items: { type: 'string' }, description: 'Faux-pas warnings, most important first' },
    },
    required: ['reads', 'means', 'do', 'warnings'],
    additionalProperties: false,
  },
} as const

export async function decodeSign(imageB64: string, key: string): Promise<LensResult> {
  const fx = lensFixture()
  if (fx) {
    await new Promise((r) => setTimeout(r, 300)) // let the brush spinner show
    if (typeof fx === 'string') throw new LensError(fx)
    return fx
  }
  if (!key) throw new LensError('no-key')

  let resp: Response
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        // Owner decision (DECISIONS.md #17). No `thinking` param: on Opus 4.8
        // omitting it runs without thinking — the right latency trade here.
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        system: SYSTEM,
        output_config: { format: FORMAT },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
              { type: 'text', text: 'What does this say, and what should our family do?' },
            ],
          },
        ],
      }),
    })
  } catch {
    throw new LensError('offline')
  }

  if (resp.status === 401) throw new LensError('bad-key')
  if (!resp.ok) throw new LensError('busy') // 429 / 529 / 5xx / anything else

  const data = await resp.json()
  if (data.stop_reason === 'refusal') throw new LensError('refused')
  const text = (data.content ?? []).find((b: { type: string }) => b.type === 'text')?.text
  if (!text) throw new LensError('unreadable')
  try {
    return JSON.parse(text) as LensResult
  } catch {
    throw new LensError('unreadable')
  }
}
```

- [ ] **Step 2: Verify it typechecks** — `npm run build` passes (feature not wired yet; suite unchanged).

- [ ] **Step 3: Commit**

```bash
git add src/lib/lens.ts
git commit -m "Lens library: downscale, decode, fixtures, typed failures"
```

### Task 3: The Speak-tab card (`src/components/SignLens.tsx`)

**Files:**
- Create: `src/components/SignLens.tsx`
- Modify: `src/screens/Phrases.tsx` (render `<SignLens />` directly after the `.search-box` div)
- Modify: `src/styles/screens.css` (append)

**Interfaces:**
- Consumes: `decodeSign`, `downscale`, `LensError`, `LensFail`, `LensResult`, `lensFixture` from Task 2; `useStored` from `src/hooks/useStored.ts`.
- Produces: `<SignLens />` (no props).

- [ ] **Step 1: Create `src/components/SignLens.tsx` — complete content:**

```tsx
import { useRef, useState } from 'react'
import { useStored } from '../hooks/useStored'
import { decodeSign, downscale, LensError, lensFixture, type LensFail, type LensResult } from '../lib/lens'

const FAIL_FACE: Record<LensFail, string> = {
  'no-key': 'The decoder needs a key. Paste yours in Kit → Settings → AI key.',
  'bad-key': 'That key did not work — check it in Kit → Settings.',
  offline: 'The decoder needs the sky — no signal here. The painting still works.',
  busy: 'Claude is busy — try again in a moment.',
  refused: 'Claude declined to read this one.',
  unreadable: 'Could not make sense of that photo — try a straighter shot.',
}

/** Decode a sign · 読む — photograph any sign, learn what it means and what to do. */
export function SignLens() {
  const [key] = useStored<string>('claude-key', '')
  const [state, setState] = useState<'idle' | 'reading' | 'done' | 'failed'>('idle')
  const [result, setResult] = useState<LensResult | null>(null)
  const [fail, setFail] = useState<LensFail>('offline')
  const fileRef = useRef<HTMLInputElement>(null)

  const begin = () => {
    if (!key && !lensFixture()) {
      setFail('no-key')
      setState('failed')
      return
    }
    fileRef.current?.click()
  }

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    setState('reading')
    try {
      const b64 = await downscale(file)
      setResult(await decodeSign(b64, key))
      setState('done')
    } catch (e) {
      setFail(e instanceof LensError ? e.kind : 'offline')
      setState('failed')
    }
  }

  return (
    <div className="card lens-card">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void onPhoto(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {state === 'idle' && (
        <button className="lens-begin" onClick={begin}>
          <span className="lens-kanji" aria-hidden="true">読</span>
          <span className="grow">
            <span className="lens-title">Decode a sign</span>
            <span className="lens-sub">photograph any sign — learn what it means and what to do</span>
          </span>
        </button>
      )}
      {state === 'reading' && <div className="lens-reading">Reading the sign…</div>}
      {state === 'failed' && (
        <div className="lens-fail">
          <p>{FAIL_FACE[fail]}</p>
          <button className="lens-again" onClick={() => setState('idle')}>Try again</button>
        </div>
      )}
      {state === 'done' && result && (
        <div className="lens-result">
          {result.warnings.map((w, i) => (
            <p key={i} className="lens-warning">{w}</p>
          ))}
          <div className="lens-sect">
            <h3>What it says</h3>
            <p className="jp">{result.reads}</p>
          </div>
          <div className="lens-sect">
            <h3>What it means</h3>
            <p>{result.means}</p>
          </div>
          {result.do.length > 0 && (
            <div className="lens-sect">
              <h3>What to do</h3>
              <ul>
                {result.do.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="lens-again" onClick={() => setState('idle')}>Decode another</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Render it in Phrases.tsx** — `import { SignLens } from '../components/SignLens'`, then place `<SignLens />` immediately after the closing `</div>` of `.search-box`.

- [ ] **Step 3: Append CSS to screens.css:**

```css
/* ================= sign decoder · 読む ================= */
.lens-card { padding: 12px 16px; }
.lens-begin { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; background: none; border: none; color: var(--ink); }
.lens-kanji { font-family: var(--font-display); font-size: 30px; color: var(--vermillion); }
.lens-title { display: block; font-weight: 600; }
.lens-sub { display: block; font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
.lens-reading { padding: 14px 2px; color: var(--ink-soft); font-style: italic; }
.lens-fail p { color: var(--ink-soft); margin: 8px 0; }
.lens-warning { color: var(--vermillion); font-weight: 600; margin: 8px 0; }
.lens-sect { margin: 12px 0; }
.lens-sect h3 { font-size: 12px; letter-spacing: 0.06em; color: var(--ink-faint); text-transform: uppercase; margin: 0 0 3px; }
.lens-sect ul { margin: 0; padding-left: 18px; }
.lens-sect li { margin: 3px 0; }
.lens-again { border: 1px solid var(--hairline); background: none; color: var(--ink-soft); border-radius: var(--radius); padding: 6px 14px; margin-top: 6px; font-size: 13px; }
```

- [ ] **Step 4: Verify** — `npm run build && npm run check`: all section-15 checks PASS except none should remain red.

- [ ] **Step 5: Commit**

```bash
git add src/components/SignLens.tsx src/screens/Phrases.tsx src/styles/screens.css
git commit -m "Sign decoder: the Speak tab learns to read"
```

### Task 4: The key in Kit, and the tripwire comment

**Files:**
- Modify: `src/screens/Kit.tsx` (`KitSettings`: AI-key row after the departure `<label>`)
- Modify: `src/lib/sync.ts` (comment on the `K` map)
- Modify: `src/styles/screens.css` (append)

**Interfaces:**
- Consumes: `useStored` (already imported in Kit.tsx). Ensure `TrashIcon` is imported from `'../art/icons'` in Kit.tsx (add it to the existing icons import if absent).

- [ ] **Step 1: In `KitSettings`, add state (`useState` from react is already imported in Kit.tsx):**

```tsx
const [claudeKey, setClaudeKey] = useStored<string>('claude-key', '')
const [keyDraft, setKeyDraft] = useState('')
```

- [ ] **Step 2: After the departure `<label className="depart-row">…</label>`, add:**

```tsx
<label className="depart-row">
  <span className="depart-label">AI key · 鍵</span>
  {claudeKey ? (
    <span className="key-set">
      ✓ key saved
      <button className="icon-btn" aria-label="Clear the AI key" onClick={() => setClaudeKey('')}>
        <TrashIcon />
      </button>
    </span>
  ) : (
    <span className="key-entry">
      <input
        type="password"
        placeholder="paste Anthropic key"
        autoComplete="off"
        value={keyDraft}
        onChange={(e) => setKeyDraft(e.target.value)}
      />
      <button className="key-save" disabled={!keyDraft.trim()} onClick={() => { setClaudeKey(keyDraft.trim()); setKeyDraft('') }}>
        Save
      </button>
    </span>
  )}
</label>
<p className="key-note">
  Powers the sign decoder. Use a key from a dedicated workspace with a monthly spend cap
  (console.anthropic.com). Stored only on this phone — never synced, never shared.
</p>
```

- [ ] **Step 3: In `src/lib/sync.ts`, add above the `K` map (wording must NOT contain the literal storage key — the suite greps for it):**

```ts
// NOTE: the owner's Anthropic API key (Kit → Settings → AI key) is deliberately
// absent from this map — a device secret must never travel in a sync link
// (DECISIONS.md #11, #17). The story suite enforces this.
```

- [ ] **Step 4: Append CSS:**

```css
.key-entry { display: flex; gap: 8px; align-items: center; }
.key-entry input { flex: 1; min-width: 0; }
.key-save { border: 1px solid var(--hairline); background: var(--card); color: var(--ink); border-radius: var(--radius); padding: 6px 12px; font-size: 13px; }
.key-set { display: flex; gap: 8px; align-items: center; color: var(--ink-soft); }
.key-note { font-size: 12px; color: var(--ink-faint); margin: 6px 2px 0; }
```

- [ ] **Step 5: Verify green** — `npm run build && npm run check`: everything green including "the key never syncs".

- [ ] **Step 6: Commit**

```bash
git add src/screens/Kit.tsx src/lib/sync.ts src/styles/screens.css
git commit -m "Kit: the AI key lives on this phone only"
```

### Task 5: Ledger, docs, visual pass, push

**Files:**
- Modify: `ROADMAP.md` (Part II "Sign & Etiquette Decoder" → ✅; Part IV — first v3.5 *Aibō* item shipped)
- Modify: `IMPLEMENTATION_PLAN.md` (this plan's index row → ✅ when merged; status line)
- Modify: `README.md` (feature blurb + how to set the key)
- Modify: `SESSION_NOTES.md` (session entry: what shipped, verified how, weird things hit)

- [ ] **Step 1: Update the four docs** per the file list above.
- [ ] **Step 2: Visual pass** — real render at 390×844, day and lantern (`?clock=00:30`), idle + result + failure states (field note 1). On a real iPhone afterwards: paste key, photograph a real sign, confirm a decode (~2¢).
- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "Ledger + docs: the sign decoder ships"
git push -u origin claude/sign-decoder
```

Stop after pushing — the owner reviews and merges.
