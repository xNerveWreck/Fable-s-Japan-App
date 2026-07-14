import { useEffect, useState } from 'react'
import {
  freshCode, familyId, getInkStatus, joinFamily, startFamily, turnOffInk, turnOnInk,
} from '../lib/liveSync'
import { allergens, budgetGuide, emergencyItems, packGroups } from '../data/kit'
import { itinerary, TRIP_LENGTH } from '../data/itinerary'
import { TravelersCard } from '../components/Travelers'
import { Kamon } from '../art/Kamon'
import type { Traveler } from '../data/travelers'
import { useStored } from '../hooks/useStored'
import { daysBetween, jstToday, shortDate } from '../lib/dates'
import { FAIL_FACE, LensError, testKey, type LensFail } from '../lib/lens'
import { coachPace, paceFixture, paceMath, type PaceCoach } from '../lib/pace'
import { shareUrl, type Moment } from '../lib/sync'
import { play, type SoundName } from '../lib/sound'
import { CheckIcon, ChevronIcon, GearIcon, ShareIcon, TrashIcon } from '../art/icons'

export function Kit() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="screen">
      <header className="screen-head kit-head">
        <div className="grow">
          <div className="t-kicker">Travel kit · 道具</div>
          <h1>Kit</h1>
          <p className="sub">Money, packing, and the break-glass essentials.</p>
        </div>
        <button
          className={`icon-btn settings-btn ${showSettings ? 'on' : ''}`}
          aria-label="Settings"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((s) => !s)}
        >
          <GearIcon />
        </button>
      </header>

      {showSettings && <KitSettings />}
      <Converter />
      <Spend />
      <Packing />
      <Notes />
      <AllergyCard />
      <FamilyInk />
      <FamilySync />
      <Emergency />
    </div>
  )
}

/* ---------- settings: the trip's dials, out of the way ---------- */

