/**
 * 回覧板 Kairanban — the family journal feed engine. Each phone's day-entry
 * publishes itself to the family (debounced behind Journal saves); every
 * phone reads all pages; the DATABASE enforces that only the writing phone
 * can touch its rows (RLS: device_uid = auth.uid()). Hearts are rows owned
 * by the reactor. Realtime events are doorbells only — we refetch, never
 * trust payloads (photo rows are big). Offline: the last-fetched feed lives
 * in IndexedDB and keeps rendering in a tunnel.
 * Spec: docs/superpowers/specs/2026-07-13-kairanban-family-feed-design.md
 */
import { familyId, inkClient, inkOn } from './liveSync'
import { getEntry, getFeedCache, getPhoto, putFeedCache } from './db'

export interface FeedPhoto {
  id: string
  ink: boolean
  data: string // data:image/jpeg;base64,… ≤640px
}

export interface FeedPost {
  device_uid: string
  day_id: number
  author_id: string | null
  body: string
  photos: FeedPhoto[]
  extra_photos: number // beyond the wire cap, still on the author's phone
  updated_at: string
}

export interface FeedHeart {
  post_device: string
  post_day: number
  device_uid: string
  traveler_id: string | null
}

export interface FeedCache {
  posts: FeedPost[]
  hearts: FeedHeart[]
  fetchedAt: number
}

const K_UID = 'tabi:feed-uid' // this phone's anonymous identity, for offline ownership checks
const K_SEEN = 'tabi:feed-seen' // newest updated_at the owner has looked at
const PHOTO_CAP = 4
const THUMB_EDGE = 640

/* ---- ?feed= fixtures: the suite's whole feed, no network (the ?ink= precedent) ---- */

const FIXTURE_ME = '00000000-0000-4000-8000-00000000feed'
const FIXTURES: Record<string, FeedCache> = {
  ok: {
    posts: [
      {
        device_uid: 'dad-phone-uid',
        day_id: 2,
        author_id: 't2',
        body: 'Kids went feral at the gacha machines. Ken now owns a tiny plastic salaryman he refuses to explain.',
        photos: [
          { id: 'fx1', ink: true, data: TINY_JPEG() },
          { id: 'fx2', ink: false, data: TINY_JPEG() },
        ],
        extra_photos: 2,
        updated_at: '2026-07-13T09:12:00.000Z',
      },
      {
        device_uid: FIXTURE_ME,
        day_id: 2,
        author_id: 't1',
        body: 'The jetlag broke at Senso-ji. Incense smoke over everyone’s heads like the whole square was steaming.',
        photos: [{ id: 'fx3', ink: true, data: TINY_JPEG() }],
        extra_photos: 0,
        updated_at: '2026-07-13T08:40:00.000Z',
      },
      {
        device_uid: 'dad-phone-uid',
        day_id: 1,
        author_id: 't2',
        body: 'The plane ate a whole day and the kids watched four movies.',
        photos: [],
        extra_photos: 0,
        updated_at: '2026-07-12T22:05:00.000Z',
      },
    ],
    hearts: [
      { post_device: 'dad-phone-uid', post_day: 2, device_uid: FIXTURE_ME, traveler_id: 't1' },
      { post_device: 'dad-phone-uid', post_day: 2, device_uid: 'kid-phone-uid', traveler_id: 't3' },
      { post_device: FIXTURE_ME, post_day: 2, device_uid: 'dad-phone-uid', traveler_id: 't2' },
    ],
    fetchedAt: Date.now(),
  },
  empty: { posts: [], hearts: [], fetchedAt: Date.now() },
}

/** A 1×1 grey JPEG, generated per call — keeps the fixture self-contained. */
function TINY_JPEG(): string {
  return (
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q=='
  )
}

export function feedFixture(): FeedCache | null {
  const name = new URLSearchParams(location.search).get('feed')
  return name ? (FIXTURES[name] ?? null) : null
}

/* ---- identity & seen-state ---- */

/** This phone's anonymous uid — stashed at connect time so ownership checks work offline. */
export function myDeviceUid(): string | null {
  if (feedFixture()) return FIXTURE_ME
  return localStorage.getItem(K_UID)
}

export function markFeedSeen(cache: FeedCache | null): void {
  const newest = cache?.posts.reduce((m, p) => (p.updated_at > m ? p.updated_at : m), '') ?? ''
  if (newest) localStorage.setItem(K_SEEN, newest)
  window.dispatchEvent(new Event('tabi:feed-seen'))
}

export function feedUnseen(cache: FeedCache | null): boolean {
  if (!cache || cache.posts.length === 0) return false
  const seen = localStorage.getItem(K_SEEN) ?? ''
  const mine = myDeviceUid()
  return cache.posts.some((p) => p.device_uid !== mine && p.updated_at > seen)
}

/* ---- the cache every screen renders from ---- */

let cache: FeedCache | null = null

export async function readFeed(): Promise<FeedCache | null> {
  const fx = feedFixture()
  if (fx) return fx
  if (cache) return cache
  cache = (await getFeedCache<FeedCache>()) ?? null
  return cache
}

