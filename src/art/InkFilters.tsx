/**
 * Shared SVG filter primitives — the nijimi (wet-ink bleed) that every
 * ink effect in the app draws through. Mounted once, invisible, referenced
 * by CSS as `filter: url(#nijimi)`.
 */
export function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <defs>
        <filter id="nijimi" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055 0.07" numOctaves="2" seed="7" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