function KitSettings() {
  const [departure, setDeparture] = useStored<string>('departure', '')
  const [enabled, setEnabled] = useStored<boolean>('sound', false)
  const [claudeKey, setClaudeKey] = useStored<string>('claude-key', '')
  const [keyDraft, setKeyDraft] = useState('')
  const [keyTest, setKeyTest] = useState<'idle' | 'testing' | 'ok' | LensFail>('idle')

  const runKeyTest = async () => {
    setKeyTest('testing')
    setKeyTest(await testKey(claudeKey))
  }

  const demoNames: { name: SoundName; label: string }[] = [
    { name: 'tap', label: 'Did it' },
    { name: 'loved', label: 'Loved' },
    { name: 'stamp', label: 'Stamp' },
    { name: 'bell', label: 'Bell' },
  ]

  return (
    <section className="kit-section" data-testid="kit-settings">
      <div className="section-title">
        <h2>Settings</h2>
        <span className="jp">設定</span>
      </div>
      <div className="card sync-card">
        <label className="depart-row" style={{ marginTop: 0 }}>
          <span className="depart-label">Departure · 出発</span>
          <input
            type="date"
            aria-label="Departure date"
            value={departure}
            onChange={(e) => e.target.value && setDeparture(e.target.value)}
          />
        </label>
        <p className="pocket-hint" style={{ marginTop: 6 }}>
          The whole journey counts from this day — the countdown, “Day 3 in Kyoto”, the stamps.
        </p>

        <hr className="hr-ink" />

        <label className="depart-row">
          <span className="depart-label">AI key · 鍵</span>
          {claudeKey ? (
            <span className="key-set">
              ✓ key saved
              <button className="chip key-test-btn" disabled={keyTest === 'testing'} onClick={() => void runKeyTest()}>
                {keyTest === 'testing' ? 'asking…' : 'test the brush'}
              </button>
              <button className="icon-btn" aria-label="Clear the AI key" onClick={() => { setClaudeKey(''); setKeyTest('idle') }}>
                <TrashIcon />
              </button>
            </span>
          ) : (
            <span className="key-entry">
              <input
                type="password"
                placeholder="paste Anthropic key"
                autoComplete="off"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
              />
              <button className="key-save" disabled={!keyDraft.trim()} onClick={() => { setClaudeKey(keyDraft.trim()); setKeyDraft('') }}>
                Save
              </button>
            </span>
          )}
        </label>
        <p className="key-note">
          Powers the sign decoder and the menu lens. Use a key from a dedicated workspace with a monthly
          spend cap (console.anthropic.com). Stored only on this phone — never synced, never shared.
        </p>
        {keyTest !== 'idle' && keyTest !== 'testing' && (
          <p className={`key-note key-verdict ${keyTest === 'ok' ? 'good' : 'bad'}`}>
            {keyTest === 'ok' ? '✓ the brush answers — both lenses are ready' : FAIL_FACE[keyTest]}
          </p>
        )}

        <hr className="hr-ink" />

        <div className="row">
          <div className="grow">
            <div style={{ fontWeight: 600, fontSize: 15 }}>Sound & touch · 音</div>
            <p className="pocket-hint" style={{ marginTop: 2 }}>
              Tiny synthesized tones and haptics for check-offs, loved moments, and landing stamps. Japan is the
              main event; these are brush-tip whispers.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={enabled}
            className={`sound-switch ${enabled ? 'on' : ''}`}
            onClick={() => {
              const next = !enabled
              setEnabled(next)
              if (next) setTimeout(() => play('loved'), 60)
            }}
          >
            <span className="knob" />
          </button>
        </div>
        {enabled && (
          <div className="quick-refs" style={{ marginTop: 12 }}>
            {demoNames.map((d) => (
              <button key={d.name} className="chip chip-indigo" onClick={() => play(d.name)}>
                ♪ {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Set once, then it never changes — so the travelers live here now,
          not on Journey home (owner decision, 2026-07-12). */}
      <TravelersCard />
    </section>
  )
}

/* ---------- notes: the family's shared margin ---------- */

function Notes() {
  const [notes, setNotes] = useStored<string>('notes', '')
  const [open, setOpen] = useState(false)

  return (
    <section className="kit-section">
      <div className="card pack-group">
        <button className="head" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span>📝</span>
          <h3>Notes</h3>
          <span className="count">{notes.trim() ? '…' : ''}</span>
          <span className="twist" style={{ color: 'var(--ink-faint)', display: 'flex' }}>
            <span style={{ width: 18, height: 18, display: 'flex', transform: `rotate(${open ? -90 : 90}deg)`, transition: 'transform .3s' }}>
              <ChevronIcon />
            </span>
          </span>
        </button>
        {open && (
          <div className="notes-body">
            <textarea
              className="journal-text"
              rows={4}
              placeholder="The trip's margin — locker numbers, a gate code, the ramen shop someone swore by, who owes who a gachapon…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- live family ink ---------- */

function FamilyInk() {
  const [ink, setInk] = useState(getInkStatus())
  const [joining, setJoining] = useState(false)
  const [codeDraft, setCodeDraft] = useState('')
  const [codeFail, setCodeFail] = useState(false)
  const [, breathe] = useState(0) // re-render so the countdown stays honest
  const [travelers] = useStored<Traveler[]>('travelers', [])
  const [moments] = useStored<Record<string, Moment>>('moments', {})
  const lovedCount = Object.values(moments).filter((m) => m === 'loved').length

  useEffect(() => {
    const onStatus = () => setInk({ ...getInkStatus() })
    window.addEventListener('tabi:ink-status', onStatus)
    const t = window.setInterval(() => breathe((n) => n + 1), 30_000)
    return () => {
      window.removeEventListener('tabi:ink-status', onStatus)
      window.clearInterval(t)
    }
  }, [])

  const join = async () => {
    setCodeFail(false)
    const ok = await joinFamily(codeDraft.trim())
    if (ok) {
      setJoining(false)
      setCodeDraft('')
    } else if (getInkStatus().kind !== 'unreachable') {
      setCodeFail(true)
    }
  }

  const minsLeft =
    ink.codeExpiresAt != null ? Math.max(0, Math.round((ink.codeExpiresAt - Date.now()) / 60_000)) : null

  return (
    <section className="kit-section" data-testid="family-ink">
      <div className="section-title">
        <h2>Family ink</h2>
        <span className="jp">家族の墨</span>
      </div>
      <div className="card sync-card">
        <div className="kamon-seal">
          <Kamon travelers={travelers} loved={lovedCount} size={76} />
        </div>
        {ink.kind === 'off' && (
          <>
            <p className="pocket-hint" style={{ marginTop: 0 }}>
              Flip this on and the phones keep each other's ink fresh by themselves, whenever
              they find the sky. Off, the share link below still does everything by hand.
            </p>
            {familyId() ? (
              <button className="show-card-btn pressable" onClick={() => void turnOnInk()}>
                Turn on live sync
              </button>
            ) : joining ? (
              <>
                <div className="pocket-add" style={{ marginTop: 4 }}>
                  <input
                    placeholder="FUJI-42"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={codeDraft}
                    onChange={(e) => setCodeDraft(e.target.value.toUpperCase())}
                  />
                  <button className="key-save" disabled={!codeDraft.trim()} onClick={() => void join()}>
                    Join
                  </button>
                </div>
                {codeFail && <p className="pocket-hint ink-fail">That code has faded — ask for a fresh one.</p>}
              </>
            ) : (
              <>
                <button className="show-card-btn pressable" onClick={() => void startFamily()}>
                  Turn on live sync — start our family
                </button>
                <button className="show-card-btn pressable ink-quiet" onClick={() => setJoining(true)}>
                  Join a family
                </button>
              </>
            )}
          </>
        )}

        {ink.kind === 'connecting' && <p className="ink-status">Lifting the brush…</p>}

        {ink.kind === 'solo' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              Solo — waiting for family
            </p>
            {ink.code ? (
              <>
                <div className="ink-code">{ink.code}</div>
                <p className="pocket-hint">
                  On the other phone: Kit → Family ink → Join a family, and type this code.
                  {minsLeft != null && ` It fades in about ${minsLeft} min.`}
                </p>
              </>
            ) : (
              <p className="pocket-hint">The last code faded — mint a fresh one below.</p>
            )}
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void freshCode()}>
                New code
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
          </>
        )}

        {ink.kind === 'synced' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              Synced — {ink.phones} phones
              {ink.lastSync ? ` · ${new Date(ink.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
            <p className="pocket-hint">
              Check-offs, loved moments, packing, and treasures now flow between the phones on
              their own. Reservations stay in each phone's pocket, as always.
            </p>
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void freshCode()}>
                Invite another phone
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
            {ink.code && (
              <>
                <div className="ink-code">{ink.code}</div>
                <p className="pocket-hint">
                  Type this on the new phone{minsLeft != null && ` — it fades in about ${minsLeft} min`}.
                </p>
              </>
            )}
          </>
        )}

        {ink.kind === 'unreachable' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              The ink can't reach the sky right now — the link below still works.
            </p>
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void turnOnInk()}>
                Try again
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ---------- family sync ---------- */

function FamilySync() {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied'>('idle')
  const [pasted, setPasted] = useState('')

  const share = async () => {
    const url = shareUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tabi — our Japan trip', url })
        setStatus('shared')
        return
      } catch {
        /* user cancelled the share sheet — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      prompt('Copy this sync link:', url)
    }
    setTimeout(() => setStatus('idle'), 2500)
  }

  const importPasted = () => {
    const match = pasted.match(/#\/sync\/([A-Za-z0-9_-]+)/) ?? pasted.match(/^([A-Za-z0-9_-]{20,})$/)
    if (match) location.hash = `#/sync/${match[1]}`
  }

  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>Family sync</h2>
        <span className="jp">同期</span>
      </div>
      <div className="card sync-card">
        <p className="pocket-hint" style={{ marginTop: 0 }}>
          Four phones, one journey. Share this phone’s trip — check-offs, loved moments, packing, reservations — as
          a link. AirDrop or message it; the other phone taps it and merges. No servers, the link <i>is</i> the data.
        </p>
        <button className="show-card-btn pressable sync-share" onClick={share}>
          <ShareIcon />
          {status === 'copied' ? 'Link copied!' : status === 'shared' ? 'Shared 🌸' : 'Share this phone’s trip'}
        </button>
        <div className="pocket-add" style={{ marginTop: 12 }}>
          <input
            placeholder="…or paste a sync link from another phone"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
          <button className="icon-btn" aria-label="Import pasted sync link" onClick={importPasted}>
            <CheckIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- currency converter ---------- */

function Converter() {
  const [rate, setRate] = useStored<number>('fx-rate', 155)
  const safeRate = rate > 0 ? rate : 155
  const [yen, setYen] = useState<string>('1000')
  const [usd, setUsd] = useState<string>(() => (1000 / safeRate).toFixed(2))

  const fromYen = (v: string) => {
    setYen(v)
    const n = parseFloat(v)
    setUsd(Number.isFinite(n) ? (n / safeRate).toFixed(2) : '')
  }
  const fromUsd = (v: string) => {
    setUsd(v)
    const n = parseFloat(v)
    setYen(Number.isFinite(n) ? Math.round(n * safeRate).toString() : '')
  }
  const setNewRate = (v: string) => {
    const n = parseFloat(v)
    setRate(Number.isFinite(n) && n > 0 ? n : 155)
    const y = parseFloat(yen)
    if (Number.isFinite(y) && Number.isFinite(n) && n > 0) setUsd((y / n).toFixed(2))
  }

  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>Yen at a glance</h2>
        <span className="jp">両替</span>
      </div>
      <div className="card converter">
        <div className="t-kicker">Converter</div>
        <div className="fields">
          <div className="field">
            <label htmlFor="yen-in">¥ Yen</label>
            <input
              id="yen-in"
              inputMode="decimal"
              value={yen}
              onChange={(e) => fromYen(e.target.value)}
              placeholder="0"
            />
          </div>
          <span className="swap">⇄</span>
          <div className="field">
            <label htmlFor="usd-in">$ USD</label>
            <input
              id="usd-in"
              inputMode="decimal"
              value={usd}
              onChange={(e) => fromUsd(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="quick-refs">
          {[100, 500, 1000, 3000, 10000].map((v) => (
            <button key={v} className="chip chip-gold" onClick={() => fromYen(String(v))}>
              ¥{v.toLocaleString()} ≈ ${(v / safeRate).toFixed(v >= 1000 ? 0 : 2)}
            </button>
          ))}
        </div>
        <div className="rate-note">
          Rate: $1 =
          <input
            inputMode="decimal"
            defaultValue={safeRate}
            key={safeRate}
            onBlur={(e) => setNewRate(e.target.value)}
            aria-label="Exchange rate, yen per dollar"
          />
          ¥ — tap to adjust to today’s rate. Saved on this phone.
        </div>
      </div>
    </section>
  )
}

/* ---------- spend: the pouch and its pace ---------- */

function Spend() {
  return (
    <section className="kit-section" data-testid="spend">
      <div className="section-title">
        <h2>Spend</h2>
        <span className="jp">予算</span>
      </div>
      <PaceCard />
      <div className="card" style={{ padding: '6px 16px' }}>
        <div className="t-kicker" style={{ paddingTop: 8 }}>A day costs about…</div>
        {budgetGuide.map((b) => (
          <div key={b.id} className="budget-line">
            <div className="grow">
              <div className="label">{b.label}</div>
              <div className="note">{b.note}</div>
            </div>
            <div className="amount">{b.amount}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * The pace forecast. The math lives in lib/pace.ts and never needs the
 * network; the coach button asks Claude (the family's own key, the fast
 * brush) to weigh the pouch against the days still ahead.
 */
function PaceCard() {
  const [budget, setBudget] = useStored<number>('budget-total', 0)
  const [log, setLog] = useStored<Record<string, number>>('spend-log', {})
  const [departure] = useStored<string>('departure', '')
  const [key] = useStored<string>('claude-key', '')
  const [budgetDraft, setBudgetDraft] = useState('')
  const [editingBudget, setEditingBudget] = useState(false)
  const [amount, setAmount] = useState('')
  const [coach, setCoach] = useState<'idle' | 'asking' | 'done' | 'failed'>('idle')
  const [coachSays, setCoachSays] = useState<PaceCoach | null>(null)
  const [fail, setFail] = useState<LensFail>('offline')

  const pace = paceMath(budget, log, departure)
  const onTrip = pace.tripDay !== null && pace.tripDay >= 1 && pace.daysLeft > 0
  const yen = (n: number) => `¥${n.toLocaleString()}`

  const dayLabel = (date: string) => {
    const n = departure ? daysBetween(departure, date) + 1 : 0
    const day = itinerary[n - 1]
    return day ? `Day ${n} · ${day.city}` : shortDate(date)
  }

  const saveBudget = () => {
    const n = Math.round(parseFloat(budgetDraft))
    if (!Number.isFinite(n) || n <= 0) return
    setBudget(n)
    setBudgetDraft('')
    setEditingBudget(false)
    setCoach('idle')
  }

  const addSpend = () => {
    const n = Math.round(parseFloat(amount))
    if (!Number.isFinite(n) || n <= 0) return
    const today = jstToday()
    setLog((l) => ({ ...l, [today]: (l[today] ?? 0) + n }))
    setAmount('')
    setCoach('idle')
    play('tap')
  }

  const clearDay = (date: string) =>
    setLog((l) => {
      const next = { ...l }
      delete next[date]
      return next
    })

  const ask = async () => {
    if (!key && !paceFixture()) {
      setFail('no-key')
      setCoach('failed')
      return
    }
    setCoach('asking')
    try {
      setCoachSays(await coachPace(key, budget, log, departure))
      setCoach('done')
    } catch (e) {
      setFail(e instanceof LensError ? e.kind : 'offline')
      setCoach('failed')
    }
  }

  if (budget <= 0 || editingBudget) {
    return (
      <div className="card pace-card" data-testid="pace-card">
        <div className="t-kicker">Pace forecast</div>
        <p className="pocket-hint" style={{ marginTop: 4 }}>
          Set the trip’s cash budget once and Tabi divides what’s left across the days that remain —
          log what a day cost and the pace keeps itself honest.
        </p>
        <div className="pocket-add" style={{ marginTop: 8 }}>
          <input
            inputMode="numeric"
            placeholder="whole-trip budget, yen"
            aria-label="Trip budget in yen"
            value={budgetDraft}
            onChange={(e) => setBudgetDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
          />
          <button className="key-save" disabled={!(Math.round(parseFloat(budgetDraft)) > 0)} onClick={saveBudget}>
            Set
          </button>
        </div>
        {editingBudget && (
          <button className="chip pace-budget-edit" onClick={() => setEditingBudget(false)}>
            keep {yen(budget)}
          </button>
        )}
      </div>
    )
  }

  const loggedDates = Object.keys(log).sort().reverse()

  return (
    <div className="card pace-card" data-testid="pace-card">
      <div className="t-kicker">Pace forecast</div>

      <div className="budget-line">
        <div className="grow">
          <div className="label">Left in the pouch</div>
          <div className="note">
            {onTrip
              ? `day ${pace.tripDay} of ${TRIP_LENGTH} · ${pace.daysLeft} days still to fund`
              : pace.daysLeft === 0
                ? `of ${yen(budget)} — the journey is home`
                : `of ${yen(budget)} — the trip hasn’t started`}
          </div>
        </div>
        <div className={`amount${pace.remaining < 0 ? ' pace-over' : ''}`}>{yen(pace.remaining)}</div>
      </div>

      {onTrip && (
        <div className="budget-line">
          <div className="grow">
            <div className="label">Today</div>
            <div className={`note${pace.todayLeft < 0 ? ' pace-over' : ''}`}>
              {pace.todayLeft >= 0
                ? `${yen(pace.todayLeft)} still fine to spend today`
                : `${yen(-pace.todayLeft)} over today’s share`}
            </div>
          </div>
          <div className="amount">{yen(pace.todaySpent)}</div>
        </div>
      )}

      {onTrip && pace.daysLeft > 1 && (
        <div className="budget-line">
          <div className="grow">
            <div className="label">Each day ahead</div>
            <div className="note">{pace.daysLeft - 1} days after today, split evenly</div>
          </div>
          <div className={`amount${pace.perDayAhead < 0 ? ' pace-over' : ''}`}>{yen(pace.perDayAhead)}</div>
        </div>
      )}

      {!onTrip && pace.daysLeft > 0 && (
        <div className="budget-line">
          <div className="grow">
            <div className="label">Each day</div>
            <div className="note">an even split across all {TRIP_LENGTH} days</div>
          </div>
          <div className="amount">{yen(Math.floor(budget / TRIP_LENGTH))}</div>
        </div>
      )}

      <div className="pocket-add" style={{ marginTop: 4 }}>
        <input
          inputMode="numeric"
          placeholder="add spend, yen"
          aria-label="Add spending in yen"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSpend()}
        />
        <button className="key-save" disabled={!(Math.round(parseFloat(amount)) > 0)} onClick={addSpend}>
          Add
        </button>
      </div>

      {loggedDates.length > 0 && (
        <div className="pace-days">
          {loggedDates.map((date) => (
            <div key={date} className="pace-day">
              <span className="grow">{dayLabel(date)}</span>
              <span className="pace-day-amount">{yen(log[date])}</span>
              <button className="icon-btn small" aria-label={`Clear ${dayLabel(date)}`} onClick={() => clearDay(date)}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {coach === 'idle' && (
        <button className="show-card-btn pressable pace-ask" onClick={() => void ask()}>
          Ask Claude about the pace 🖌️
        </button>
      )}
      {coach === 'asking' && <div className="lens-reading">Weighing the pouch…</div>}
      {coach === 'failed' && (
        <div className="lens-fail">
          <p>{FAIL_FACE[fail]}</p>
          <button className="lens-again" onClick={() => setCoach('idle')}>Try again</button>
        </div>
      )}
      {coach === 'done' && coachSays && (
        <div className="pace-coach">
          <p className="pace-verdict">{coachSays.verdict}</p>
          <p className="pace-plan">{coachSays.plan}</p>
          {coachSays.advice.length > 0 && (
            <ul>
              {coachSays.advice.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          <button className="lens-again" onClick={() => setCoach('idle')}>Ask again</button>
        </div>
      )}

      <button
        className="chip pace-budget-edit"
        onClick={() => {
          setBudgetDraft(String(budget))
          setEditingBudget(true)
        }}
      >
        change the {yen(budget)} budget
      </button>
    </div>
  )
}

/* ---------- packing ---------- */

function Packing() {
  const [packed, setPacked] = useStored<Record<string, boolean>>('packed', {})
  const [open, setOpen] = useState<string | null>(packGroups[0].id)

  const toggle = (id: string) =>
    setPacked((p) => {
      if (!p[id]) play('tap')
      return { ...p, [id]: !p[id] }
    })

  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>Packing</h2>
        <span className="jp">荷造り</span>
      </div>
      {packGroups.map((group) => {
        const done = group.items.filter((i) => packed[i.id]).length
        const isOpen = open === group.id
        return (
          <div key={group.id} className="card pack-group">
            <button className="head" onClick={() => setOpen(isOpen ? null : group.id)}>
              <span>{group.emoji}</span>
              <h3>{group.name}</h3>
              <span className={`count ${done === group.items.length ? 'complete' : ''}`}>
                {done}/{group.items.length}
              </span>
              <span className="twist" style={{ color: 'var(--ink-faint)', display: 'flex' }}>
                <span style={{ width: 18, height: 18, display: 'flex', transform: `rotate(${isOpen ? -90 : 90}deg)`, transition: 'transform .3s' }}>
                  <ChevronIcon />
                </span>
              </span>
            </button>
            {isOpen && (
              <div className="pack-items">
                {group.items.map((item) => {
                  const done = !!packed[item.id]
                  return (
                    <button key={item.id} className={`pack-item ${done ? 'done' : ''}`} onClick={() => toggle(item.id)}>
                      <span className={`check-btn ${done ? 'on' : ''}`}>
                        <CheckIcon />
                      </span>
                      <span className="grow">
                        <span className="label">{item.label}</span>
                        {item.note && <div className="note">{item.note}</div>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

/* ---------- allergy card ---------- */

function AllergyCard() {
  const [selected, setSelected] = useStored<string[]>('allergies', [])
  const [showCard, setShowCard] = useState(false)

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const chosen = allergens.filter((a) => selected.includes(a.id))

  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>Allergy card</h2>
        <span className="jp">アレルギー</span>
      </div>
      <p className="guide-intro" style={{ margin: '4px 0 0' }}>
        Select any allergies in the family, then show the card to restaurant staff — written Japanese beats
        pronunciation when it matters.
      </p>
      <div className="allergy-toggle-row">
        {allergens.map((a) => (
          <button key={a.id} className={`chip ${selected.includes(a.id) ? 'on' : ''}`} onClick={() => toggle(a.id)}>
            {a.en}
          </button>
        ))}
      </div>
      {chosen.length > 0 && (
        <button className="show-card-btn pressable" onClick={() => setShowCard(true)}>
          Show the card 🈲
        </button>
      )}

      {showCard && (
        <div className="allergy-modal" role="dialog" aria-label="Allergy card in Japanese">
          <div className="heading">⚠️ Food Allergy</div>
          <div className="jp-line">食物アレルギーがあります。</div>
          <div className="sub">We have food allergies to the following:</div>
          <div className="list">{chosen.map((a) => a.jp).join('・')}</div>
          <div className="jp-line" style={{ fontSize: 24 }}>
            これらが入っている料理は食べられません。
            <br />
            ご確認をお願いします。
          </div>
          <div className="sub">We cannot eat dishes containing these. Please check. Thank you!</div>
          <button className="close" onClick={() => setShowCard(false)}>
            Close
          </button>
        </div>
      )}
    </section>
  )
}

/* ---------- emergency ---------- */

function Emergency() {
  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>If things go sideways</h2>
        <span className="jp">緊急</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {emergencyItems.map((item) => (
          <a
            key={item.id}
            className="card sos-card pressable"
            href={`tel:${item.value.replace(/-/g, '')}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="num">{item.value}</div>
            <div className="grow">
              <div className="label">{item.label}</div>
              {item.detail && <div className="detail">{item.detail}</div>}
            </div>
          </a>
        ))}
      </div>
      <p className="empty-note" style={{ paddingBottom: 0 }}>
        Japan is one of the safest countries on Earth for families.
        <br />
        This section exists so you never think about it again. 🌸
      </p>
    </section>
  )
}
