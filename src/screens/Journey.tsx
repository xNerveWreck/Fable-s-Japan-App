import { useEffect, useMemo, useState } from 'react'
import { itinerary, kindMeta, TRIP_LENGTH, type Day } from '../data/itinerary'
import { phraseCategories } from '../data/phrases'
import { useStored } from '../hooks/useStored'
import { useSpeech } from '../hooks/useSpeech'
import type { Moment, Reservation } from '../lib/sync'
import { daysBetween, jstToday, todayStr } from '../lib/dates'
import { play } from '../lib/sound'
import { journalDays } from '../lib/db'
import { TravelersCard } from '../components/Travelers'
import { Journal } from '../components/Journal'
import { InkHero } from '../art/InkHero'
import { Petals } from '../art/Petals'
import { CityVignette } from '../art/Vignettes'
import { RouteMap } from '../art/RouteMap'
import { Stamp } from '../art/Stamp'
import { BackIcon, CheckIcon, ChevronIcon, HeartIcon, PlusIcon, SkipIcon, SpeakerIcon, TrashIcon } from '../art/icons'

type MomentMap = Record<string, Moment>

/**
 * The Japan clock: once the trip has begun, "which day is it" runs on
 * Asia/Tokyo time so Day 3 flips at Japan's midnight, not the phone's.
 * The pre-departure countdown stays on local time — you fly from home.
 */
function tripClock(departure: string) {
  const until = daysBetween(todayStr(), departure)
  const jstDelta = daysBetween(departure, jstToday())
  const tripDay = jstDelta >= 0 ? jstDelta + 1 : null
  return { until, tripDay }
}

const dayIsComplete = (day: Day, moments: MomentMap) =>
  day.activities.every((_, i) => moments[`d${day.id}:${i}`])

export function Journey({ route, nav }: { route: string[]; nav: (p: string, replace?: boolean) => void }) {
  const [departure, setDeparture] = useStored<string>('departure', '')
  const [moments, setMoments] = useStored<MomentMap>('moments', {})

  const openDayId = Number(route[1])
  const openDay = itinerary.find((d) => d.id === openDayId)

  // navigating between the list and a day always starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [openDayId])

  const setMoment = (key: string, m: Moment | null) =>
    setMoments((prev) => {
      const next = { ...prev }
      if (m === null) delete next[key]
      else next[key] = m

      // the sound grammar: per-action tone, and the hanko thunk when this
      // action completes its whole day
      if (m !== null) {
        const dayId = Number(key.slice(1).split(':')[0])
        const day = itinerary.find((d) => d.id === dayId)
        const wasComplete = day ? dayIsComplete(day, prev) : false
        const nowComplete = day ? dayIsComplete(day, next) : false
        if (!wasComplete && nowComplete) play('stamp')
        else play(m === 'loved' ? 'loved' : m === 'skipped' ? 'skip' : 'tap')
      }
      return next
    })

  if (openDay) {
    return <DayDetail day={openDay} moments={moments} onSet={setMoment} onBack={() => nav('journey')} />
  }

  return (
    <JourneyHome
      departure={departure}
      setDeparture={setDeparture}
      moments={moments}
      openDay={(id) => nav(`journey/${id}`)}
    />
  )
}

/* ================= home ================= */