async function fetchFeed(): Promise<void> {
  const fid = familyId()
  if (!fid) return
  const { c } = await inkClient()
  const [posts, hearts] = await Promise.all([
    c.from('journal_posts').select('device_uid, day_id, author_id, body, photos, extra_photos, updated_at').eq('family_id', fid),
    c.from('journal_hearts').select('post_device, post_day, device_uid, traveler_id').eq('family_id', fid),
  ])
  if (posts.error || hearts.error) throw posts.error ?? hearts.error
  cache = {
    posts: (posts.data as FeedPost[]).sort((a, b) => b.day_id - a.day_id || (a.updated_at < b.updated_at ? 1 : -1)),
    hearts: hearts.data as FeedHeart[],
    fetchedAt: Date.now(),
  }
  await putFeedCache(cache)
  window.dispatchEvent(new Event('tabi:feed'))
}

/* ---- publishing: this phone's page, debounced behind journal saves ---- */

const timers = new Map<number, number>()

/** Journal calls this after every save; the page flies ~3s after the pen lifts. */
export function queuePublish(dayId: number): void {
  if (feedFixture()) return
  if (!inkOn() || !familyId()) return
  const t = timers.get(dayId)
  if (t) window.clearTimeout(t)
  timers.set(
    dayId,
    window.setTimeout(() => {
      timers.delete(dayId)
      void publishDay(dayId)
    }, 3000),
  )
}

/** Downscale a stored journal photo to feed size. */
async function thumb(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, THUMB_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.72)
}

async function publishDay(dayId: number): Promise<void> {
  const fid = familyId()
  if (!fid || !inkOn()) return
  try {
    const entry = await getEntry(dayId)
    const hasContent = !!entry && (entry.text.trim().length > 0 || entry.photos.length > 0)
    const publishedKey = `tabi:feed-pub-${dayId}`
    if (!hasContent && !localStorage.getItem(publishedKey)) return // nothing to say, nothing said before

    const wire: FeedPhoto[] = []
    for (const p of (entry?.photos ?? []).slice(0, PHOTO_CAP)) {
      const blob = await getPhoto(p.id)
      if (blob) wire.push({ id: p.id, ink: p.ink, data: await thumb(blob) })
    }

    const { c, uid } = await inkClient()
    if (!uid) return
    const { error } = await c.from('journal_posts').upsert({
      family_id: fid,
      device_uid: uid,
      day_id: dayId,
      author_id: entry?.authorId ?? null,
      body: entry?.text ?? '',
      photos: wire,
      extra_photos: Math.max(0, (entry?.photos.length ?? 0) - PHOTO_CAP),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    localStorage.setItem(K_UID, uid)
    localStorage.setItem(publishedKey, '1')
    await fetchFeed()
  } catch {
    /* no sky — the page stays local; the next save or wake tries again */
  }
}

/** Flush pending pages before the phone pockets us. */
function flushAll(): void {
  for (const [dayId, t] of timers) {
    window.clearTimeout(t)
    timers.delete(dayId)
    void publishDay(dayId)
  }
}

/* ---- hearts ---- */

export async function toggleHeart(postDevice: string, postDay: number, travelerId: string | null): Promise<void> {
  if (feedFixture()) return
  const fid = familyId()
  if (!fid) return
  try {
    const { c, uid } = await inkClient()
    if (!uid) return
    const mine = (await readFeed())?.hearts.find(
      (h) => h.post_device === postDevice && h.post_day === postDay && h.device_uid === uid,
    )
    if (mine) {
      await c
        .from('journal_hearts')
        .delete()
        .eq('family_id', fid)
        .eq('post_device', postDevice)
        .eq('post_day', postDay)
        .eq('device_uid', uid)
    } else {
      await c.from('journal_hearts').insert({
        family_id: fid,
        post_device: postDevice,
        post_day: postDay,
        device_uid: uid,
        traveler_id: travelerId,
      })
    }
    localStorage.setItem(K_UID, uid)
    await fetchFeed()
  } catch {
    /* no sky — the heart waits for a retap */
  }
}

/* ---- boot ---- */

let started = false

async function startFeed(): Promise<void> {
  if (started) return
  started = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAll()
    else if (inkOn()) void fetchFeed().catch(() => {})
  })
  try {
    const fid = familyId()!
    const { c, uid } = await inkClient()
    if (uid) localStorage.setItem(K_UID, uid)
    c.channel(`feed:${fid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_posts', filter: `family_id=eq.${fid}` }, () => {
        void fetchFeed().catch(() => {})
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_hearts', filter: `family_id=eq.${fid}` }, () => {
        void fetchFeed().catch(() => {})
      })
      .subscribe()
    await fetchFeed()
  } catch {
    /* offline boot — the IndexedDB copy carries the feed until the sky returns */
  }
}

/** App calls once alongside maybeStartInk(). Fixtures mean never-network.
 *  The engine also wakes when the ink turns ON mid-session (create/join both
 *  announce via 'tabi:ink-status') — a phone must not need a relaunch before
 *  its pages start flowing. */
export async function maybeStartFeed(): Promise<void> {
  if (feedFixture()) return
  const kick = () => {
    if (!started && inkOn() && familyId()) void startFeed()
  }
  window.addEventListener('tabi:ink-status', kick)
  kick()
}
