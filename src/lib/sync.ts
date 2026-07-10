/**
 * Family sync — the whole trip state folded into a shareable link.
 * One phone shares (AirDrop / iMessage), the other taps and merges.
 * No servers: the link IS the data.
 */

export type Moment = 'done' | 'loved' | 'skipped'

export interface Reservation {
  id: string
  label: string
  code: string
}

export interface SyncTraveler {
  id: string
  name: string
  animal: string
  color: string
}

export interface TripState {
  v: 1
  moments: Record<string, Moment>
  packed: Record<string, boolean>
  favs: string[]
  allergies: string[]
  departure: string
  rate: number
  reservations: Record<string, Reservation[]>
  /* v2.1 — optional so older links still decode */
  travelers?: SyncTraveler[]
  quizScores?: Record<string, number>
  /* v3 — the Kit notes pad */
  notes?: string
  /* v3.1 — Denshadex: train id -> first-ridden timestamp */
  densha?: Record<string, number>
  /* v3.2 — Deer Diplomacy: total shika-senbei exchanges completed */
  deer?: number
}

const K = {
  moments: 'tabi:moments',
  packed: 'tabi:packed',
  favs: 'tabi:phrase-favs',
  allergies: 'tabi:allergies',
  departure: 'tabi:departure',
  rate: 'tabi:fx-rate',
  reservations: 'tabi:reservations',
  travelers: 'tabi:travelers',
  quizScores: 'tabi:quiz-scores',
  notes: 'tabi:notes',
  densha: 'tabi:densha',
  deer: 'tabi:deer',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function collectState(): TripState {
  return {
    v: 1,
    moments: read(K.moments, {}),
    packed: read(K.packed, {}),
    favs: read(K.favs, []),
    allergies: read(K.allergies, []),
    departure: read(K.departure, ''),
    rate: read(K.rate, 155),
    reservations: read(K.reservations, {}),
    travelers: read(K.travelers, []),
    quizScores: read(K.quizScores, {}),
    notes: read(K.notes, ''),
    densha: read(K.densha, {}),
    deer: read(K.deer, 0),
  }
}

/* base64url so the payload survives every messenger */
export function encodeState(state: TripState): string {
  const json = JSON.stringify(state)
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeState(payload: string): TripState | null {
  try {
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const state = JSON.parse(new TextDecoder().decode(bytes)) as TripState
    if (state.v !== 1 || typeof state.moments !== 'object') return null
    return state
  } catch {
    return null
  }
}

export function shareUrl(): string {
  return `${location.origin}${location.pathname}#/sync/${encodeState(collectState())}`
}

/**
 * Merge another phone's state into this one. Progress is additive:
 * loved beats done beats skipped, packed items stay packed, favorites
 * and allergies are unions, and this phone's settings win where set.
 */
export function mergeState(incoming: TripState): void {
  const rank: Record<Moment, number> = { skipped: 1, done: 2, loved: 3 }
  const moments = read<Record<string, Moment>>(K.moments, {})
  for (const [key, theirs] of Object.entries(incoming.moments)) {
    const mine = moments[key]
    if (!mine || rank[theirs] > rank[mine]) moments[key] = theirs
  }

  const packed = read<Record<string, boolean>>(K.packed, {})
  for (const [key, val] of Object.entries(incoming.packed)) if (val) packed[key] = true

  const favs = Array.from(new Set([...read<string[]>(K.favs, []), ...incoming.favs]))
  const allergies = Array.from(new Set([...read<string[]>(K.allergies, []), ...incoming.allergies]))

  const reservations = read<Record<string, Reservation[]>>(K.reservations, {})
  for (const [day, list] of Object.entries(incoming.reservations)) {
    const mine = reservations[day] ?? []
    const seen = new Set(mine.map((r) => `${r.label}|${r.code}`))
    reservations[day] = [...mine, ...list.filter((r) => !seen.has(`${r.label}|${r.code}`))]
  }

  const departure = read<string>(K.departure, '') || incoming.departure

  // travelers: union by id, this phone's edits win; quiz bests: max
  const travelers = read<SyncTraveler[]>(K.travelers, [])
  for (const theirs of incoming.travelers ?? []) {
    if (!travelers.some((t) => t.id === theirs.id)) travelers.push(theirs)
  }
  const quizScores = read<Record<string, number>>(K.quizScores, {})
  for (const [id, best] of Object.entries(incoming.quizScores ?? {})) {
    quizScores[id] = Math.max(quizScores[id] ?? 0, best)
  }

  // notes: keep mine, append anything of theirs I don't already have
  const myNotes = read<string>(K.notes, '')
  const theirNotes = (incoming.notes ?? '').trim()
  if (theirNotes && !myNotes.includes(theirNotes)) {
    localStorage.setItem(K.notes, JSON.stringify(myNotes ? `${myNotes}\n⸻\n${theirNotes}` : theirNotes))
  }

  // denshadex: earliest ride timestamp wins (first phone to log it keeps the date)
  const densha = read<Record<string, number>>(K.densha, {})
  for (const [id, theirs] of Object.entries(incoming.densha ?? {})) {
    densha[id] = Math.min(densha[id] ?? Infinity, theirs)
  }

  // deer diplomacy: keep the higher exchange count (most-practiced phone wins)
  const deer = Math.max(read<number>(K.deer, 0), incoming.deer ?? 0)

  localStorage.setItem(K.densha, JSON.stringify(densha))
  localStorage.setItem(K.deer, JSON.stringify(deer))
  localStorage.setItem(K.travelers, JSON.stringify(travelers))
  localStorage.setItem(K.quizScores, JSON.stringify(quizScores))
  localStorage.setItem(K.moments, JSON.stringify(moments))
  localStorage.setItem(K.packed, JSON.stringify(packed))
  localStorage.setItem(K.favs, JSON.stringify(favs))
  localStorage.setItem(K.allergies, JSON.stringify(allergies))
  localStorage.setItem(K.reservations, JSON.stringify(reservations))
  localStorage.setItem(K.departure, JSON.stringify(departure))
}
