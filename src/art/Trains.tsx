/**
 * Denshadex train portraits — one shared rail stage (viewBox 0 0 160 64,
 * full-width rail at y=56), each train a hand-drawn side profile: nose +
 * one car, a few shapes, house tokens only. Locked cards go silhouette-grey
 * via CSS (`.dx-locked svg *` beats these presentation attributes); logging
 * removes that class and the ink floods back in.
 */

function Rail() {
  return <line x1="2" y1="56" x2="158" y2="56" stroke="var(--art-silhouette)" strokeWidth="1.5" opacity="0.5" />
}

function Wheels({ x1 = 46, x2 = 114 }: { x1?: number; x2?: number }) {
  return (
    <g fill="var(--art-silhouette)">
      <circle cx={x1} cy="54" r="4" />
      <circle cx={x2} cy="54" r="4" />
    </g>
  )
}

function profile(id: string) {
  switch (id) {
    case 'n700s':
      // long duck-bill nose + blue stripe
      return (
        <>
          <path d="M8 50 Q0 44 8 38 L26 28 H140 A8 8 0 0 1 148 36 V50 Z" fill="var(--art-silhouette)" />
          <rect x="30" y="35" width="112" height="6" fill="var(--art-water)" />
          <rect x="50" y="24" width="66" height="9" rx="2.5" fill="var(--art-snow)" />
        </>
      )
    case 'tozan':
      // short boxy two-window climber
      return (
        <>
          <rect x="34" y="26" width="92" height="24" rx="4" fill="var(--art-silhouette)" />
          <rect x="46" y="32" width="20" height="12" fill="var(--art-snow)" />
          <rect x="94" y="32" width="20" height="12" fill="var(--art-snow)" />
        </>
      )
    case 'romancecar':
      // rounded observation nose, big window band
      return (
        <>
          <path d="M18 50 Q4 44 4 38 Q4 30 22 28 H132 A9 9 0 0 1 141 37 V50 Z" fill="var(--art-silhouette)" />
          <rect x="24" y="30" width="108" height="13" rx="6" fill="var(--art-snow)" />
          <ellipse cx="12" cy="39" rx="7" ry="8" fill="var(--art-snow)" />
        </>
      )
    case 'randen':
      // single boxy tram with a pole
      return (
        <>
          <rect x="32" y="26" width="94" height="24" rx="3" fill="var(--art-silhouette)" />
          <rect x="42" y="32" width="74" height="10" fill="var(--art-snow)" />
          <line x1="79" y1="26" x2="79" y2="8" stroke="var(--art-lantern)" strokeWidth="2.4" />
        </>
      )
    case 'kintetsu':
      // commuter two-tone
      return (
        <>
          <rect x="26" y="26" width="108" height="13" fill="var(--art-silhouette)" />
          <rect x="26" y="39" width="108" height="11" fill="var(--art-blossom-b)" />
          <rect x="36" y="29" width="88" height="7" fill="var(--art-snow)" />
        </>
      )
    case 'midosuji':
      // rounded metro, red line stripe
      return (
        <>
          <rect x="28" y="24" width="104" height="26" rx="12" fill="var(--art-silhouette)" />
          <rect x="28" y="38" width="104" height="4" fill="var(--vermillion)" />
          <rect x="40" y="30" width="80" height="9" rx="3" fill="var(--art-snow)" />
        </>
      )
    case 'haruka':
      // wedge nose
      return (
        <>
          <path d="M14 50 L30 28 H140 A8 8 0 0 1 148 36 V50 Z" fill="var(--art-silhouette)" />
          <rect x="36" y="33" width="104" height="9" rx="2.5" fill="var(--art-snow)" />
        </>
      )
    case 'keikyu1000':
      // commuter flat-front, vermillion body
      return (
        <>
          <rect x="26" y="26" width="108" height="24" rx="5" fill="var(--vermillion)" />
          <rect x="36" y="32" width="88" height="10" fill="var(--art-snow)" />
        </>
      )
    case 'e235':
      // flat-front with a pine stripe
      return (
        <>
          <rect x="26" y="26" width="108" height="24" rx="5" fill="var(--art-silhouette)" />
          <rect x="26" y="39" width="108" height="5" fill="var(--pine)" />
          <rect x="36" y="31" width="88" height="8" fill="var(--art-snow)" />
        </>
      )
    case 'ginza1000':
      // retro rounded roof, lantern-gold body
      return (
        <>
          <rect x="28" y="24" width="104" height="26" rx="10" fill="var(--art-lantern)" />
          <rect x="40" y="32" width="80" height="10" rx="3" fill="var(--art-snow)" />
        </>
      )
    default:
      return <rect x="26" y="26" width="108" height="24" rx="5" fill="var(--art-silhouette)" />
  }
}

export function TrainArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 160 64" aria-hidden="true">
      <Rail />
      {profile(id)}
      <Wheels />
    </svg>
  )
}
