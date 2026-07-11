import { itinerary } from '../data/itinerary'
import { haiku } from '../data/haiku'
import type { Moment } from '../lib/sync'

/** The flight-home payoff: every loved poem unrolled on one washi strip. */
export function TanzakuScroll({
  moments,
  onClose,
}: {
  moments: Record<string, Moment>
  onClose: () => void
}) {
  const loved = itinerary.flatMap((day) =>
    day.activities
      .map((act, i) => ({ day, act, key: `d${day.id}:${i}` }))
      .filter(({ key }) => moments[key] === 'loved' && haiku[key])
  )

  return (
    <div className="tanzaku" role="dialog" aria-label="The tanzaku scroll">
      <div className="tz-strip">
        <div className="tz-head">
          <span className="jp">短冊</span>
          <h2>The trip, written as poetry</h2>
        </div>
        {loved.map(({ day, act, key }) => (
          <div key={key} className="tz-poem">
            <div className="tz-mark">
              Day {day.id} · {day.city} — {act.title}
            </div>
            {haiku[key].split('\n').map((line, li) => (
              <div key={li} className="tz-line">
                {line}
              </div>
            ))}
          </div>
        ))}
        <div className="tz-seal" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle cx="20" cy="20" r="18" fill="var(--vermillion)" opacity="0.9" />
            <text x="20" y="26" textAnchor="middle" fontSize="15" fill="var(--paper)">
              旅
            </text>
          </svg>
        </div>
      </div>
      <button className="tz-close" onClick={onClose}>
        Roll it up
      </button>
    </div>
  )
}
