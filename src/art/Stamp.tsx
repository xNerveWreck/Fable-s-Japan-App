import type { Day } from '../data/itinerary'

/**
 * Eki-stamps — station-stamp style badges, one earned per fully-resolved
 * day. Kanji day number, a motif from that day, the day's accent color.
 */

const kanjiNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四']

/** motif per day, drawn on a 24×24 grid */
const motifs: Record<number, React.ReactNode> = {
  1: <path d="M3 15 L14 11 L20 12 L21 13 L15 15 L17 20 L15 20 L11 15 L5 17 Z" fill="currentColor" />, // plane
  2: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="8" y="7" width="8" height="11" rx="3.5" />
      <path d="M6 7 H18 M6 18 H18 M12 3.5 V7" />
    </g>
  ), // lantern
  3: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M3.5 7 Q12 4.5 20.5 7" />
      <path d="M6 12 H18" />
      <path d="M7.5 8 V20 M16.5 8 V20" />
    </g>
  ), // torii
  4: (
    <g fill="currentColor">
      <circle cx="12" cy="6.5" r="3" />
      <circle cx="17.4" cy="10.4" r="3" />
      <circle cx="15.3" cy="16.6" r="3" />
      <circle cx="8.7" cy="16.6" r="3" />
      <circle cx="6.6" cy="10.4" r="3" />
    </g>
  ), // blossom
  5: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M3 10 q4.5 -5 9 0 q4.5 -5 9 0" />
      <path d="M3 16 q4.5 -5 9 0 q4.5 -5 9 0" />
    </g>
  ), // wave
  6: (
    <g fill="currentColor">
      <path d="M4 15 H20 L17 20 H7 Z" />
      <rect x="11" y="4" width="2" height="11" />
      <path d="M13.5 5 Q19 8 13.5 13 Z" />
    </g>
  ), // ship
  7: (
    <g fill="currentColor">
      <path d="M3 19 L12 5 L21 19 Z" opacity="0.55" />
      <path d="M8.8 10 L12 5 L15.2 10 Q12 12.5 8.8 10 Z" />
    </g>
  ), // mountain
  8: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6 L9 10 L15 10 L18 6 L19 12 Q19 18 12 20 Q5 18 5 12 Z" />
      <path d="M10 14 L12 15.5 L14 14" />
    </g>
  ), // fox
  9: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M9 4 V20 M9 9 H15 M9 15 H15" opacity="0.9" />
      <path d="M15.5 4 V20" />
    </g>
  ), // bamboo
  10: (
    <g fill="currentColor">
      <circle cx="12" cy="12" r="6.5" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M18.7 5.3 L17 7 M7 17 L5.3 18.7" />
      </g>
    </g>
  ), // sun
  11: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M9 20 q0 -8 -3 -12 q5 1 6 6" />
      <path d="M15 20 q0 -8 3 -12 q-5 1 -6 6" />
    </g>
  ), // antlers
  12: (
    <g fill="currentColor">
      <ellipse cx="12" cy="14" rx="6.5" ry="4.5" />
      <circle cx="5" cy="10" r="2.8" />
      <circle cx="19" cy="10" r="2.8" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M10 9.5 L9 6.5 M14 9.5 L15 6.5" />
      </g>
      <circle cx="9" cy="5.5" r="1.4" />
      <circle cx="15" cy="5.5" r="1.4" />
    </g>
  ), // crab
  13: (
    <g fill="currentColor">
      <path d="M4 12 Q10 5.5 16 12 Q10 18.5 4 12 Z" />
      <path d="M15.5 12 L21 8 L19.5 12 L21 16 Z" />
      <circle cx="8" cy="11" r="1.2" fill="var(--card)" />
    </g>
  ), // fish
  14: <path d="M15 3 A9.5 9.5 0 1 0 21 14.5 A8 8 0 0 1 15 3 Z" fill="currentColor" />, // moon
}

export function Stamp({ day, earned }: { day: Day; earned: boolean }) {
  const color = `var(--${day.color === 'sakura' ? 'sakura' : day.color === 'pine' ? 'pine' : day.color === 'gold' ? 'gold' : 'indigo'})`

  if (!earned) {
    return (
      <div className="stamp" title={`Day ${day.id} — not yet stamped`}>
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" fill="none" stroke="var(--ink-faint)" strokeWidth="1.6" strokeDasharray="3 5" opacity="0.6" />
          <text x="24" y="30" textAnchor="middle" fontSize="15" fill="var(--ink-faint)" opacity="0.4" style={{ fontFamily: 'var(--font-display)' }}>
            旅
          </text>
        </svg>
        <span className="stamp-label">Day {day.id}</span>
      </div>
    )
  }

  return (
    <div className="stamp earned" title={`Day ${day.id} — ${day.title}`}>
      <svg viewBox="0 0 48 48" style={{ color }}>
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <text
          x="24"
          y={day.id > 10 ? 20 : 21.5}
          textAnchor="middle"
          fontSize={day.id > 10 ? 9.5 : 12}
          fontWeight="700"
          fill="currentColor"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {kanjiNumbers[day.id - 1]}
        </text>
        <g transform="translate(12 24) scale(1)">{motifs[day.id]}</g>
      </svg>
      <span className="stamp-label">{day.cityJp}</span>
    </div>
  )
}
