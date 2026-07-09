/** Custom stroke icons — torii, fan, speech, pack — drawn to one 26px grid. */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function ToriiIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke} fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.18 : 0}>
        <path d="M3 6.5 Q13 4.5 23 6.5 L21.5 9 H4.5 Z" />
        <path d="M5.5 13 H20.5" />
        <path d="M7.5 9 V22" />
        <path d="M18.5 9 V22" />
        <path d="M13 9 V13" />
      </g>
    </svg>
  )
}

export function FanIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke} fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.18 : 0}>
        <path d="M13 21 L5.2 7.6 A15 15 0 0 1 20.8 7.6 Z" />
        <path d="M13 21 L9.8 5.4" />
        <path d="M13 21 L16.2 5.4" />
        <path d="M13 21 V23.5" />
      </g>
    </svg>
  )
}

export function SpeechIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke} fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.18 : 0}>
        <path d="M4 6.5 Q4 4 6.5 4 H19.5 Q22 4 22 6.5 V14.5 Q22 17 19.5 17 H12 L7 21.5 V17 H6.5 Q4 17 4 14.5 Z" />
      </g>
      <text
        x="13"
        y="13.6"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        あ
      </text>
    </svg>
  )
}

export function PackIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke} fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.18 : 0}>
        <path d="M9 7.5 V6 Q9 3.5 13 3.5 Q17 3.5 17 6 V7.5" />
        <rect x="4.5" y="7.5" width="17" height="14.5" rx="4" />
        <path d="M4.5 13 H21.5" />
        <path d="M13 13 V16" />
      </g>
    </svg>
  )
}

/** Small utility icons used across screens. */

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke}>
        <path d="M5 10.5 H8.5 L13.5 6 V20 L8.5 15.5 H5 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M17 9.5 Q19.5 13 17 16.5" />
        <path d="M19.5 7 Q23.5 13 19.5 19" />
      </g>
    </svg>
  )
}

export function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <path
        {...stroke}
        fill={filled ? 'currentColor' : 'none'}
        d="M13 3.8 L15.8 9.6 L22 10.5 L17.5 15 L18.6 21.4 L13 18.3 L7.4 21.4 L8.5 15 L4 10.5 L10.2 9.6 Z"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <path {...stroke} strokeWidth={2.6} d="M5.5 13.5 L10.5 18.5 L20.5 7.5" />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <path {...stroke} d="M10 6 L17 13 L10 20" />
    </svg>
  )
}

export function BackIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <path {...stroke} strokeWidth={2.2} d="M16 5.5 L8.5 13 L16 20.5" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <path {...stroke} strokeWidth={2.2} d="M13 5.5 V20.5 M5.5 13 H20.5" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <g {...stroke}>
        <path d="M5 7.5 H21" />
        <path d="M10 7.5 V5.5 Q10 4.5 11 4.5 H15 Q16 4.5 16 5.5 V7.5" />
        <path d="M7 7.5 L8 21 Q8.1 22 9 22 H17 Q17.9 22 18 21 L19 7.5" />
      </g>
    </svg>
  )
}
