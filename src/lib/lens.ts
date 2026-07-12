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

/** Calm error copy shared by every lens, keyed by LensFail. */
export const FAIL_FACE: Record<LensFail, string> = {
  'no-key': 'The decoder needs a key. Paste yours in Kit → Settings → AI key.',
  'bad-key': 'That key did not work — check it in Kit → Settings.',
  offline: 'The decoder needs the sky — no signal here. The painting still works.',
  busy: 'Claude is busy — try again in a moment.',
  refused: 'Claude declined to read this one.',
  unreadable: 'Could not make sense of that photo — try a straighter shot.',
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

/** One photo in, one structured answer out — the call every lens shares. */
async function lensCall(key: string, system: string, format: unknown, imageB64: string, ask: string, maxTokens: number): Promise<unknown> {
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
        max_tokens: maxTokens,
        system,
        output_config: { format },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } },
              { type: 'text', text: ask },
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
    return JSON.parse(text)
  } catch {
    throw new LensError('unreadable')
  }
}

export async function decodeSign(imageB64: string, key: string): Promise<LensResult> {
  const fx = lensFixture()
  if (fx) {
    await new Promise((r) => setTimeout(r, 300)) // let the brush spinner show
    if (typeof fx === 'string') throw new LensError(fx)
    return fx
  }
  if (!key) throw new LensError('no-key')
  return (await lensCall(key, SYSTEM, FORMAT, imageB64, 'What does this say, and what should our family do?', 1024)) as LensResult
}

/* ---------- the menu lens — the second eye on the same key ---------- */

export interface Dish {
  jp: string
  en: string
  price: string
  flag: 'avoid' | 'caution' | 'ok'
  kid: boolean
  why: string
}

export interface MenuResult {
  dishes: Dish[]
  picks: string[]
  warnings: string[]
  order: string
}

const MENU_FIXTURES: Record<string, MenuResult | LensFail> = {
  ok: {
    dishes: [
      { jp: '焼きおにぎり', en: 'Grilled rice ball', price: '¥300', flag: 'ok', kid: true, why: '' },
      { jp: 'から揚げ', en: 'Fried chicken bites', price: '¥520', flag: 'ok', kid: true, why: '' },
      { jp: '焼き鳥（たれ）', en: 'Chicken skewer, sweet sauce', price: '¥180', flag: 'ok', kid: true, why: '' },
      { jp: 'キウイサワー', en: 'Kiwi sour (drink)', price: '¥480', flag: 'avoid', kid: false, why: 'Made with real kiwi — it is on the family allergy card' },
      { jp: '本日のフルーツ盛り', en: 'Fruit plate of the day', price: '¥600', flag: 'caution', kid: false, why: 'Mixed fruit often includes kiwi — ask first' },
    ],
    picks: [
      'Grilled rice balls and chicken skewers are the safest kid bets',
      'Fried chicken bites are mild and familiar',
    ],
    warnings: ['Two items touch the kiwi allergy — the kiwi sour and the fruit plate'],
    order: 'これをください — point at the dish. キウイアレルギーがあります。',
  },
  offline: 'offline',
  badkey: 'bad-key',
}

/** ?menu=<name> short-circuits the network — same trick as ?lens=. */
export function menuFixture(): MenuResult | LensFail | null {
  const name = new URLSearchParams(location.search).get('menu')
  return name ? (MENU_FIXTURES[name] ?? null) : null
}

function menuSystem(allergies: { en: string; jp: string }[]): string {
  const card = allergies.length
    ? `The family's allergy card lists: ${allergies.map((a) => `${a.en} (${a.jp})`).join(', ')}.`
    : 'The family has no listed allergies.'
  return [
    'You read Japanese menus for a family of four (two adults, two kids) on',
    'their first trip to Japan. From the photo, list every dish you can read:',
    'the name as printed, a short plain-English name, and the printed price',
    `if shown (empty string if not). ${card} Flag a dish avoid when it`,
    'contains or very likely contains a card allergen, caution when it',
    'plausibly might (mixed fruit, sauces, hidden ingredients) — give a short',
    'kid-plain why for both — otherwise ok with an empty why. Mark kid true',
    'for mild, familiar dishes a young kid would happily eat. In picks,',
    'recommend two or three dishes for this family in plain English. In',
    'warnings, put allergy heads-ups first, then anything about how ordering',
    'works here (ticket machine, pay first, call button). In order, give the',
    'polite Japanese to say or show when ordering. If the photo is not a',
    'menu, say so plainly as the only warning and leave everything else empty.',
  ].join(' ')
}

const MENU_FORMAT = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      dishes: {
        type: 'array',
        description: 'Every dish readable on the menu, in menu order',
        items: {
          type: 'object',
          properties: {
            jp: { type: 'string', description: 'The dish as printed on the menu' },
            en: { type: 'string', description: 'Short plain-English name' },
            price: { type: 'string', description: 'Printed price like ¥850, empty if not shown' },
            flag: { type: 'string', enum: ['avoid', 'caution', 'ok'], description: 'avoid = contains a card allergen; caution = plausibly might' },
            kid: { type: 'boolean', description: 'A good pick for a young kid' },
            why: { type: 'string', description: 'Kid-plain reason when flagged, empty otherwise' },
          },
          required: ['jp', 'en', 'price', 'flag', 'kid', 'why'],
          additionalProperties: false,
        },
      },
      picks: { type: 'array', items: { type: 'string' }, description: 'Two or three recommendations for this family' },
      warnings: { type: 'array', items: { type: 'string' }, description: 'Allergy heads-ups first, then how ordering works here' },
      order: { type: 'string', description: 'The polite Japanese to say or show to order' },
    },
    required: ['dishes', 'picks', 'warnings', 'order'],
    additionalProperties: false,
  },
} as const

export async function decodeMenu(imageB64: string, key: string, allergies: { en: string; jp: string }[]): Promise<MenuResult> {
  const fx = menuFixture()
  if (fx) {
    await new Promise((r) => setTimeout(r, 300)) // let the brush spinner show
    if (typeof fx === 'string') throw new LensError(fx)
    return fx
  }
  if (!key) throw new LensError('no-key')
  // menus run long — twice the sign budget
  return (await lensCall(key, menuSystem(allergies), MENU_FORMAT, imageB64, 'Read this menu for our family.', 2048)) as MenuResult
}
