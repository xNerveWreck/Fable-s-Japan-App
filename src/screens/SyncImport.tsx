import { useMemo, useState } from 'react'
import { decodeState, mergeState } from '../lib/sync'

/**
 * Landing screen for a family-sync link. Shows what the other phone is
 * carrying, merges on confirm, then reloads into the combined trip.
 */
export function SyncImport({ payload, nav }: { payload: string; nav: (p: string, replace?: boolean) => void }) {
  const incoming = useMemo(() => decodeState(payload), [payload])
  const [merged, setMerged] = useState(false)

  const doMerge = () => {
    if (!incoming) return
    mergeState(incoming)
    setMerged(true)
    setTimeout(() => {
      nav('journey', true)
      location.reload()
    }, 900)
  }

  return (
    <div className="screen">
      <header className="screen-head">
        <div className="t-kicker">Family sync · 同期</div>
        <h1>{merged ? 'Merged! 🌸' : incoming ? 'Trip state received' : 'Hmm.'}</h1>
      </header>

      {!incoming && (
        <>
          <p className="guide-intro">
            This sync link didn’t decode — it may have been cut off by the messenger. Ask for it to be re-shared, or
            paste the full link in the Kit tab.
          </p>
          <button className="show-card-btn" onClick={() => nav('journey', true)}>
            Back to the journey
          </button>
        </>
      )}

      {incoming && !merged && (
        <>
          <p className="guide-intro">Another phone in the family shared its trip. Here’s what it’s carrying:</p>
          <div className="card" style={{ padding: '8px 16px' }}>
            <div className="budget-line">
              <span className="label">Moments resolved</span>
              <span className="amount">{Object.keys(incoming.moments).length}</span>
            </div>
            <div className="budget-line">
              <span className="label">— loved</span>
              <span className="amount">{Object.values(incoming.moments).filter((m) => m === 'loved').length}</span>
            </div>
            <div className="budget-line">
              <span className="label">Items packed</span>
              <span className="amount">{Object.values(incoming.packed).filter(Boolean).length}</span>
            </div>
            <div className="budget-line">
              <span className="label">Starred phrases</span>
              <span className="amount">{incoming.favs.length}</span>
            </div>
            <div className="budget-line">
              <span className="label">Reservations</span>
              <span className="amount">{Object.values(incoming.reservations).reduce((n, l) => n + l.length, 0)}</span>
            </div>
            {incoming.departure && (
              <div className="budget-line">
                <span className="label">Departure</span>
                <span className="amount">{incoming.departure}</span>
              </div>
            )}
          </div>
          <p className="guide-intro">
            Merging is additive — nothing on this phone is lost. Loved beats done, packed stays packed, favorites
            join up.
          </p>
          <button className="show-card-btn pressable" onClick={doMerge}>
            Merge into this phone
          </button>
          <button
            className="show-card-btn"
            style={{ background: 'var(--paper-deep)', color: 'var(--ink-soft)', marginTop: 8 }}
            onClick={() => nav('journey', true)}
          >
            Not now
          </button>
        </>
      )}

      {merged && <p className="empty-note">Two phones, one journey. Reloading…</p>}
    </div>
  )
}
