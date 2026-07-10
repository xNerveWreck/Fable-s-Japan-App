import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { quests } from '../data/quests'
import { itinerary, TRIP_LENGTH } from '../data/itinerary'
import { useStored } from '../hooks/useStored'
import { daysBetween, jstToday } from '../lib/dates'
import { CITY_COORDS } from '../lib/solar'
import { haversineKm } from '../lib/tokaido'
import { play } from '../lib/sound'

const NEAR_KM = 40

/**
 * Three find-it micro-hunts per city, unlocked when the family is actually
 * there. Unlock rule: the current trip day's city matches (same tripClock
 * math as Journey.tsx), OR — only if geolocation permission is already
 * granted, never prompted here — a live fix lands within 40km of the city.
 * Finds sync between DayDetail (which paints the vignette bonus) and this
 * card via the lifted `found`/`setFound` state (see src/screens/Journey.tsx).
 */
export function SideQuests({
  city,
  found,
  setFound,
}: {
  city: string
  found: Record<string, number>
  setFound: Dispatch<SetStateAction<Record<string, number>>>
}) {
  const [departure] = useStored<string>('departure', '')
  const [openId, setOpenId] = useState<string | null>(null)
  const [unlockedByGeo, setUnlockedByGeo] = useState(false)

  const jstDelta = departure ? daysBetween(departure, jstToday()) : -1
  const tripDay = jstDelta >= 0 ? jstDelta + 1 : null
  const currentCity = tripDay != null && tripDay >= 1 && tripDay <= TRIP_LENGTH ? itinerary[tripDay - 1].city : null
  const unlockedByDay = currentCity === city
  const unlocked = unlockedByDay || unlockedByGeo

  useEffect(() => {
    if (unlockedByDay) return
    const coords = CITY_COORDS[city]
    if (!coords || !('permissions' in navigator) || !('geolocation' in navigator)) return
    let cancelled = false
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (cancelled || status.state !== 'granted') return
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return
            const dist = haversineKm(
              { lat: coords[0], lon: coords[1] },
              { lat: pos.coords.latitude, lon: pos.coords.longitude }
            )
            if (dist <= NEAR_KM) setUnlockedByGeo(true)
          },
          () => {
            /* denied or unavailable — the trip-day rule still works */
          },
          { timeout: 8000 }
        )
      })
      .catch(() => {
        /* permissions API unsupported — the trip-day rule still works */
      })
    return () => {
      cancelled = true
    }
  }, [city, unlockedByDay])

  const cityQuests = quests.filter((q) => q.city === city)
  const doneCount = cityQuests.filter((q) => found[q.id] != null).length

  const markFound = (id: string) => {
    play('stamp')
    setFound((f) => ({ ...f, [id]: Date.now() }))
  }

  return (
    <section className="side-quests card">
      <div className="sq-title">
        Side Quests <span className="sq-title-jp">お宝探し</span>
      </div>

      {!unlocked && (
        <p className="sq-locked">Three secrets wait in {city} — they unlock when you arrive.</p>
      )}

      {unlocked && (
        <>
          <p className="sq-count">{doneCount} / 3 found</p>
          {cityQuests.map((q) => {
            const isDone = found[q.id] != null
            const isOpen = openId === q.id
            return (
              <div
                key={q.id}
                className={`sq-quest${isDone ? ' sq-done' : ''}`}
                onClick={() => !isDone && setOpenId(isOpen ? null : q.id)}
              >
                <div className="sq-row">
                  <span className="sq-quest-title">{q.title}</span>
                  <span className="sq-quest-jp">{q.jp}</span>
                  {isDone && (
                    <span className="sq-hanko" aria-label="Found">
                      印
                    </span>
                  )}
                </div>
                {isOpen && !isDone && (
                  <div className="sq-expand">
                    <p className="sq-hint">{q.hint}</p>
                    <button
                      className="sq-found"
                      onClick={(e) => {
                        e.stopPropagation()
                        markFound(q.id)
                      }}
                    >
                      Found it!
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {doneCount >= 2 && <p className="sq-look">Look at today’s painting…</p>}
        </>
      )}
    </section>
  )
}
