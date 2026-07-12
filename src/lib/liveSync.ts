/**
 * Live Family Ink — realtime trip-state sync on the owner's Supabase.
 * OFF by default; the folded link (sync.ts) is the permanent fallback.
 * The payload is trip progress ONLY: reservations are pinned {} and the
 * AI key never appears here (DECISIONS.md #22, upholding #19/#17/#11).
 * `?ink=` fixtures keep the story suite fully offline (the ?lens= precedent).
 * Design: docs/superpowers/specs/2026-07-12-live-family-sync-design.md
 */
import { collectState, mergeState, type TripState } from './sync'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

/* Public by design — the publishable key class; RLS is the lock (#17 precedent). */
export const SUPABASE_URL = 'https://utvrwvxlkfbmlswcrxkc.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_HZzYgmIHjooWVZWtIieUdg_JrA_JUNW'

const K_ON = 'tabi:live-sync'
const K_FAMILY = 'tabi:family'

export interface InkStatus {
  kind: 'off' | 'connecting' | 'solo' | 'synced' | 'unreachable'
  code?: string
  codeExpiresAt?: number
  phones?: number
  lastSync?: number
}

/* Fields whose folded-link merge can't converge (mine-wins or append
 * semantics) are pinned to constants in the LIVE payload: a 5-second loop
 * would ping-pong them between phones forever — and grow notes without
 * bound. They still travel in the manual share link, whose one-shot merge
 * those semantics were written for. Do not "helpfully" re-add them. */
const LIVE_PIN = {
  reservations: {} as TripState['reservations'], // never on the server (#19)
  notes: '',
  travelers: [] as NonNullable<TripState['travelers']>,
  departure: '',
  rate: 155,
}

/* Canonical live view: sets sorted, packed only-trues — identical progress
 * must serialize identically on every phone, or the loop never settles
 * (mergeState unions are mine-first, so raw array ORDER diverges; explicit
 * packed:false never crosses the fold). Defensive ?? guards: this also runs
 * on server rows inside the realtime callback, outside any try. */
function normalizeLive(s: TripState): TripState {
  return {
    ...s,
    ...LIVE_PIN,
    favs: [...(s.favs ?? [])].sort(),
    allergies: [...(s.allergies ?? [])].sort(),
    packed: Object.fromEntries(Object.entries(s.packed ?? {}).filter(([, v]) => v)),
  }
}

/** Trip progress only — monotonic fields, so every phone converges (#19/#22). */
export function collectLiveState(): TripState {
  return normalizeLive(collectState())
}

/* Canonical stringify: Postgres jsonb reorders object keys, so sorted-key
 * serialization is the only change detector that doesn't cry wolf forever. */
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(v)
}

/* ---- ?ink= fixtures: the suite's window into every card state, no network ---- */

const FIXTURES: Record<string, InkStatus> = {
  off: { kind: 'off' },
  solo: { kind: 'solo', code: 'FUJI-42', codeExpiresAt: Date.now() + 15 * 60_000 },
  synced: { kind: 'synced', phones: 2, lastSync: Date.now() },
  unreachable: { kind: 'unreachable' },
}

export function inkFixture(): InkStatus | null {
  const name = new URLSearchParams(location.search).get('ink')
  return name ? (FIXTURES[name] ?? null) : null
}

/* ---- status: one source of truth, announced by event ---- */

let status: InkStatus = { kind: 'off' }

function setStatus(s: InkStatus) {
  if (JSON.stringify(s) === JSON.stringify(status)) return
  status = s
  window.dispatchEvent(new Event('tabi:ink-status'))
}

export function getInkStatus(): InkStatus {
  return status
}

export function inkOn(): boolean {
  return localStorage.getItem(K_ON) === 'on'
}

export function familyId(): string | null {
  return localStorage.getItem(K_FAMILY)
}

/* ---- engine internals ---- */

let sb: SupabaseClient | null = null
let uid: string | null = null
let channel: RealtimeChannel | null = null
let timer: number | null = null
let lastAck = '' // canon() of the server's copy of the family state
let phones = 0
let lastSyncAt = 0
let activeCode: string | null = null
let activeCodeExp: number | null = null

async function client(): Promise<SupabaseClient> {
  if (sb) return sb
  const { createClient } = await import('@supabase/supabase-js')
  sb = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data } = await sb.auth.getSession()
  if (data.session) {
    uid = data.session.user.id
  } else {
    const { data: anon, error } = await sb.auth.signInAnonymously()
    if (error) throw error
    uid = anon.user?.id ?? null
  }
  return sb
}

/** Fold a server copy into this phone. Announces 'tabi:ink' only on real change. */
function applyIncoming(state: unknown) {
  const s = state as TripState
  if (!s || s.v !== 1 || typeof s.moments !== 'object') return // empty row / future schema — fold nothing
  const safe = normalizeLive(s) // server rows never write the pocket — nor the pinned fields
  const before = canon(collectLiveState())
  mergeState(safe)
  lastAck = canon(safe)
  if (canon(collectLiveState()) !== before) window.dispatchEvent(new Event('tabi:ink'))
}

