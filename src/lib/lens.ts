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
