/**
 * One painted vignette per city, drawn on the same 390×120 stage with the
 * same theme-reactive palette as the hero. Day: ink & sakura. Night: indigo
 * snow, lantern gold.
 */

function Stage({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 390 120"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--hero-sky-a)" />
          <stop offset="1" stopColor="var(--hero-sky-b)" />
        </linearGradient>
        <linearGradient id="v-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--art-sun-a)" />
          <stop offset="1" stopColor="var(--art-sun-b)" />
        </linearGradient>
      </defs>
      <rect width="390" height="120" fill="url(#v-sky)" />
      {children}
    </svg>
  )
}

function TokyoVignette() {
  return (
    <Stage label="Tokyo skyline with Tokyo Tower at dusk">
      <circle cx="300" cy="38" r="24" fill="url(#v-sun)" />
      {/* far skyline */}
      <g fill="var(--art-mtn-near)" opacity="0.6">
        <rect x="0" y="62" width="34" height="58" />
        <rect x="40" y="52" width="22" height="68" />
        <rect x="68" y="68" width="30" height="52" />
        <rect x="240" y="58" width="26" height="62" />
        <rect x="272" y="70" width="34" height="50" />
        <rect x="352" y="60" width="38" height="60" />
      </g>
      {/* near skyline */}
      <g fill="var(--art-silhouette)">
        <rect x="18" y="76" width="30" height="44" />
        <rect x="54" y="66" width="24" height="54" />
        <rect x="84" y="82" width="36" height="38" />
        <rect x="126" y="72" width="20" height="48" />
        <rect x="252" y="78" width="30" height="42" />
        <rect x="290" y="66" width="24" height="54" />
        <rect x="320" y="82" width="40" height="38" />
      </g>
      {/* lit windows */}
      <g fill="var(--art-lantern)" opacity="0.8">
        <rect x="60" y="74" width="4" height="4" />
        <rect x="68" y="86" width="4" height="4" />
        <rect x="296" y="74" width="4" height="4" />
        <rect x="330" y="90" width="4" height="4" />
        <rect x="26" y="84" width="4" height="4" />
      </g>
      {/* Tokyo Tower */}
      <g stroke="var(--vermillion)" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M196 22 L172 118" />
        <path d="M196 22 L220 118" />
        <path d="M182 60 H210" />
        <path d="M175 88 H217" />
      </g>
      <path d="M193 10 h6 l-3 14 z" fill="var(--vermillion)" />
      <g stroke="var(--art-silhouette)" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M120 34 q5 -6 10 0 q5 -6 10 0" />
        <path d="M146 24 q4 -5 8 0 q4 -5 8 0" />
      </g>
    </Stage>
  )
}

function HakoneVignette() {
  return (
    <Stage label="Mount Fuji over Lake Ashi with a pirate ship and torii">
      {/* Fuji */}
      <path d="M60 84 L150 16 L240 84 Z" fill="var(--art-mtn-near)" />
      <path d="M124 36 L150 16 L176 36 Q163 46 150 40 Q137 46 124 36 Z" fill="var(--art-snow)" />
      {/* mist */}
      <rect x="0" y="70" width="390" height="10" fill="var(--art-snow)" opacity="0.5" />
      {/* lake */}
      <rect x="0" y="84" width="390" height="36" fill="var(--art-water)" />
      <g stroke="var(--art-silhouette)" strokeWidth="1.3" opacity="0.3" strokeLinecap="round">
        <path d="M40 100 h40" />
        <path d="M150 108 h56" />
        <path d="M300 98 h36" />
      </g>
      {/* pirate ship */}
      <g fill="var(--art-silhouette)">
        <path d="M96 92 L172 92 L160 104 L108 104 Z" />
        <rect x="118" y="58" width="3.5" height="34" />
        <rect x="146" y="64" width="3" height="28" />
        <path d="M121 60 Q140 64 121 82 Z" />
        <path d="M149 66 Q164 70 149 84 Z" />
        <path d="M118 54 l8 4 -8 4 z" fill="var(--vermillion)" />
      </g>
      {/* torii in the water */}
      <g stroke="var(--vermillion)" strokeWidth="4.5" fill="none" strokeLinecap="round">
        <path d="M300 60 Q322 55 344 60" />
        <path d="M306 72 H338" />
        <path d="M310 64 V98" />
        <path d="M334 64 V98" />
      </g>
      <ellipse cx="322" cy="102" rx="20" ry="3" fill="var(--art-silhouette)" opacity="0.25" />
    </Stage>
  )
}

