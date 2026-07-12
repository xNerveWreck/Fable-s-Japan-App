import { useState } from 'react'
import { itinerary, TRIP_LENGTH, type Day } from '../data/itinerary'
import { haiku } from '../data/haiku'
import { useStored } from '../hooks/useStored'
import type { Moment } from '../lib/sync'
import { TanzakuScroll } from '../components/TanzakuScroll'
import { Denshadex } from '../components/Denshadex'
import { TrainQuiz } from '../components/TrainQuiz'
import { Stamp } from '../art/Stamp'
import { Kamon } from '../art/Kamon'
import type { Traveler } from '../data/travelers'
import { ChevronIcon } from '../art/icons'

/**
 * The Treasures shelf — everything the trip gives you, in one place:
 * eki-stamps, loved moments with their engraved haiku (and the tanzaku
 * scroll), the Denshadex, and the Train Quiz. Journey stays the plan;
 * this tab is what the plan turns into.
 */

type MomentMap = Record<string, Moment>

const dayIsComplete = (day: Day, moments: MomentMap) =>
  day.activities.every((_, i) => moments[`d${day.id}:${i}`])

export function Treasures({ nav }: { nav: (p: string) => void }) {
  const [moments] = useStored<MomentMap>('moments', {})
  const [travelers] = useStored<Traveler[]>('travelers', [])
  const [unrolled, setUnrolled] = useState(false)

  const stampsEarned = itinerary.filter((d) => dayIsComplete(d, moments)).length
  const loved = itinerary.flatMap((day) =>
    day.activities
      .map((act, i) => ({ day, act, key: `d${day.id}:${i}` }))
      .filter(({ key }) => moments[key] === 'loved')
  )

  const openDay = (id: number) => nav(`journey/${id}`)

  return (
    <div className="screen">
      <header className="screen-head kamon-row">
        <div className="grow">
          <div className="t-kicker">Collection · あつめ</div>
          <h1>Treasures</h1>
          <p className="sub">Everything the trip gives you — stamps, poems, trains, and bragging rights.</p>
        </div>
        <Kamon travelers={travelers} loved={loved.length} size={64} />
      </header>

      <div className="section-title">
        <h2>Stamp journal</h2>
        <span className="jp">判子帳 · {stampsEarned}/{TRIP_LENGTH}</span>
      </div>
      <div className="card stamp-grid-wrap">
        <p className="stamp-hint">
          Resolve every stop in a day — did it, loved it, or skipped it — and the day’s eki-stamp lands here.
        </p>
        <div className="stamp-grid">
          {itinerary.map((d) => (
            <Stamp key={d.id} day={d} earned={dayIsComplete(d, moments)} />
          ))}
        </div>
      </div>

      <div className="section-title">
        <h2>Loved moments</h2>
        <span className="jp">宝物 · treasures</span>
        {loved.length > 0 && (
          <button className="scroll-btn" onClick={() => setUnrolled(true)}>
            短冊 · unroll
          </button>
        )}
      </div>
      {loved.length > 0 ? (
        <div className="card" style={{ padding: '4px 16px' }}>
          {loved.map(({ day, act, key }) => (
            <button key={key} className="treasure-row" onClick={() => openDay(day.id)}>
              <span className="heart">♥</span>
              <span className="grow">
                <span className="t-title">{act.title}</span>
                <span className="t-sub">
                  Day {day.id} · {day.city}
                </span>
                {haiku[key] && (
                  <span className="t-haiku">
                    {haiku[key].split('\n').map((line, li) => (
                      <i key={li}>{line}</i>
                    ))}
                  </span>
                )}
              </span>
              <span className="chev" style={{ width: 18, height: 18, color: 'var(--ink-faint)' }}>
                <ChevronIcon />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '14px 16px' }}>
          <p className="pocket-hint" style={{ marginTop: 0 }}>
            Tap ♥ on any stop of the journey and it gathers here — each loved moment arrives with its own
            engraved poem.
          </p>
        </div>
      )}
      {unrolled && <TanzakuScroll moments={moments} onClose={() => setUnrolled(false)} />}

      <div className="section-title">
        <h2>Denshadex</h2>
        <span className="jp">乗った電車</span>
      </div>
      <Denshadex />

      <div className="section-title">
        <h2>Train Quiz</h2>
        <span className="jp">クイズ</span>
      </div>
      <TrainQuiz />
    </div>
  )
}
