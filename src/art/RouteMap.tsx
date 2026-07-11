import { itinerary } from '../data/itinerary'
import type { Moment } from '../lib/sync'

/**
 * The journey as a single brushstroke. Four cities along the road and the
 * long arc home; when every day in a city is fully resolved, a red hanko
 * stamp lands on it. (Days spent in the sky belong to no city.)
 */

const cities = [
  { name: 'Tokyo', jp: '東京', kanji: '東', x: 48, y: 96 },
  { name: 'Kyoto', jp: '京都', kanji: '京', x: 178, y: 90 },
  { name: 'Nara', jp: '奈良', kanji: '奈', x: 254, y: 68 },
  { name: 'Osaka', jp: '大阪', kanji: '大', x: 336, y: 92 },
]

export function RouteMap({ moments }: { moments: Record<string, Moment> }) {
  const progress = cities.map((c) => {
    const days = itinerary.filter((d) => d.city === c.name)
    const done = days.filter((d) => d.activities.every((_, i) => moments[`d${d.id}:${i}`])).length
    return { ...c, days: days.length, done }
  })

  return (
    <svg viewBox="0 0 390 150" role="img" aria-label="Route map: Tokyo to Osaka and back" style={{ display: 'block', width: '100%' }}>
      {/* Fuji, keeping watch between Tokyo and Kyoto — the shinkansen really does pass it */}
      <path d="M85 66 L113 38 L141 66 Z" fill="var(--art-mtn-near)" opacity="0.7" />
      <path d="M104 47 L113 38 L122 47 Q113 52 104 47 Z" fill="var(--paper)" />

      {/* the road, one brushstroke */}
      <path
        d="M18 104 C40 98 60 92 88 86 C126 78 148 96 178 90 C214 84 228 62 254 68 C288 76 304 98 336 92 C350 90 360 90 372 92"
        fill="none"
        stroke="var(--art-silhouette)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M18 104 C40 98 60 92 88 86 C126 78 148 96 178 90 C214 84 228 62 254 68 C288 76 304 98 336 92 C350 90 360 90 372 92"
        fill="none"
        stroke="var(--paper)"
        strokeWidth="1.4"
        strokeDasharray="1 10"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* the way back — a dashed arc over Fuji, Osaka to Tokyo */}
      <path
        d="M336 84 C296 26 128 22 52 86"
        fill="none"
        stroke="var(--art-silhouette)"
        strokeWidth="2"
        strokeDasharray="4 7"
        strokeLinecap="round"
        opacity="0.45"
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
