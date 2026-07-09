import { useMemo } from 'react'

/**
 * Sakura petals drifting down over the hero. In dark mode the CSS turns the
 * same elements into falling snow. Deterministic pseudo-randomness keeps the
 * flurry stable across re-renders.
 */
export function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo(() => {
    // simple LCG so every visit sees the same gentle flurry
    let seed = 42
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.round(rand() * 100)}%`,
      size: 5 + rand() * 6,
      duration: 7 + rand() * 9,
      delay: -rand() * 16,
    }))
  }, [count])

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.85,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
