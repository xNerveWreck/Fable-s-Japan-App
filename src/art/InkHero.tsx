/**
 * The hero painting. An ink-wash landscape composed in SVG: red sun, tiered
 * pagoda, blossom masses, an arched bridge over still water. Every color is a
 * CSS custom property, so at night the same brushwork becomes an indigo snow
 * scene with a pale moon and a lit lantern in the pagoda.
 */
export function InkHero() {
  return (
    <svg
      viewBox="0 0 390 240"
      role="img"
      aria-label="Ink-wash painting of a pagoda, red sun, cherry blossoms and a bridge over water"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id="ih-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--hero-sky-a)" />
          <stop offset="1" stopColor="var(--hero-sky-b)" />
        </linearGradient>
        <linearGradient id="ih-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--art-sun-a)" />
          <stop offset="1" stopColor="var(--art-sun-b)" />
        </linearGradient>
        <radialGradient id="ih-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--art-lantern)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--art-lantern)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect width="390" height="240" fill="url(#ih-sky)" />

      {/* sun / moon */}
      <circle cx="264" cy="58" r="34" fill="url(#ih-sun)" />

      {/* far mountains */}
      <path
        d="M-8 132 L52 58 Q58 52 66 62 L98 104 L124 76 L170 132 Z"
        fill="var(--art-mtn-far)"
        opacity="0.8"
      />
      <path d="M96 132 L150 88 L196 128 L214 112 L248 138 L96 138 Z" fill="var(--art-mtn-near)" opacity="0.55" />

      {/* mist bands */}
      <rect x="0" y="118" width="390" height="14" fill="var(--paper)" opacity="0.55" />
      <rect x="40" y="132" width="350" height="10" fill="var(--paper)" opacity="0.35" />

      {/* pagoda on the right */}
      <g fill="var(--art-silhouette)">
        <rect x="303" y="52" width="4" height="14" />
        <circle cx="305" cy="50" r="3" />
        <path d="M305 62 L272 82 Q305 73 338 82 Z" />
        <rect x="294" y="80" width="22" height="10" />
        <path d="M305 88 L264 110 Q305 99 346 110 Z" />
        <rect x="291" y="108" width="28" height="12" />
        <path d="M305 118 L256 142 Q305 130 354 142 Z" />
        <rect x="288" y="140" width="34" height="18" />
      </g>
      {/* lantern in the pagoda — glows at night */}
      <circle cx="305" cy="147" r="14" fill="url(#ih-glow)" opacity="0.85" />
      <rect x="302" y="144" width="6" height="7" rx="2" fill="var(--art-lantern)" />

      {/* blossom canopy, top left */}
      <g>
        <path d="M-6 8 Q40 2 62 26 Q84 44 70 60" stroke="var(--art-silhouette)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M50 22 Q68 26 74 40" stroke="var(--art-silhouette)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="26" cy="18" rx="34" ry="18" fill="var(--art-blossom-a)" opacity="0.9" />
        <ellipse cx="66" cy="34" rx="28" ry="15" fill="var(--art-blossom-b)" opacity="0.75" />
        <ellipse cx="40" cy="44" rx="22" ry="12" fill="var(--art-blossom-a)" opacity="0.7" />
        <ellipse cx="86" cy="20" rx="20" ry="11" fill="var(--art-blossom-a)" opacity="0.6" />
      </g>

      {/* blossom bank, mid left */}
      <g>
        <ellipse cx="30" cy="150" rx="42" ry="22" fill="var(--art-blossom-b)" opacity="0.75" />
        <ellipse cx="66" cy="164" rx="30" ry="16" fill="var(--art-blossom-a)" opacity="0.85" />
        <ellipse cx="10" cy="170" rx="26" ry="14" fill="var(--art-blossom-a)" opacity="0.7" />
      </g>

      {/* blossom bank, right of bridge */}
      <g>
        <ellipse cx="360" cy="172" rx="40" ry="20" fill="var(--art-blossom-b)" opacity="0.7" />
        <ellipse cx="332" cy="184" rx="26" ry="13" fill="var(--art-blossom-a)" opacity="0.8" />
      </g>

      {/* water */}
      <rect x="0" y="192" width="390" height="48" fill="var(--art-water)" />
      <g stroke="var(--art-silhouette)" strokeWidth="1.4" opacity="0.28" strokeLinecap="round">
        <path d="M60 214 h44" />
        <path d="M150 224 h60" />
        <path d="M256 210 h38" />
        <path d="M320 226 h44" />
      </g>
      {/* sun reflection */}
      <ellipse cx="264" cy="216" rx="22" ry="4" fill="var(--art-sun-b)" opacity="0.35" />

      {/* arched bridge */}
      <g>
        <path
          d="M118 196 Q195 158 272 196 L272 202 Q195 166 118 202 Z"
          fill="var(--art-silhouette)"
        />
        {/* railing posts */}
        <g stroke="var(--art-silhouette)" strokeWidth="3" strokeLinecap="round">
          <path d="M132 194 v-12" />
          <path d="M160 184 v-13" />
          <path d="M195 180 v-14" />
          <path d="M230 184 v-13" />
          <path d="M258 194 v-12" />
        </g>
        <path d="M128 180 Q195 148 262 180" stroke="var(--art-silhouette)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </g>

      {/* birds near the sun */}
      <g stroke="var(--art-silhouette)" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M206 44 q5 -6 10 0 q5 -6 10 0" />
        <path d="M228 30 q4 -5 8 0 q4 -5 8 0" />
        <path d="M196 62 q4 -5 8 0 q4 -5 8 0" />
      </g>

      {/* ground ink stroke at the very bottom */}
      <path d="M0 236 Q98 228 195 233 T390 231 L390 240 L0 240 Z" fill="var(--art-silhouette)" opacity="0.9" />
    </svg>
  )
}
