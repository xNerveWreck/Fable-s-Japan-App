import { useState } from 'react'
import { trains } from '../data/trains'
import { TrainArt } from '../art/Trains'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'

/** One collectible card per train this trip actually rides. Grey silhouette
 *  until logged; 乗った! floods the card with ink. Rides sync between phones
 *  (see TripState.densha in src/lib/sync.ts). */
export function Denshadex() {
  const [rides, setRides] = useStored<Record<string, number>>('densha', {})
  const [open, setOpen] = useState<string | null>(null)

  const log = (id: string) => {
    play('stamp')
    setRides((r) => ({ ...r, [id]: Date.now() }))
  }

  return (
    <div className="dx-grid">
      {trains.map((t) => {
        const rodeAt = rides[t.id]
        const logged = rodeAt != null
        const expanded = open === t.id
        return (
          <div
            key={t.id}
            className={`card dx-card${logged ? ' dx-logged' : ' dx-locked'}`}
            data-train={t.id}
            onClick={() => setOpen(expanded ? null : t.id)}
          >
            <div className="dx-art">
              <TrainArt id={t.id} />
            </div>
            <div className="dx-name">{t.name}</div>
            <div className="dx-jp">{t.jp}</div>
            <div className="dx-rarity" aria-label={`Rarity ${t.rarity} of 3`}>
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= t.rarity ? 'on' : ''} />
              ))}
            </div>
            {expanded && (
              <div className="dx-detail">
                <p className="dx-line">{t.line}</p>
                <p className="dx-stats">
                  {t.topKmh} km/h · debut {t.debut}
                </p>
                <p className="dx-blurb">{t.blurb}</p>
                <p className="dx-kidfact">
                  <b>Spot it:</b> {t.kidFact}
                </p>
                {logged ? (
                  <p className="dx-date">乗った! {new Date(rodeAt).toLocaleDateString()}</p>
                ) : (
                  <button
                    className="dx-log"
                    onClick={(e) => {
                      e.stopPropagation()
                      log(t.id)
                    }}
                  >
                    乗った! I rode it!
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
