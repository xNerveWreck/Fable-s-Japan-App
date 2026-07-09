import { useEffect, useMemo, useState } from 'react'
import { itinerary, kindMeta, TRIP_LENGTH, type Day } from '../data/itinerary'
import { useStored } from '../hooks/useStored'
import { InkHero } from '../art/InkHero'
import { Petals } from '../art/Petals'
import { BackIcon, CheckIcon, ChevronIcon } from '../art/icons'

type CheckedMap = Record<string, boolean>

/** Days from today (local, date-only) to the stored departure date. */
function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dep = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((dep.getTime() - today.getTime()) / 86400000)
}

export function Journey() {
  const [openDayId, setOpenDayId] = useState<number | null>(null)
  const [departure, setDeparture] = useStored<string>('departure', '')
  const [checked, setChecked] = useStored<CheckedMap>('checked', {})

  // navigating between the list and a day always starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [openDayId])

  const totalActivities = useMemo(() => itinerary.reduce((n, d) => n + d.activities.length, 0), [])
  const doneCount = Object.values(checked).filter(Boolean).length

  const openDay = openDayId !== null ? itinerary.find((d) => d.id === openDayId) : undefined
  if (openDay) {
    return (
      <DayDetail
        day={openDay}
        checked={checked}
        onToggle={(key) => setChecked((c) => ({ ...c, [key]: !c[key] }))}
        onBack={() => setOpenDayId(null)}
      />
    )
  }

  const until = departure ? daysUntil(departure) : null
  const tripDay = until !== null && until <= 0 ? 1 - until : null

  let countTitle: string
  let countSub: string
  if (until === null) {
    countTitle = 'When do you fly?'
    countSub = 'Set your departure day and Tabi keeps count with you.'
  } else if (until > 0) {
    countTitle = until === 1 ? 'Tomorrow. It’s tomorrow!' : `${until} days until Japan`
    countSub = 'Passports, excitement, and one last packing check.'
  } else if (tripDay !== null && tripDay <= TRIP_LENGTH) {
    const today = itinerary[Math.min(tripDay, TRIP_LENGTH) - 1]
    countTitle = `Day ${tripDay} — ${today.title}`
    countSub = `${today.city} ${today.cityJp} · tap today’s card below`
  } else {
    countTitle = 'Okaeri — welcome home'
    countSub = 'The trip lives in the checkmarks now. Start the "next time" list.'
  }

  return (
    <div className="screen" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="hero">
        <div className="hero-safe-top" />
        <div className="hero-art">
          <InkHero />
          <Petals count={14} />
        </div>
        <div className="hero-title">
          <div className="jp-big">た び</div>
          <h1>Tabi</h1>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="card countdown">
          <div className="hanko">{tripDay !== null && tripDay <= TRIP_LENGTH ? `日${tripDay}` : '旅'}</div>
          <div className="grow">
            <h2>{countTitle}</h2>
            <div className="sub">{countSub}</div>
            {until === null && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="date"
                  aria-label="Departure date"
                  onChange={(e) => e.target.value && setDeparture(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="card progress-wrap">
          <div className="row">
            <span className="t-kicker">Moments collected</span>
            <span className="grow" />
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
              {doneCount} / {totalActivities}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(doneCount / totalActivities) * 100}%` }} />
          </div>
        </div>

        <div className="section-title">
          <h2>Fourteen days</h2>
          <span className="jp">東京 → 箱根 → 京都 → 奈良 → 大阪</span>
        </div>

        <div className="day-list">
          {itinerary.map((day) => {
            const dayDone = day.activities.filter((_, i) => checked[`d${day.id}:${i}`]).length
            const isToday = tripDay === day.id
            return (
              <button key={day.id} className="card day-card pressable" onClick={() => setOpenDayId(day.id)}>
                <span className={`spine spine-${day.color}`} />
                <span className="body">
                  <span className={`day-eyebrow text-${day.color}`}>
                    Day {day.id} · {day.city}
                    <span className="city-jp">{day.cityJp}</span>
                    {isToday && <span className="chip chip-sakura">Today</span>}
                  </span>
                  <h3>{day.title}</h3>
                  <span className="theme">{day.theme}</span>
                  <span className="meta">
                    <span className="chip chip-indigo">{day.activities.length} stops</span>
                    {dayDone > 0 && (
                      <span className="done-note">
                        {dayDone === day.activities.length ? 'Complete ✓' : `${dayDone} done`}
                      </span>
                    )}
                  </span>
                </span>
                <span className="chev">
                  <ChevronIcon />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DayDetail({
  day,
  checked,
  onToggle,
  onBack,
}: {
  day: Day
  checked: CheckedMap
  onToggle: (key: string) => void
  onBack: () => void
}) {
  return (
    <div className="screen">
      <div className="detail-top">
        <button className="back" onClick={onBack}>
          <BackIcon />
          Journey
        </button>
        <div className="title">
          Day {day.id} · {day.city}
        </div>
      </div>

      <header className="detail-hero">
        <div className={`day-no text-${day.color}`}>
          Day {day.id} — {day.city} {day.cityJp}
        </div>
        <h1 className="t-display">{day.title}</h1>
        <p className="theme">{day.theme}</p>
        <div className="stay">🌙 Tonight: {day.stay}</div>
        {day.rainPlan && (
          <div className="rain-plan">
            <span>☔️</span>
            <span>
              <b>If it rains:</b> {day.rainPlan}
            </span>
          </div>
        )}
      </header>

      <div className="timeline">
        {day.activities.map((act, i) => {
          const key = `d${day.id}:${i}`
          const done = !!checked[key]
          const meta = kindMeta[act.kind]
          return (
            <div key={key} className={`tl-item ${done ? 'done' : ''}`}>
              <div className="tl-time">
                {act.time}
                <span className={`chip ${meta.chip}`}>{meta.label}</span>
              </div>
              <div className={`card tl-card ${done ? 'done' : ''}`}>
                <div className="head">
                  <h4>
                    {act.title}
                    {act.jp && <span className="jp">{act.jp}</span>}
                  </h4>
                  <button
                    className={`check-btn ${done ? 'on' : ''}`}
                    aria-label={done ? 'Mark not done' : 'Mark done'}
                    onClick={() => onToggle(key)}
                  >
                    <CheckIcon />
                  </button>
                </div>
                <p className="note">{act.note}</p>
                {act.kidTip && (
                  <div className="kid-tip">
                    <span>🦊</span>
                    <span>
                      <b>For the kids:</b> {act.kidTip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
