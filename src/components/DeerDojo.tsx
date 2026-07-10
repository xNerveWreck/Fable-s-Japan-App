import { useEffect, useRef, useState } from 'react'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'

type Action = 'bow' | 'offer' | 'retreat'
const ORDER: Action[] = ['bow', 'offer', 'retreat']

const RANKS = [
  { min: 15, name: 'Deer Whisperer 鹿の声を聞く者' },
  { min: 7, name: 'Senbei Sensei 煎餅先生' },
  { min: 3, name: 'Polite Guest 礼儀正しい客' },
  { min: 1, name: 'Nervous Envoy 緊張の使者' },
]
const THRESHOLDS = [1, 3, 7, 15]

function rankFor(n: number) {
  return RANKS.find((r) => n >= r.min) ?? null
}

/** Whichever move the family skipped is the one the correction names —
 *  the story test greps for "bow", and a real deer would too. */
function wrongNote(expected: Action): string {
  switch (expected) {
    case 'bow':
      return 'The deer eyes your map hungrily — always bow first.'
    case 'offer':
      return 'Manners, please — offer the senbei before you back away.'
    case 'retreat':
      return 'Not yet — step back slowly, or the deer follows you home.'
  }
}

const START_NOTE = 'Bow, then offer, then step back slowly — the shika-senbei way.'
const DONE_NOTE = 'A perfect exchange. The deer dips its head in thanks.'

/**
 * The Nara day's practice dojo — rehearse the shika-senbei protocol the
 * night before, or use the same card as a live exchange log among real
 * deer the next morning. The deer is built from the same shape vocabulary
 * as the Nara vignette (see src/art/Vignettes.tsx), just larger and alone.
 * Exchange count syncs between phones (see TripState.deer in sync.ts).
 */
export function DeerDojo() {
  const [exchanges, setExchanges] = useStored<number>('deer', 0)
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [note, setNote] = useState(START_NOTE)
  const [bowing, setBowing] = useState(false)
  const [wobble, setWobble] = useState(false)
  const bowTimer = useRef<number | undefined>(undefined)
  const wobbleTimer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      clearTimeout(bowTimer.current)
      clearTimeout(wobbleTimer.current)
    },
    []
  )

  const press = (action: Action) => {
    const expected = ORDER[step]
    if (action !== expected) {
      setStep(0)
      setNote(wrongNote(expected))
      setWobble(true)
      clearTimeout(wobbleTimer.current)
      wobbleTimer.current = window.setTimeout(() => setWobble(false), 500)
      return
    }
    if (step === 2) {
      // the full bow → offer → step-back cycle just closed
      setExchanges((n) => n + 1)
      setNote(DONE_NOTE)
      setBowing(true)
      play('loved')
      clearTimeout(bowTimer.current)
      bowTimer.current = window.setTimeout(() => setBowing(false), 1400)
      setStep(0)
    } else {
      setStep((s) => ((s + 1) as 0 | 1 | 2))
    }
  }

  const rank = rankFor(exchanges)
  const nextAt = THRESHOLDS.find((t) => exchanges < t)

  return (
    <section className="deer-dojo card">
      <div className="dd-title">
        Deer Dojo <span className="dd-title-jp">鹿の作法</span>
      </div>

      <svg
        className={`dd-stage${bowing ? ' dd-bowing' : ''}${wobble ? ' dd-wobble' : ''}`}
        viewBox="0 0 200 120"
        role="img"
        aria-label="A deer practicing the shika-senbei bow"
      >
        {/* body, legs, tail — same recipe as the Nara vignette deer */}
        <g fill="var(--art-silhouette)">
          <ellipse cx="90" cy="62" rx="34" ry="16" />
          <rect x="64" y="72" width="7" height="30" rx="3" />
          <rect x="78" y="78" width="7" height="24" rx="3" />
          <rect x="98" y="78" width="7" height="24" rx="3" />
          <rect x="112" y="72" width="7" height="30" rx="3" />
          <circle cx="54" cy="56" r="5" />
        </g>

        {/* head + neck + antlers rotate together for the bow */}
        <g className="dd-head">
          <g fill="var(--art-silhouette)">
            <path d="M120 62 L132 56 L150 24 L138 18 L112 54 Z" />
            <ellipse cx="146" cy="28" rx="13" ry="10" transform="rotate(18 146 28)" />
            <ellipse cx="162" cy="34" rx="7.5" ry="5.5" transform="rotate(18 162 34)" />
            <path d="M134 18 q-12 -9 -18 -6 q2 9 15 12 z" />
          </g>
          <g stroke="var(--art-silhouette)" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M150 20 q0 -12 -6 -16" />
            <path d="M146 8 q-9 -1 -13 -8" />
            <path d="M148 12 q8 -6 9 -12" />
          </g>
        </g>

        {/* deer spots */}
        <g fill="var(--art-snow)" opacity="0.85">
          <circle cx="70" cy="58" r="2.6" />
          <circle cx="84" cy="66" r="2.6" />
          <circle cx="98" cy="58" r="2.6" />
        </g>

        {/* the offered cracker, only visible mid-offer */}
        {step === 2 && <circle className="dd-senbei" cx="178" cy="40" r="6" fill="var(--art-lantern)" />}
      </svg>

      <div className="dd-buttons">
        <button className="dd-bow" onClick={() => press('bow')}>
          礼 Bow
        </button>
        <button className="dd-offer" onClick={() => press('offer')}>
          煎餅 Offer
        </button>
        <button className="dd-retreat" onClick={() => press('retreat')}>
          下がる Step back
        </button>
      </div>

      <p className="dd-note">{note}</p>

      <div className="dd-status">
        <span className="dd-count">{exchanges} exchanges</span>
        <span className="dd-rank">{rank ? rank.name : 'No rank yet'}</span>
      </div>
      {nextAt != null && <p className="dd-hint">{nextAt - exchanges} more for the next rank</p>}
    </section>
  )
}
