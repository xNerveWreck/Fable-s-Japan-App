import { useEffect, useRef, useState } from 'react'
import { CUM_KM, FUJI_ZONE, ROUTE_KM, STATIONS, project, statusFor, type RideStatus } from '../lib/tokaido'

const STRIP_W = 1560
const X = (km: number) => (km / ROUTE_KM) * STRIP_W
const xSta = (name: string) => X(CUM_KM[STATIONS.findIndex((s) => s.name === name)])

function line(st: RideStatus | null): string {
  if (!st) return 'Board, then begin the watch — the scroll knows the way'
  switch (st.kind) {
    case 'rolling':
      return 'Rolling southwest — the scroll unrolls'
    case 'soon':
      return `Fuji on the right in ~${st.minutes} min — window seats ready`
    case 'look':
      return 'いまだ — LOOK RIGHT. Mount Fuji.'
    case 'past':
      return 'Fuji is behind you — tea fields, then Nagoya'
    case 'kyoto':
      return 'The old capital approaches — gather the bags'
    case 'tunnel':
      return 'In the mountains — tunnels eat the signal; the scroll waits'
  }
}

/** The painted Tōkaidō, one emakimono strip. Landmark positions derive from
 *  the same CUM_KM table the GPS projection uses, so art and geometry agree. */
function Strip({ km }: { km: number | null }) {
  const fujiX = X(125) // the summit reads just west of Shin-Fuji
  return (
    <svg viewBox={`0 0 ${STRIP_W} 120`} width={STRIP_W} height={120} aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="fw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--hero-sky-a)" />
          <stop offset="1" stopColor="var(--hero-sky-b)" />
        </linearGradient>
        <linearGradient id="fw-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--art-sun-a)" />
          <stop offset="1" stopColor="var(--art-sun-b)" />
        </linearGradient>
      </defs>
      <rect width={STRIP_W} height="120" fill="url(#fw-sky)" />

      {/* the Fuji viewing window, washed onto the paper */}
      <rect className="fw-zone" x={X(FUJI_ZONE.startKm)} width={X(FUJI_ZONE.endKm) - X(FUJI_ZONE.startKm)} y="0" height="120" fill="var(--art-sun-a)" opacity="0.12" />

      {/* Tokyo, left edge */}
      <g fill="var(--art-silhouette)">
        <rect x="14" y="70" width="16" height="34" />
        <rect x="36" y="60" width="12" height="44" />
        <rect x="54" y="76" width="18" height="28" />
      </g>
      <g stroke="var(--vermillion)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M86 62 L80 104" />
        <path d="M86 62 L92 104" />
        <path d="M82 84 H90" />
      </g>

      {/* Sagami bay */}
      <rect x={X(26)} y="90" width={X(70) - X(26)} height="12" rx="6" fill="var(--art-water)" opacity="0.8" />

      {/* Odawara keep */}
      <g transform={`translate(${xSta('Odawara')} 0)`} fill="var(--art-silhouette)">
        <path d="M-10 104 L0 88 L10 104 Z" />
        <rect x="-6" y="80" width="12" height="6" />
        <path d="M-8 80 L0 70 L8 80 Z" />
      </g>

      {/* Hakone hills */}
      <path d={`M${X(80)} 104 Q${X(88)} 62 ${X(96)} 104 Z`} fill="var(--art-mtn-near)" opacity="0.7" />
      <path d={`M${X(92)} 104 Q${X(101)} 70 ${X(110)} 104 Z`} fill="var(--art-mtn-near)" opacity="0.55" />

      {/* FUJI — halo, body, snowcap: the washes the bloom brings up */}
      <circle className="fw-wash fw-wash-halo" cx={fujiX} cy="30" r="52" fill="url(#fw-sun)" />
      <path className="fw-wash fw-wash-body" d={`M${fujiX - 95} 96 L${fujiX} 18 L${fujiX + 95} 96 Z`} fill="var(--art-mtn-near)" />
      <path
        className="fw-wash fw-wash-snow"
        d={`M${fujiX - 26} 38 L${fujiX} 18 L${fujiX + 26} 38 Q${fujiX + 13} 48 ${fujiX} 42 Q${fujiX - 13} 48 ${fujiX - 26} 38 Z`}
        fill="var(--art-snow)"
      />

      {/* tea rows */}
      <g stroke="var(--pine)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6">
        <path d={`M${X(170)} 96 q14 -8 28 0`} />
        <path d={`M${X(178)} 103 q18 -9 36 0`} />
        <path d={`M${X(190)} 97 q14 -8 28 0`} />
      </g>

      {/* Lake Hamana */}
      <rect x={xSta('Hamamatsu') - 34} y="92" width="68" height="10" rx="5" fill="var(--art-water)" opacity="0.85" />

      {/* Nagoya castle */}
      <g transform={`translate(${xSta('Nagoya')} 0)`}>
        <g fill="var(--art-silhouette)">
          <path d="M-12 104 L0 90 L12 104 Z" />
          <rect x="-8" y="82" width="16" height="8" />
          <path d="M-10 82 L0 72 L10 82 Z" />
        </g>
        <circle cx="0" cy="70" r="2.2" fill="var(--art-lantern)" />
      </g>

      {/* rice plains */}
      <g stroke="var(--art-silhouette)" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.35">
        <path d={`M${X(395)} 98 h22`} />
        <path d={`M${X(403)} 104 h30`} />
        <path d={`M${X(414)} 99 h20`} />
      </g>

      {/* Kyoto pagoda, right edge */}
      <g transform={`translate(${STRIP_W - 36} 0)`}>
        <g stroke="var(--art-silhouette)" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M-16 104 H16" />
          <path d="M-13 88 H13" />
          <path d="M-10 72 H10" />
        </g>
        <path d="M0 58 V104" stroke="var(--art-silhouette)" strokeWidth="3.5" />
        <circle cx="0" cy="56" r="3" fill="var(--vermillion)" />
      </g>

      {/* the rail, and the stations that matter */}
      <path d={`M0 108 H${STRIP_W}`} stroke="var(--art-silhouette)" strokeWidth="1.5" opacity="0.45" />
      {STATIONS.map((st, i) =>
        st.major ? (
          <g key={st.name} transform={`translate(${X(CUM_KM[i])} 0)`}>
            <path d="M0 104 V112" stroke="var(--art-silhouette)" strokeWidth="1.5" opacity="0.6" />
            <text y="119" textAnchor="middle" fontSize="9" fill="var(--ink-faint)">
              {st.jp}
            </text>
          </g>
        ) : null
      )}

      {/* the train */}
      {km != null && (
        <g className="fw-train" transform={`translate(${X(km)} 108)`}>
          <circle r="5.5" fill="var(--vermillion)" />
          <circle r="2" fill="var(--art-snow)" />
        </g>
      )}
    </svg>
  )
}

