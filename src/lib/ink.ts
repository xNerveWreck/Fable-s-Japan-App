/** A tap blooms as wet ink at the touch point — the nijimi feedback layer. */
export function inkBloom(x: number, y: number, color: string) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const blot = document.createElement('span')
  blot.className = 'ink-bloom'
  blot.style.left = `${x}px`
  blot.style.top = `${y}px`
  blot.style.background = color
  document.body.appendChild(blot)
  blot.addEventListener('animationend', () => blot.remove())
  setTimeout(() => blot.remove(), 1200) // safety net if the animation never runs
}
