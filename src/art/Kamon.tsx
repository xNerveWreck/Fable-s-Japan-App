import type { Traveler } from '../data/travelers'

/**
 * 家紋 — the generative family crest. No picker, no settings: the crest is
 * composed from what the family already is. Each traveler's animal mascot
 * becomes one fold of a rotationally symmetric mon, stroked in their ink
 * color; every loved moment adds one petal to the ring between the
 * enclosure lines, so the crest is visibly fuller by Osaka than it was at
 * the airport. Deterministic — the same family state paints the same crest
 * on every phone once the ink converges.
 */

const TOKEN: Record<Traveler['color'], string> = {
  sakura: 'var(--sakura)',
  pine: 'var(--pine)',
  gold: 'var(--gold)',
  indigo: 'var(--indigo)',
}

/** Fold motifs on the stamps' 24×24 grid, centered at 12,12, facing up (outward).
 *  Geometric abstractions on purpose — a crest motif has to read at any rotation. */
const MOTIF: Record<string, React.ReactNode> = {
  fox: (
    // two sharp ears over a pointed face — the kitsune wedge
    <path
      d="M12 21 L5 13 L7 4 L11 9 L13 9 L17 4 L19 13 Z"
      fill="currentColor"
    />
  ),
  deer: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M9 20 q0 -8 -3 -12 q5 1 6 6" />
      <path d="M15 20 q0 -8 3 -12 q-5 1 -6 6" />
    </g>
  ),
  crane: (
    // tsuru-no-maru gesture: the wing sweep, a neck, a head dot
    <g fill="currentColor">
      <path d="M4 17 C7 6 15 3 21 4 C18 10 13 13 8 14 C6.5 15.5 5 16.5 4 17 Z" />
      <path d="M6 14 C3.5 10.5 4.5 7 8 5.5 C7 8.5 7 11.5 8 13.5 Z" opacity="0.9" />
      <circle cx="8.2" cy="4.6" r="1.6" />
    </g>
  ),
  crab: (
    // fan body, two heavy claws — the kani in three masses
    <g fill="currentColor">
      <path d="M5.5 14 Q12 9.5 18.5 14 Q17.5 20 12 20 Q6.5 20 5.5 14 Z" />
      <circle cx="5.2" cy="8.8" r="3.4" />
      <circle cx="18.8" cy="8.8" r="3.4" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7.5 13 L6 11 M16.5 13 L18 11" />
      </g>
    </g>
  ),
  rabbit: (
    <g fill="currentColor">
      <path d="M8 20 C5 12 6 6 9 3 C11 6 11 13 10 20 Z" />
      <path d="M16 20 C19 12 18 6 15 3 C13 6 13 13 14 20 Z" />
    </g>
  ),
  tanuki: (
    // the round belly, the leaf balanced on top
    <g fill="currentColor">
      <circle cx="12" cy="15" r="6.5" />
      <path d="M12 8.5 C10 3.5 13 0.5 16.5 0.5 C16.5 5 14.5 8 12 8.5 Z" />
    </g>
  ),
}

/** Five-petal blossom — the crest before the family has named itself. */
const BLOSSOM = (
  <g fill="currentColor">
    <circle cx="12" cy="6.5" r="3" />
    <circle cx="17.4" cy="10.4" r="3" />
    <circle cx="15.3" cy="16.6" r="3" />
    <circle cx="8.7" cy="16.6" r="3" />
    <circle cx="6.6" cy="10.4" r="3" />
  </g>
)

const PETAL_CAP = 36

export function Kamon({ travelers, loved, size = 72 }: { travelers: Traveler[]; loved: number; size?: number }) {
  const k = travelers.length
  const petals = Math.min(loved, PETAL_CAP)
  const label = k
    ? `The family kamon — ${k} travelers, ${loved} loved ${loved === 1 ? 'moment' : 'moments'}`
    : 'The family kamon, waiting for its travelers'

  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className="kamon" role="img" aria-label={label}>
      {/* the enclosure — a double maru, same hand as the eki-stamps */}
      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--ink)" strokeWidth="2.4" />
      <circle cx="48" cy="48" r="38.5" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />

      {/* fold dividers — the classical construction lines that bind the field */}
      {k >= 2 && (
        <g stroke="var(--ink)" strokeWidth="0.8" opacity="0.3">
          {Array.from({ length: k }, (_, i) => (
            <path
              key={i}
              d="M48 40 L48 11.5"
              transform={`rotate(${(360 / k) * (i + 0.5)} 48 48)`}
            />
          ))}
        </g>
      )}

      {/* one petal per loved moment, ringed between the enclosure lines */}
      <g fill="var(--sakura)">
        {Array.from({ length: petals }, (_, i) => (
          <path
            key={i}
            className="kamon-petal"
            d="M0 -3.2 C1.8 -1.4 1.5 1.1 0 3 C-1.5 1.1 -1.8 -1.4 0 -3.2 Z"
            transform={`rotate(${(360 / petals) * i} 48 48) translate(48 6.75)`}
          />
        ))}
      </g>

      {/* the folds — one traveler each, k-fold symmetry, facing outward */}
      {k === 0 && (
        <g transform="translate(36 36)" style={{ color: 'var(--sakura)' }}>
          {BLOSSOM}
        </g>
      )}
      {k === 1 && (
        <g className="kamon-motif" transform="translate(36 36)" style={{ color: TOKEN[travelers[0].color] }}>
          {MOTIF[travelers[0].animal] ?? BLOSSOM}
        </g>
      )}
      {k >= 2 &&
        travelers.map((t, i) => (
          <g
            key={t.id}
            className="kamon-motif"
            transform={`rotate(${(360 / k) * i} 48 48) translate(36 14)`}
            style={{ color: TOKEN[t.color] }}
          >
            {MOTIF[t.animal] ?? BLOSSOM}
          </g>
        ))}
      {/* the knot — the family's shared center */}
      {k >= 2 && (
        <g>
          <circle cx="48" cy="48" r="3.2" fill="var(--ink)" />
          <circle cx="48" cy="48" r="6.2" fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity="0.45" />
        </g>
      )}
    </svg>
  )
}
