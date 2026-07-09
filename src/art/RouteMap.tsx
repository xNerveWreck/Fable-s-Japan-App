import { itinerary } from '../data/itinerary'
import type { Moment } from '../lib/sync'

/**
 * The journey as a single brushstroke. Five cities along the road; when
 * every day in a city is fully resolved, a red hanko stamp lands on it.
 */

const cities = [
  { name: 'Tokyo', jp: '東京', kanji: '東', x: 42, y: 96 },
  { name: 'Hakone', jp: '箱根', kanji: '箱', x: 118, y: 74 },
  { name: 'Kyoto', jp: '京都', kanji: '京', x: 200, y: 92 },
  { name: 'Nara', jp: '奈良', kanji: '奈', x: 274, y: 70 },
  { name: 'Osaka', jp: '大阪', kanji: '大', x: 348, y: 90 },
]

export function RouteMap({ moments }: { moments: Record<string, Moment> }) {
  const progress = cities.map((c) => {
    const days = itinerary.filter((d) => d.city === c.name)
    const done = days.filter((d) => d.activities.every((_, i) => moments[`d${d.id}:${i}`])).length
    return { ...c, days: days.length, done }
  })

  return (
    <svg viewBox="0 0 390 150" role="img" aria-label="Route map: Tokyo to Osaka" style={{ display: 'block', width: '100%' }}>
      {/* Fuji, keeping watch between Tokyo and Hakone */}
      <path d="M52 62 L80 34 L108 62 Z" fill="var(--art-mtn-near)" opacity="0.7" />
      <path d="M71 43 L80 34 L89 43 Q80 48 71 43 Z" fill="var(--paper)" />

      {/* the road, one brushstroke */}
      <path
        d="M20 106 C60 84 92 66 118 74 C156 86 168 102 200 92 C236 80 246 62 274 70 C306 78 320 100 366 88"
        fill="none"
        stroke="var(--art-silhouette)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M20 106 C60 84 92 66 118 74 C156 86 168 102 200 92 C236 80 246 62 274 70 C306 78 320 100 366 88"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="1.4"
        strokeDasharray="1 10"
        strokeLinecap="round"
        opacity="0.9"
      />

      {progress.map((c, i) => {
        const complete = c.done === c.days
        const labelAbove = c.y > 85
        return (
          <g key={c.name}>
            {complete ? (
              <g transform={`translate(${c.x} ${c.y}) rotate(${i % 2 ? 4 : -5})`}>
                <rect x="-13" y="-13" width="26" height="26" rx="6" fill="var(--vermillion)" />
                <text
                  y="6"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="700"
                  fill="var(--paper)"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {c.kanji}
                </text>
              </g>
            ) : (
              <>
                <circle cx={c.x} cy={c.y} r="7.5" fill="var(--paper)" stroke="var(--art-silhouette)" strokeWidth="2.5" />
                {c.done > 0 && <circle cx={c.x} cy={c.y} r="3.5" fill="var(--sakura)" />}
              </>
            )}
            <text
              x={c.x}
              y={labelAbove ? c.y + 30 : c.y - 30}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="600"
              fill="var(--ink)"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {c.name}
            </text>
            <text
              x={c.x}
              y={labelAbove ? c.y + 43 : c.y - 18}
              textAnchor="middle"
              fontSize="9"
              fill="var(--ink-faint)"
              letterSpacing="1.5"
            >
              {complete ? c.jp : `${c.done}/${c.days}日`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
