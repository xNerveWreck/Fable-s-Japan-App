import { useState } from 'react'
import { guideSections } from '../data/guide'
import { dishes, kidMeterLabel } from '../data/food'
import { ChevronIcon } from '../art/icons'

const tabs = [
  ...guideSections.map((s) => ({ id: s.id, label: `${s.emoji} ${s.name}` })),
  { id: 'food', label: '🍜 Food' },
]

export function Discover() {
  const [tab, setTab] = useState<string>(guideSections[0].id)
  const section = guideSections.find((s) => s.id === tab)

  return (
    <div className="screen">
      <header className="screen-head">
        <div className="t-kicker">Field guide · 案内</div>
        <h1>Discover</h1>
        <p className="sub">How Japan works, and what to eat while it does.</p>
      </header>

      <div className="seg" style={{ marginTop: 14 }}>
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {section ? (
        <>
          <p className="guide-intro">{section.intro}</p>
          <div className="guide-list">
            {section.entries.map((entry) => (
              <details key={entry.id} className="card guide-card">
                <summary>
                  <h3>{entry.title}</h3>
                  {entry.jp && <span className="jp">{entry.jp}</span>}
                  <span className="twist">
                    <ChevronIcon />
                  </span>
                </summary>
                <div className="body">
                  {entry.body}
                  {entry.kidNote && (
                    <div className="kid-tip">
                      <span>🦊</span>
                      <span>
                        <b>For the kids:</b> {entry.kidNote}
                      </span>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      ) : (
        <FoodGuide />
      )}
    </div>
  )
}

function FoodGuide() {
  const sorted = [...dishes].sort((a, b) => b.kidMeter - a.kidMeter)
  return (
    <>
      <p className="guide-intro">
        Twenty things worth a chopstick. The petals show the kid-meter — five means the kids will fight over it, one
        is an adventurer’s badge.
      </p>
      <div className="dish-grid">
        {sorted.map((dish) => (
          <div key={dish.id} className="card dish-card">
            <div className="head">
              <h3>{dish.name}</h3>
              <span className="jp">{dish.jp}</span>
              <span className="kid-meter" aria-label={`Kid meter ${dish.kidMeter} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={n <= dish.kidMeter ? 'on' : ''} />
                ))}
              </span>
            </div>
            <p className="desc">{dish.desc}</p>
            <div className="meter-row">{kidMeterLabel[dish.kidMeter]}</div>
            <div className="where">📍 {dish.where}</div>
          </div>
        ))}
      </div>
    </>
  )
}