function KyotoVignette() {
  return (
    <Stage label="A tunnel of vermillion torii gates">
      {/* receding torii tunnel */}
      {[
        { x: 60, s: 1, o: 1 },
        { x: 150, s: 0.82, o: 0.92 },
        { x: 222, s: 0.66, o: 0.84 },
        { x: 280, s: 0.52, o: 0.76 },
        { x: 326, s: 0.4, o: 0.68 },
        { x: 360, s: 0.3, o: 0.6 },
      ].map((g, i) => (
        <g
          key={i}
          transform={`translate(${g.x} ${112 - 96 * g.s}) scale(${g.s})`}
          stroke="var(--vermillion)"
          strokeWidth={7}
          opacity={g.o}
          fill="none"
          strokeLinecap="round"
        >
          <path d="M-6 6 Q30 0 66 6" />
          <path d="M2 22 H58" />
          <path d="M8 10 V96" />
          <path d="M52 10 V96" />
        </g>
      ))}
      {/* path */}
      <path d="M0 118 Q140 108 390 114 L390 120 L0 120 Z" fill="var(--art-mtn-near)" opacity="0.7" />
      {/* blossom top-left */}
      <ellipse cx="16" cy="14" rx="30" ry="14" fill="var(--art-blossom-a)" opacity="0.85" />
      <ellipse cx="46" cy="26" rx="20" ry="10" fill="var(--art-blossom-b)" opacity="0.7" />
    </Stage>
  )
}

function NaraVignette() {
  return (
    <Stage label="A bowing deer beside a stone lantern in Nara park">
      <circle cx="330" cy="34" r="20" fill="url(#v-sun)" />
      {/* ground */}
      <path d="M0 96 Q120 88 250 94 T390 92 L390 120 L0 120 Z" fill="var(--art-mtn-near)" opacity="0.55" />
      {/* stone lantern */}
      <g fill="var(--art-silhouette)">
        <rect x="70" y="88" width="26" height="8" rx="2" />
        <rect x="79" y="58" width="8" height="32" />
        <rect x="66" y="44" width="34" height="16" rx="3" />
        <path d="M62 44 L83 30 L104 44 Z" />
        <circle cx="83" cy="26" r="3.5" />
      </g>
      <rect x="76" y="48" width="6" height="8" rx="1.5" fill="var(--art-lantern)" opacity="0.9" />
      {/* deer, ears up, mid-greeting */}
      <g fill="var(--art-silhouette)">
        <ellipse cx="238" cy="82" rx="30" ry="14" />
        {/* legs */}
        <rect x="216" y="90" width="5" height="27" rx="2.5" />
        <rect x="228" y="94" width="5" height="23" rx="2.5" />
        <rect x="246" y="94" width="5" height="23" rx="2.5" />
        <rect x="258" y="90" width="5" height="27" rx="2.5" />
        {/* neck up to the head */}
        <path d="M258 76 L266 72 L282 46 L272 42 L252 70 Z" />
        {/* head + muzzle */}
        <ellipse cx="279" cy="44" rx="9" ry="7" transform="rotate(18 279 44)" />
        <ellipse cx="289" cy="48" rx="5" ry="3.5" transform="rotate(18 289 48)" />
        {/* ear */}
        <path d="M272 38 q-8 -6 -12 -4 q2 6 10 8 z" />
        {/* tail */}
        <circle cx="207" cy="76" r="4.5" />
      </g>
      {/* antlers */}
      <g stroke="var(--art-silhouette)" strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M280 36 q0 -12 -4 -16" />
        <path d="M278 26 q-6 -2 -9 -7" />
        <path d="M279 30 q6 -4 7 -10" />
      </g>
      {/* deer spots */}
      <g fill="var(--art-snow)" opacity="0.85">
        <circle cx="228" cy="78" r="2" />
        <circle cx="240" cy="84" r="2" />
        <circle cx="250" cy="78" r="2" />
      </g>
      {/* grass strokes */}
      <g stroke="var(--pine)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M140 112 q2 -8 0 -12" />
        <path d="M148 112 q4 -6 2 -12" />
        <path d="M320 110 q2 -8 0 -12" />
        <path d="M328 110 q4 -6 2 -12" />
      </g>
    </Stage>
  )
}

