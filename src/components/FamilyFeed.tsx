import { useEffect, useState } from 'react'
import {
  feedFixture,
  feedUnseen,
  markFeedSeen,
  myDeviceUid,
  readFeed,
  toggleHeart,
  type FeedCache,
  type FeedPost,
} from '../lib/liveFeed'
import { familyId, inkOn } from '../lib/liveSync'
import { itinerary } from '../data/itinerary'
import { animalEmoji, type Traveler } from '../data/travelers'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'

/**
 * 回覧板 Kairanban — the family's pages, passed around. Everyone's journal
 * entries as washi cards: read everyone, edit only your own (and even that
 * only from your own phone — the database refuses anything else). One
 * vermillion ink-heart per person per page.
 */
export function FamilyFeed({ dayId, markSeen = false }: { dayId?: number; markSeen?: boolean }) {
  const [cache, setCache] = useState<FeedCache | null>(null)
  const [travelers] = useStored<Traveler[]>('travelers', [])
  const mine = myDeviceUid()

  useEffect(() => {
    let alive = true
    const load = () => void readFeed().then((c) => alive && setCache(c ? { ...c } : null))
    load()
    window.addEventListener('tabi:feed', load)
    return () => {
      alive = false
      window.removeEventListener('tabi:feed', load)
    }
  }, [])

  // opening the shelf reads the board — the tab dot rests
  useEffect(() => {
    if (markSeen && cache) markFeedSeen(cache)
  }, [markSeen, cache])

  if (!feedFixture() && (!inkOn() || familyId() === null)) {
    if (dayId !== undefined) return null // day pages stay quiet without ink
    return (
      <p className="feed-empty">
        The kairanban needs Family Ink — flip it on in Kit and the family’s pages gather here.
      </p>
    )
  }

  const posts = (cache?.posts ?? []).filter((p) => (dayId === undefined ? true : p.day_id === dayId))
  if (posts.length === 0) {
    if (dayId !== undefined) return null
    return <p className="feed-empty">The kairanban is blank — write today’s page in your journal and it appears here for everyone.</p>
  }

  return (
    <div className="feed">
      {posts.map((p) => (
        <FeedCard key={`${p.device_uid}:${p.day_id}`} post={p} cache={cache} travelers={travelers} mine={mine} showDay={dayId === undefined} />
      ))}
    </div>
  )
}

function FeedCard({
  post,
  cache,
  travelers,
  mine,
  showDay,
}: {
  post: FeedPost
  cache: FeedCache | null
  travelers: Traveler[]
  mine: string | null
  showDay: boolean
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const day = itinerary.find((d) => d.id === post.day_id)
  const author = travelers.find((t) => t.id === post.author_id)
  const hearts = (cache?.hearts ?? []).filter((h) => h.post_device === post.device_uid && h.post_day === post.day_id)
  const myHeart = hearts.some((h) => h.device_uid === mine)
  const own = post.device_uid === mine
  const myChip = travelers[0]?.id ?? null // the tapping phone's default identity for the heart's mascot

  const when = new Date(post.updated_at)
  const stamp = when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`card feed-card${own ? ' own' : ''}`}>
      <div className="feed-head">
        <span className={`feed-mascot text-${author?.color ?? 'indigo'}`} aria-hidden="true">
          {animalEmoji(author?.animal ?? '')}
        </span>
        <span className="grow">
          <span className="feed-author">{author?.name ?? 'Someone'}</span>
          {showDay && day && (
            <span className="feed-day">
              Day {day.id} · {day.city}
            </span>
          )}
        </span>
        <span className="feed-stamp">{stamp}</span>
      </div>

      {post.body.trim() && <p className="feed-body">{post.body}</p>}

      {post.photos.length > 0 && (
        <div className="journal-photos feed-photos">
          {post.photos.map((ph) => (
            <div key={ph.id} className={`journal-photo ${ph.ink && !flipped[ph.id] ? 'ink' : ''}`}>
              <img
                src={ph.data}
                alt="Family journal photo"
                onClick={() => setFlipped((f) => ({ ...f, [ph.id]: !f[ph.id] }))}
                title={ph.ink ? 'Tap to flip ink wash' : undefined}
              />
            </div>
          ))}
          {post.extra_photos > 0 && <span className="feed-more">+{post.extra_photos} more on their phone</span>}
        </div>
      )}

      <div className="feed-foot">
        {!own && (
          <button
            className={`feed-heart${myHeart ? ' on' : ''}`}
            aria-label={myHeart ? 'Take back your heart' : 'Love this page'}
            onClick={() => {
              play(myHeart ? 'skip' : 'loved')
              void toggleHeart(post.device_uid, post.day_id, myChip)
            }}
          >
            ♥
          </button>
        )}
        {hearts.length > 0 && (
          <span className="feed-heart-row" title={`${hearts.length} loved this page`}>
            {hearts.map((h) => (
              <span key={h.device_uid} className="feed-heart-blot" aria-hidden="true">
                {animalEmoji(travelers.find((t) => t.id === h.traveler_id)?.animal ?? '')}
              </span>
            ))}
          </span>
        )}
        <span className="grow" />
        {own && <span className="feed-own-hint">your page — edits flow from your journal</span>}
      </div>
    </div>
  )
}

/** The little unseen-ink dot for the Treasures tab. */
export function useFeedDot(): boolean {
  const [dot, setDot] = useState(false)
  useEffect(() => {
    const update = () => void readFeed().then((c) => setDot(feedUnseen(c)))
    update()
    window.addEventListener('tabi:feed', update)
    window.addEventListener('tabi:feed-seen', update)
    return () => {
      window.removeEventListener('tabi:feed', update)
      window.removeEventListener('tabi:feed-seen', update)
    }
  }, [])
  return dot
}