function JourneyHome({
  departure,
  setDeparture,
  moments,
  openDay,
}: {
  departure: string
  setDeparture: (d: string) => void
  moments: MomentMap
  openDay: (id: number) => void
}) {
  const totalActivities = useMemo(() => itinerary.reduce((n, d) => n + d.activities.length, 0), [])
  const doneCount = Object.values(moments).filter((m) => m === 'done' || m === 'loved').length
  const lovedKeys = Object.keys(moments).filter((k) => moments[k] === 'loved')
  const stampsEarned = itinerary.filter((d) => dayIsComplete(d, moments)).length

  const [journaled, setJournaled] = useState<Set<number>>(new Set())
  useEffect(() => {
    journalDays().then(setJournaled).catch(() => {})
  }, [])

  const { until, tripDay } = departure ? tripClock(departure) : { until: null, tripDay: null }
  const onTrip = tripDay !== null && tripDay <= TRIP_LENGTH
  const today = onTrip && tripDay !== null ? itinerary[tripDay - 1] : null

  let countTitle: string
  let countSub: string
  if (until === null) {
    countTitle = 'When do you fly?'
    countSub = 'Set your departure day and Tabi keeps count with you.'
  } else if (onTrip && today) {
    countTitle = `Day ${tripDay} — ${today.title}`
    countSub = `${today.city} ${today.cityJp} · running on Japan time`
  } else if (tripDay !== null && tripDay > TRIP_LENGTH) {
    countTitle = 'Okaeri — welcome home'
    countSub = 'The trip lives in the stamps now. Start the "next time" list.'
  } else {
    countTitle = until === 1 ? 'Tomorrow. It’s tomorrow!' : `${until} days until Japan`
    countSub = 'Passports, excitement, and one last packing check.'
  }

  // during the trip: surface the next unresolved moment of today
  const upNext = today
    ? today.activities.map((a, i) => ({ ...a, i })).find((a) => !moments[`d${today.id}:${a.i}`])
    : null

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
          <div className="hanko">{onTrip ? `日${tripDay}` : '旅'}</div>
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

        {today && upNext && (
          <button className="card today-next pressable" onClick={() => openDay(today.id)}>
            <span className="t-kicker">Up next today</span>
            <span className="row" style={{ marginTop: 6 }}>
              <span className="time">{upNext.time}</span>
              <span className={`chip ${kindMeta[upNext.kind].chip}`}>{kindMeta[upNext.kind].label}</span>
            </span>
            <span className="next-title">{upNext.title}</span>
            <span className="next-go">Open Day {today.id} →</span>
          </button>
        )}
        {today && !upNext && (
          <div className="card today-next">
            <span className="t-kicker">Today</span>
            <span className="next-title">Every moment collected. 完璧!</span>
          </div>
        )}

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
          {lovedKeys.length > 0 && (
            <div className="loved-count">♥ {lovedKeys.length} loved</div>
          )}
        </div>

        <TravelersCard />

        <div className="section-title">
          <h2>The road</h2>
          <span className="jp">道のり</span>
        </div>
        <div className="card" style={{ padding: '10px 4px 2px' }}>
          <RouteMap moments={moments} />
        </div>

        <PhraseOfTheDay />

        <div className="section-title">
          <h2>Stamp journal</h2>
          <span className="jp">判子帳 · {stampsEarned}/14</span>
        </div>
        <div className="card stamp-grid-wrap">
          <p className="stamp-hint">
            Resolve every stop in a day — did it, loved it, or skipped it — and the day’s eki-stamp lands here.
          </p>
          <div className="stamp-grid">
            {itinerary.map((d) => (
              <Stamp key={d.id} day={d} earned={dayIsComplete(d, moments)} />
            ))}
          </div>
        </div>

        {lovedKeys.length > 0 && <Treasures moments={moments} openDay={openDay} />}

        <div className="section-title">
          <h2>Fourteen days</h2>
          <span className="jp">東京 → 箱根 → 京都 → 奈良 → 大阪</span>
        </div>

        <div className="day-list">
          {itinerary.map((day) => {
            const resolved = day.activities.filter((_, i) => moments[`d${day.id}:${i}`]).length
            const isToday = tripDay === day.id
            return (
              <button key={day.id} className="card day-card pressable" onClick={() => openDay(day.id)}>
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
                    {journaled.has(day.id) && <span className="chip chip-gold">📓</span>}
                    {resolved > 0 && (
                      <span className="done-note">
                        {resolved === day.activities.length ? 'Stamped ✓' : `${resolved} resolved`}
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

/* ================= phrase of the day ================= */

const potdPool = phraseCategories
  .filter((c) => c.id === 'essentials' || c.id === 'food' || c.id === 'kids')
  .flatMap((c) => c.phrases)

function PhraseOfTheDay() {
  const { speak, speakingId, supported } = useSpeech()
  const dayIndex = Math.floor(Date.now() / 86400000) % potdPool.length
  const p = potdPool[dayIndex]

  return (
    <div className="card potd">
      <div className="row">
        <div className="grow">
          <div className="t-kicker">Phrase of the day · 今日のことば</div>
          <div className="potd-jp">{p.jp}</div>
          <div className="potd-romaji">{p.romaji}</div>
          <div className="potd-en">{p.en}</div>
        </div>
        {supported && (
          <button
            className={`icon-btn ${speakingId === p.id ? 'speaking' : ''}`}
            aria-label={`Say "${p.en}" in Japanese`}
            onClick={() => speak(p.id, p.jp)}
          >
            <SpeakerIcon />
          </button>
        )}
      </div>
    </div>
  )
}

/* ================= treasures ================= */

function Treasures({ moments, openDay }: { moments: MomentMap; openDay: (id: number) => void }) {
  const loved = itinerary.flatMap((day) =>
    day.activities
      .map((act, i) => ({ day, act, key: `d${day.id}:${i}` }))
      .filter(({ key }) => moments[key] === 'loved')
  )

  return (
    <>
      <div className="section-title">
        <h2>Loved moments</h2>
        <span className="jp">宝物 · treasures</span>
      </div>
      <div className="card" style={{ padding: '4px 16px' }}>
        {loved.map(({ day, act, key }) => (
          <button key={key} className="treasure-row" onClick={() => openDay(day.id)}>
            <span className="heart">♥</span>
            <span className="grow">
              <span className="t-title">{act.title}</span>
              <span className="t-sub">
                Day {day.id} · {day.city}
              </span>
            </span>
            <span className="chev" style={{ width: 18, height: 18, color: 'var(--ink-faint)' }}>
              <ChevronIcon />
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ================= day detail ================= */

function DayDetail({
  day,
  moments,
  onSet,
  onBack,
}: {
  day: Day
  moments: MomentMap
  onSet: (key: string, m: Moment | null) => void
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

      <div className="vignette card">
        <CityVignette city={day.city} />
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

      <Pocket dayId={day.id} />

      <Journal dayId={day.id} />

      <div className="timeline">
        {day.activities.map((act, i) => {
          const key = `d${day.id}:${i}`
          const state = moments[key]
          const meta = kindMeta[act.kind]
          return (
            <div key={key} className={`tl-item ${state ? `is-${state}` : ''}`}>
              <div className="tl-time">
                {act.time}
                <span className={`chip ${meta.chip}`}>{meta.label}</span>
              </div>
              <div className={`card tl-card ${state ? `is-${state}` : ''}`}>
                <h4>
                  {act.title}
                  {act.jp && <span className="jp">{act.jp}</span>}
                </h4>
                <p className="note">{act.note}</p>
                {act.kidTip && (
                  <div className="kid-tip">
                    <span>🦊</span>
                    <span>
                      <b>For the kids:</b> {act.kidTip}
                    </span>
                  </div>
                )}
                <div className="state-row" role="group" aria-label={`Mark "${act.title}"`}>
                  <button
                    className={`state-btn sb-done ${state === 'done' ? 'on' : ''}`}
                    onClick={() => onSet(key, state === 'done' ? null : 'done')}
                  >
                    <CheckIcon /> Did it
                  </button>
                  <button
                    className={`state-btn sb-loved ${state === 'loved' ? 'on' : ''}`}
                    onClick={() => onSet(key, state === 'loved' ? null : 'loved')}
                  >
                    <HeartIcon filled={state === 'loved'} /> Loved it
                  </button>
                  <button
                    className={`state-btn sb-skip ${state === 'skipped' ? 'on' : ''}`}
                    onClick={() => onSet(key, state === 'skipped' ? null : 'skipped')}
                  >
                    <SkipIcon /> Skipped
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= reservations pocket ================= */

function Pocket({ dayId }: { dayId: number }) {
  const [reservations, setReservations] = useStored<Record<string, Reservation[]>>('reservations', {})
  const [label, setLabel] = useState('')
  const [code, setCode] = useState('')
  const list = reservations[dayId] ?? []

  const add = () => {
    if (!label.trim()) return
    const entry: Reservation = { id: `${Date.now()}`, label: label.trim(), code: code.trim() }
    setReservations((r) => ({ ...r, [dayId]: [...(r[dayId] ?? []), entry] }))
    setLabel('')
    setCode('')
  }

  const remove = (id: string) =>
    setReservations((r) => ({ ...r, [dayId]: (r[dayId] ?? []).filter((e) => e.id !== id) }))

  return (
    <div className="card pocket">
      <div className="t-kicker">Pocket · 予約</div>
      <p className="pocket-hint">Confirmation numbers for this day — teamLab tickets, dinner bookings, the ryokan.</p>
      {list.map((r) => (
        <div key={r.id} className="pocket-row">
          <span className="grow">
            <span className="p-label">{r.label}</span>
            {r.code && <span className="p-code">{r.code}</span>}
          </span>
          <button className="icon-btn small" aria-label={`Delete ${r.label}`} onClick={() => remove(r.id)}>
            <TrashIcon />
          </button>
        </div>
      ))}
      <div className="pocket-add">
        <input placeholder="What (e.g. teamLab 9:30)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="icon-btn" aria-label="Add reservation" onClick={add}>
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}
