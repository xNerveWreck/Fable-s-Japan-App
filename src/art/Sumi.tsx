import { useEffect, useRef, useState } from 'react'
import { currentCity } from '../lib/solar'
import { play } from '../lib/sound'

/**
 * 墨 — Sumi, the ink spirit. A fox-tanuki blob painted in three
 * brushstrokes (body, ears, tail) that lives above the tab bar on every
 * screen. It breathes while the family plans, sleeps after dark on the
 * solar clock (the `data-phase` attribute the palette already stamps),
 * does a joyful blot-splash whenever a moment is loved anywhere in the
 * app, and wears antlers on the Nara day. Petting it works too.
 * Pure CSS animation; reduced motion stills it entirely.
 */
export function Sumi() {
  const [joy, setJoy] = useState(false)
  const [, tick] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const burst = () => {
    window.clearTimeout(timer.current)
    setJoy(false)
    // double-rAF so a re-love mid-splash restarts the hop cleanly
    requestAnimationFrame(() => requestAnimationFrame(() => setJoy(true)))
    timer.current = window.setTimeout(() => setJoy(false), 1600)
  }

  useEffect(() => {
    const onLoved = () => burst()
    window.addEventListener('tabi:loved', onLoved)
    const t = window.setInterval(() => tick((n) => n + 1), 10 * 60_000) // the city changes at midnight
    return () => {
      window.removeEventListener('tabi:loved', onLoved)
      window.clearInterval(t)
      window.clearTimeout(timer.current)
    }
  }, [])

  const antlers = currentCity() === 'Nara'

  return (
    <button
      className={`sumi${joy ? ' sumi-joy' : ''}`}
      aria-label="Sumi, the ink spirit"
      onClick={() => {
        play('tap')
        burst()
      }}
    >
      <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" focusable="false">
        {antlers && (
          <g className="sumi-antlers" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M26.5 9.5 C25.5 6 24.5 3.5 22.5 1.5 M24.9 5.2 C23.2 4.2 21.6 4 20 4.4" />
            <path d="M37.5 9.5 C38.5 6 39.5 3.5 41.5 1.5 M39.1 5.2 C40.8 4.2 42.4 4 44 4.4" />
          </g>
        )}

        {/* stroke two: the ears */}
        <path className="sumi-ear-l" d="M25.5 14.5 C23 9.5 21.5 6 21 3.5 C25 5.5 28 8 29.8 11.2 Z" fill="var(--ink)" />
        <path className="sumi-ear-r" d="M38.5 14.5 C41 9.5 42.5 6 43 3.5 C39 5.5 36 8 34.2 11.2 Z" fill="var(--ink)" />

        {/* stroke three: the tail swish */}
        <path
          className="sumi-tail"
          d="M47 45 C53 44.5 57 40.5 58 35 C60 41 57 47.5 51.5 50.5 C49.5 51.5 47.5 51.5 46 50.5 Z"
          fill="var(--ink)"
        />

        {/* stroke one: the body — head melting into a sitting drop of ink */}
        <path
          d="M32 11 C37.5 11 41.5 15 41.5 20.5 C41.5 23.5 40 26.5 38 28.5 C44.5 31.5 48.5 37.5 48.5 44 C48.5 51 41 55 32 55 C23 55 15.5 51 15.5 44 C15.5 37.5 19.5 31.5 26 28.5 C24 26.5 22.5 23.5 22.5 20.5 C22.5 15 26.5 11 32 11 Z"
          fill="var(--ink)"
        />

        {/* the face — paper showing through the ink */}
        <circle className="sumi-eye" cx="27.5" cy="20.5" r="1.9" fill="var(--paper)" />
        <circle className="sumi-eye" cx="36.5" cy="20.5" r="1.9" fill="var(--paper)" />
        <g className="sumi-lid" fill="none" stroke="var(--paper)" strokeWidth="1.6" strokeLinecap="round">
          <path d="M25.5 20.5 Q27.5 22.5 29.5 20.5" />
          <path d="M34.5 20.5 Q36.5 22.5 38.5 20.5" />
        </g>

        {/* the night wisp */}
        <g className="sumi-zz" fill="none" stroke="var(--ink-faint)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 15 h4.5 l-4.5 4.5 h4.5" />
          <path d="M52 7 h3.2 l-3.2 3.2 h3.2" />
        </g>

        {/* the joy splash — four droplets that only fly while .sumi-joy is on */}
        <g>
          <circle className="sumi-drop" cx="24" cy="16" r="2.1" fill="var(--ink)" />
          <circle className="sumi-drop" cx="40" cy="16" r="1.8" fill="var(--ink)" />
          <circle className="sumi-drop" cx="20" cy="28" r="1.6" fill="var(--ink)" />
          <circle className="sumi-drop" cx="44" cy="28" r="2" fill="var(--ink)" />
        </g>
      </svg>
    </button>
  )
}