function markSynced() {
  if (phones >= 2) setStatus({ kind: 'synced', phones, lastSync: lastSyncAt })
  else setStatus({ kind: 'solo', code: activeCode ?? undefined, codeExpiresAt: activeCodeExp ?? undefined })
}

async function refreshPhones() {
  const fid = familyId()
  if (!fid) return
  try {
    const c = await client()
    const { data } = await c.from('family_members').select('user_id').eq('family_id', fid)
    if (data) phones = data.length
  } catch {
    /* next tick will surface reachability */
  }
}

/** The single writer: read → fold theirs in → write mine, version-guarded. */
async function tick() {
  const fid = familyId()
  if (!fid || !inkOn()) return
  try {
    const c = await client()
    if (canon(collectLiveState()) === lastAck) return markSynced() // clean — zero network
    for (let i = 0; i < 3; i++) {
      const { data: row, error } = await c
        .from('family_state')
        .select('state, version')
        .eq('family_id', fid)
        .single()
      if (error) throw error
      applyIncoming(row.state)
      const state = collectLiveState()
      if (canon(state) === lastAck) return markSynced() // theirs covered mine
      const { data: upd, error: uerr } = await c
        .from('family_state')
        .update({ state, version: row.version + 1, updated_by: uid, updated_at: new Date().toISOString() })
        .eq('family_id', fid)
        .eq('version', row.version)
        .select('version')
      if (uerr) throw uerr
      if (upd && upd.length > 0) {
        lastAck = canon(state)
        lastSyncAt = Date.now()
        return markSynced()
      }
      // someone wrote between our read and write — loop folds them in, retries
    }
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

const onWake = () => void tick()
const onVis = () => {
  if (document.visibilityState === 'visible') {
    void refreshPhones().then(() => tick())
  } else {
    void tick() // flush before the phone pockets us
  }
}

async function start() {
  const fid = familyId()
  if (!fid) return setStatus({ kind: 'off' })
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    await refreshPhones()
    if (!channel) {
      channel = c
        .channel(`family:${fid}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'family_state', filter: `family_id=eq.${fid}` },
          (p) => {
            applyIncoming((p.new as { state: unknown }).state)
            lastSyncAt = Date.now()
            markSynced()
          },
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'family_members', filter: `family_id=eq.${fid}` },
          () => {
            activeCode = null // the code just got consumed — it's single-use
            activeCodeExp = null
            void refreshPhones().then(() => markSynced())
          },
        )
        .subscribe()
    }
    if (timer === null) {
      timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') void tick()
      }, 5000)
      window.addEventListener('online', onWake)
      document.addEventListener('visibilitychange', onVis)
    }
    await tick()
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

/* ---- the five public verbs ---- */

/** Boot (App calls once). Fixtures short-circuit everything — no network ever. */
export async function maybeStartInk(): Promise<void> {
  const fx = inkFixture()
  if (fx) return setStatus(fx)
  if (inkOn() && familyId()) await start()
}

/** First phone: create the family, show the code. */
export async function startFamily(): Promise<boolean> {
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    const { data, error } = await c.rpc('create_family')
    if (error) throw error
    const res = data as { family_id: string; code: string }
    localStorage.setItem(K_FAMILY, res.family_id)
    localStorage.setItem(K_ON, 'on')
    activeCode = res.code
    activeCodeExp = Date.now() + 15 * 60_000
    await start() // subscribes + first push fills the empty row
    return true
  } catch {
    setStatus({ kind: 'unreachable' })
    return false
  }
}

/** Any other phone: join with the typed code. False = code wrong/faded. */
export async function joinFamily(code: string): Promise<boolean> {
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    const { data, error } = await c.rpc('join_family', { code_in: code })
    if (error) throw error
    const res = data as { ok: boolean; family_id?: string; state?: unknown }
    if (!res.ok || !res.family_id) {
      setStatus({ kind: 'off' })
      return false
    }
    localStorage.setItem(K_FAMILY, res.family_id)
    localStorage.setItem(K_ON, 'on')
    applyIncoming(res.state)
    await start() // folds + pushes this phone's own progress up
    return true
  } catch {
    setStatus({ kind: 'unreachable' })
    return false
  }
}

/** Mint a fresh code for the next phone (the old one may have faded). */
export async function freshCode(): Promise<void> {
  const fid = familyId()
  if (!fid) return
  try {
    const c = await client()
    const { data, error } = await c.rpc('new_join_code', { fid })
    if (error) throw error
    activeCode = (data as { code: string }).code
    activeCodeExp = Date.now() + 15 * 60_000
    markSynced()
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

/** Re-light a phone that turned itself off (family id remembered). */
export async function turnOnInk(): Promise<void> {
  localStorage.setItem(K_ON, 'on')
  await start()
}

/** Local flip only — the server row stays; turning back on rejoins silently. */
export function turnOffInk(): void {
  localStorage.removeItem(K_ON)
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
  window.removeEventListener('online', onWake)
  document.removeEventListener('visibilitychange', onVis)
  if (channel && sb) void sb.removeChannel(channel)
  channel = null
  activeCode = null
  activeCodeExp = null
  setStatus({ kind: 'off' })
}
