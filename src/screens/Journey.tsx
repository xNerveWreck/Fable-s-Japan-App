import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { itinerary, kindMeta, TRIP_LENGTH, type Day } from '../data/itinerary'
import { phraseCategories } from '../data/phrases'
import { useStored } from '../hooks/useStored'
import { useSpeech } from '../hooks/useSpeech'
import { useTilt } from '../hooks/useTilt'
import type { Moment, Reservation } from '../lib/sync'
import { daysBetween, jstToday, shortDate, todayStr } from '../lib/dates'
import { play } from '../lib/sound'
import { inkBloom } from '../lib/ink'
import { currentSolar, PHASE_LABEL } from '../lib/solar'
import { microseasonFor } from '../data/sekki'
import { journalDays } from '../lib/db'
import { Journal } from '../components/Journal'
import { FujiWindow } from '../components/FujiWindow'
import { DeerDojo } from '../components/DeerDojo'
import { SideQuests } from '../components/SideQuests'
import { quests } from '../data/quests'
import { InkHero } from '../art/InkHero'
import { Petals } from '../art/Petals'
import { CityVignette } from '../art/Vignettes'
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
        // Sumi (and anything else listening) hears every loved moment
        if (m === 'loved') window.dispatchEvent(new CustomEvent('tabi:loved'))
      }
      return next
    })

  if (openDay) {
    return (
      <DayDetail
        day={openDay}
        moments={moments}
        onSet={setMoment}
        onBack={() => nav('journey')}
        openDay={(id) => nav(`journey/${id}`)}
      />
    )
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
  // The date prompt lives here only until a departure exists. It must stay
  // mounted through the whole picking interaction — iOS fires `change` on
  // every wheel tick — so it retires on blur, not on first change.
  // Afterwards the date is edited from Kit → Settings.
  const [showDepartPrompt, setShowDepartPrompt] = useState(() => !departure)
  const totalActivities = useMemo(() => itinerary.reduce((n, d) => n + d.activities.length, 0), [])
  const doneCount = Object.values(moments).filter((m) => m === 'done' || m === 'loved').length
  const lovedKeys = Object.keys(moments).filter((k) => moments[k] === 'loved')

  const [journaled, setJournaled] = useState<Set<number>>(new Set())
  useEffect(() => {
    journalDays().then(setJournaled).catch(() => {})
  }, [])

  const { until, tripDay } = departure ? tripClock(departure) : { until: null, tripDay: null }
  const onTrip = tripDay !== null && tripDay <= TRIP_LENGTH
  const today = onTrip && tripDay !== null ? itinerary[tripDay - 1] : null

  // Japan's calendar and sky, both computed on-device
  const season = microseasonFor(jstToday())
  const { phase } = currentSolar()

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
        <div className="hero-sekki" role="img" aria-label={`Microseason: ${season.en}`}>
          {/* stacked spans, not writing-mode: vertical-rl collapses inside
              flex/abs-pos overlays in both Chromium and WebKit */}
          {[...season.kanji].map((ch, i) => (
            <span key={i} className="sekki-kanji">{ch}</span>
          ))}
          <span className="sekki-seal" aria-hidden>候</span>
        </div>
        <div className="hero-season-note">{season.en}</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="card countdown">
          <div className="hanko">{onTrip ? `日${tripDay}` : '旅'}</div>
          <div className="grow">
            <h2>{countTitle}</h2>
            <div className="sub">{countSub}</div>
            {!onTrip && <div className="sub sub-sky">The sky over Japan: {PHASE_LABEL[phase]}</div>}
            {showDepartPrompt && (
              <label className="depart-row">
                <span className="depart-label">{departure ? 'Departure · 出発' : 'Pick the day · 出発日'}</span>
                <input
                  type="date"
                  aria-label="Departure date"
                  value={departure}
                  onChange={(e) => e.target.value && setDeparture(e.target.value)}
                  onBlur={() => departure && setShowDepartPrompt(false)}
                />
              </label>
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

        <PhraseOfTheDay />

        <div className="section-title">
          <h2>Twelve days</h2>
          <span className="jp">東京 → 京都 → 奈良 → 大阪 → 東京</span>
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
                    <span className="day-date">{shortDate(day.date)}</span>
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

/* The treasures shelf (loved moments, stamps, tanzaku) moved to
   src/screens/Treasures.tsx — the collection is its own tab now. */

/* ================= day detail ================= */

function DayDetail({
  day,
  moments,
  onSet,
  onBack,
  openDay,
}: {
  day: Day
  moments: MomentMap
  onSet: (key: string, m: Moment | null) => void
  onBack: () => void
  openDay: (id: number) => void
}) {
  const prevDay = itinerary.find((d) => d.id === day.id - 1)
  const nextDay = itinerary.find((d) => d.id === day.id + 1)
  const { ref: tiltRef, arm: armTilt } = useTilt<HTMLDivElement>()

  // side quests: state lives here (not inside SideQuests) so a find can
  // repaint the vignette's bonus detail live, without a reload
  const [foundQuests, setFoundQuests] = useStored<Record<string, number>>('quests', {})
  const completedInCity = quests.filter((q) => q.city === day.city && foundQuests[q.id] != null).length

  // wet ink blooms where the finger landed; keyboard taps bloom at the button
  const bloomAt = (e: MouseEvent<HTMLElement>, color: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    inkBloom(e.clientX || rect.left + rect.width / 2, e.clientY || rect.top + rect.height / 2, color)
  }

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
        <div className="day-steps">
          <button
            className="step step-prev"
            disabled={!prevDay}
            aria-label={prevDay ? `Day ${prevDay.id} · ${prevDay.city}` : 'This is the first day'}
            onClick={() => prevDay && openDay(prevDay.id)}
          >
            <ChevronIcon />
          </button>
          <button
            className="step"
            disabled={!nextDay}
            aria-label={nextDay ? `Day ${nextDay.id} · ${nextDay.city}` : 'This is the last day'}
            onClick={() => nextDay && openDay(nextDay.id)}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>

      <div
        className="vignette card"
        data-quests={String(Math.min(completedInCity, 3))}
        ref={tiltRef}
        onClick={armTilt}
      >
        <CityVignette city={day.city} />
      </div>

      {day.fujiWindow && <FujiWindow />}

      {day.deerDojo && <DeerDojo />}

      {quests.some((q) => q.city === day.city) && (
        <SideQuests city={day.city} found={foundQuests} setFound={setFoundQuests} />
      )}

      <header className="detail-hero">
        <div className={`day-no text-${day.color}`}>
          Day {day.id} · {shortDate(day.date)} — {day.city} {day.cityJp}
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
                    onClick={(e) => {
                      if (state !== 'done') bloomAt(e, 'var(--pine)')
                      onSet(key, state === 'done' ? null : 'done')
                    }}
                  >
                    <CheckIcon /> Did it
                  </button>
                  <button
                    className={`state-btn sb-loved ${state === 'loved' ? 'on' : ''}`}
                    onClick={(e) => {
                      if (state !== 'loved') bloomAt(e, 'var(--sakura)')
                      onSet(key, state === 'loved' ? null : 'loved')
                    }}
                  >
                    <HeartIcon filled={state === 'loved'} /> Loved it
                  </button>
                  <button
                    className={`state-btn sb-skip ${state === 'skipped' ? 'on' : ''}`}
                    onClick={(e) => {
                      if (state !== 'skipped') bloomAt(e, 'var(--ink-faint)')
                      onSet(key, state === 'skipped' ? null : 'skipped')
                    }}
                  >
                    <SkipIcon /> Skipped
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <nav className="day-pager" aria-label="Nearby days">
        {prevDay ? (
          <button className="card pager-card pressable" onClick={() => openDay(prevDay.id)}>
            <span className="pager-dir">← Day {prevDay.id} · {prevDay.city}</span>
            <span className="pager-title">{prevDay.title}</span>
          </button>
        ) : (
          <span />
        )}
        {nextDay ? (
          <button className="card pager-card pager-next pressable" onClick={() => openDay(nextDay.id)}>
            <span className="pager-dir">Day {nextDay.id} · {nextDay.city} →</span>
            <span className="pager-title">{nextDay.title}</span>
          </button>
        ) : (
          <span />
        )}
      </nav>
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
      <p className="pocket-hint">Confirmation numbers for this day — hotel bookings, USJ tickets, the Airbnb. They stay on this phone (and travel only in your family sync link).</p>
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
        <input placeholder="What (e.g. USJ tickets)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="icon-btn" aria-label="Add reservation" onClick={add}>
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}
