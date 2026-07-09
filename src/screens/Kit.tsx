import { useState } from 'react'
import { allergens, budgetGuide, emergencyItems, packGroups } from '../data/kit'
import { useStored } from '../hooks/useStored'
import { CheckIcon, ChevronIcon } from '../art/icons'

export function Kit() {
  return (
    <div className="screen">
      <header className="screen-head">
        <div className="t-kicker">Travel kit · 道具</div>
        <h1>Kit</h1>
        <p className="sub">Money, packing, and the break-glass essentials.</p>
      </header>

      <Converter />
      <BudgetGuide />
      <Packing />
      <AllergyCard />
      <Emergency />
    </div>
  )
}

/* ---------- currency converter ---------- */

function Converter() {
  const [rate, setRate] = useStored<number>('fx-rate', 155)
  const [yen, setYen] = useState<string>('1000')
  const [usd, setUsd] = useState<string>((1000 / 155).toFixed(2))
  const safeRate = rate > 0 ? rate : 155

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

/* ---------- budget guide ---------- */

function BudgetGuide() {
  return (
    <section className="kit-section">
      <div className="section-title">
        <h2>A day costs about…</h2>
        <span className="jp">予算</span>
      </div>
      <div className="card" style={{ padding: '6px 16px' }}>
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

/* ---------- packing ---------- */

function Packing() {
  const [packed, setPacked] = useStored<Record<string, boolean>>('packed', {})
  const [open, setOpen] = useState<string | null>(packGroups[0].id)

  const toggle = (id: string) => setPacked((p) => ({ ...p, [id]: !p[id] }))

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