/**
 * Fuji Window — the Day-7 Tōkaidō scroll. GPS begins on the tap (that tap is
 * the permission gesture); ?ride=<0..1> forces a position for demos and the
 * story suite; no GPS at all leaves a painted map of the route. The one job:
 * call LOOK RIGHT at the real moment Fuji fills the train window.
 */
export function FujiWindow() {
  const forcedParam = new URLSearchParams(location.search).get('ride')
  const forced = forcedParam == null ? null : Math.max(0, Math.min(1, Number(forcedParam) || 0))
  const [fix, setFix] = useState<{ km: number; speed: number; at: number } | null>(
    forced == null ? null : { km: forced * ROUTE_KM, speed: 0, at: Date.now() }
  )
  const [watching, setWatching] = useState(forced != null)
  const [, bump] = useState(0)
  const [vw, setVw] = useState(358)
  const vpRef = useRef<HTMLDivElement>(null)
  const watchId = useRef<number | null>(null)
  const last = useRef<{ km: number; at: number } | null>(null)

  const begin = () => {
    if (watching || !('geolocation' in navigator)) return
    setWatching(true)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { km } = project({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        const now = Date.now()
        let speed = pos.coords.speed != null && pos.coords.speed > 3 ? pos.coords.speed * 3.6 : 0
        if (!speed && last.current && now - last.current.at > 4000) {
          speed = (Math.abs(km - last.current.km) / (now - last.current.at)) * 3600000
        }
        last.current = { km, at: now }
        setFix({ km, speed, at: now })
      },
      () => setWatching(false), // denied or unavailable — the painting remains
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }

  useEffect(() => {
    if (vpRef.current) setVw(vpRef.current.clientWidth)
    const t = setInterval(() => bump((n) => n + 1), 5000) // staleness → tunnel state
    return () => {
      clearInterval(t)
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  const staleSec = fix && forced == null ? (Date.now() - fix.at) / 1000 : 0
  const status = fix ? statusFor(fix.km, fix.speed || 240, staleSec) : null
  const offset = fix ? Math.max(vw - STRIP_W, Math.min(0, vw / 2 - X(fix.km))) : 0

  return (
    <section className={`fuji-window card${status?.kind === 'look' ? ' fw-bloom' : ''}`}>
      <div className="fw-head">
        Fuji Window <span className="fw-head-jp">富士の窓</span>
        {fix != null && fix.speed > 0 && <span className="fw-speed">~{Math.round(fix.speed)} km/h</span>}
      </div>
      <div className="fw-viewport" ref={vpRef}>
        <div className="fw-strip" style={{ transform: `translateX(${offset}px)` }}>
          <Strip km={fix?.km ?? null} />
        </div>
      </div>
      <p className={`fw-status${status?.kind === 'look' ? ' fw-look' : ''}`} role="status" aria-live="polite">
        {line(status)}
      </p>
      {!watching && (
        <button className="fw-begin" onClick={begin}>
          Begin the watch 🗻 — Fuji rides on the right
        </button>
      )}
    </section>
  )
}