function OsakaVignette() {
  return (
    <Stage label="Osaka castle and the giant Dōtonbori crab in neon">
      {/* castle */}
      <g>
        <path d="M30 118 L44 92 H124 L138 118 Z" fill="var(--art-mtn-near)" />
        <g fill="var(--art-silhouette)">
          <path d="M56 92 L84 76 L112 92 Z" />
          <rect x="64" y="76" width="40" height="8" />
          <path d="M60 76 L84 62 L108 76 Z" />
          <rect x="70" y="62" width="28" height="7" />
          <path d="M66 62 L84 50 L102 62 Z" />
        </g>
        {/* pale wall trim so the keep reads at night */}
        <g stroke="var(--art-snow)" strokeWidth="1.6" opacity="0.65" strokeLinecap="round">
          <path d="M66 84 H102" />
          <path d="M72 69 H96" />
          <path d="M74 58 H94" />
        </g>
        <path d="M80 46 q4 -5 8 0 l-4 4 z" fill="var(--art-lantern)" />
      </g>
      {/* neon circles */}
      <circle cx="196" cy="30" r="12" fill="var(--art-blossom-b)" opacity="0.7" />
      <circle cx="170" cy="52" r="7" fill="var(--art-lantern)" opacity="0.75" />
      <circle cx="222" cy="56" r="5" fill="var(--art-blossom-a)" opacity="0.8" />
      {/* the crab */}
      <g>
        <ellipse cx="300" cy="70" rx="34" ry="22" fill="var(--vermillion)" />
        {/* eyes */}
        <g stroke="var(--vermillion)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M288 50 L284 38" />
          <path d="M312 50 L316 38" />
        </g>
        <circle cx="284" cy="36" r="4.5" fill="var(--art-silhouette)" />
        <circle cx="316" cy="36" r="4.5" fill="var(--art-silhouette)" />
        {/* claws */}
        <g fill="var(--vermillion)">
          <path d="M254 52 q-18 -4 -22 -20 q14 2 22 10 z" />
          <path d="M346 52 q18 -4 22 -20 q-14 2 -22 10 z" />
          <circle cx="256" cy="56" r="10" />
          <circle cx="344" cy="56" r="10" />
        </g>
        {/* legs */}
        <g stroke="var(--vermillion)" strokeWidth="4.5" fill="none" strokeLinecap="round">
          <path d="M272 86 q-12 10 -24 12" />
          <path d="M284 92 q-6 12 -16 16" />
          <path d="M328 86 q12 10 24 12" />
          <path d="M316 92 q6 12 16 16" />
        </g>
      </g>
    </Stage>
  )
}

function HomeVignette() {
  return (
    <Stage label="A plane climbing over the Pacific toward home">
      <circle cx="86" cy="36" r="20" fill="url(#v-sun)" />
      {/* clouds */}
      <ellipse cx="250" cy="26" rx="34" ry="10" fill="var(--art-snow)" opacity="0.55" />
      <ellipse cx="300" cy="40" rx="24" ry="8" fill="var(--art-snow)" opacity="0.4" />
      {/* sea */}
      <rect x="0" y="78" width="390" height="42" fill="var(--art-water)" />
      <g stroke="var(--art-silhouette)" strokeWidth="1.6" fill="none" opacity="0.35" strokeLinecap="round">
        <path d="M20 92 q10 -8 20 0 q10 -8 20 0" />
        <path d="M120 104 q10 -8 20 0 q10 -8 20 0" />
        <path d="M260 94 q10 -8 20 0 q10 -8 20 0" />
        <path d="M330 108 q10 -8 20 0" />
      </g>
      {/* plane climbing right — inked in --ink so it reads day and night */}
      <g transform="translate(230 46) rotate(-12)">
        <g fill="var(--ink)">
          <path d="M0 0 Q34 -6 64 -2 Q70 0 64 3 Q34 6 0 4 Q-6 2 0 0 Z" />
          <path d="M26 0 L10 -16 L20 -16 L38 -2 Z" />
          <path d="M28 3 L16 16 L25 16 L40 4 Z" />
          <path d="M58 -2 L52 -12 L58 -12 L64 -3 Z" />
        </g>
        <circle cx="52" cy="0.5" r="1.8" fill="var(--art-lantern)" />
      </g>
      {/* contrail */}
      <path d="M120 76 Q180 64 228 50" stroke="var(--art-snow)" strokeWidth="4" fill="none" opacity="0.65" strokeLinecap="round" />
    </Stage>
  )
}

export function CityVignette({ city }: { city: string }) {
  switch (city) {
    case 'Tokyo':
      return <TokyoVignette />
    case 'Hakone':
      return <HakoneVignette />
    case 'Kyoto':
      return <KyotoVignette />
    case 'Nara':
      return <NaraVignette />
    case 'Osaka':
      return <OsakaVignette />
    default:
      return <HomeVignette />
  }
}
