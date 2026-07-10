import { useEffect, useRef } from 'react'

const KEY = 'tabi:tilt'

type DOEC = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Tilt-parallax for the vignette paintings. Writes damped --vg-x/--vg-y
 * onto the container and flips data-tilt='on' once real readings arrive,
 * which switches the CSS planes from autonomous drift to sensor-driven.
 * iOS only summons its motion-permission popup from a tap — arm() is that
 * tap handler; a remembered grant re-arms silently on mount. Denied, no
 * sensor, or reduced motion all fall back to the CSS drift (or stillness).
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const detach = useRef<(() => void) | null>(null)

  const attach = () => {
    const el = ref.current
    if (!el || detach.current) return
    let base: { b: number; g: number } | null = null
    let x = 0
    let y = 0
    const onTurn = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null || !ref.current) return
      if (!base) {
        base = { b: e.beta, g: e.gamma } // however the phone is held is neutral
        ref.current.dataset.tilt = 'on'
      }
      const tx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 18))
      const ty = Math.max(-1, Math.min(1, (e.beta - base.b) / 18))
      x += (tx - x) * 0.12 // heavy paper, not a game
      y += (ty - y) * 0.12
      ref.current.style.setProperty('--vg-x', x.toFixed(3))
      ref.current.style.setProperty('--vg-y', y.toFixed(3))
    }
    window.addEventListener('deviceorientation', onTurn)
    detach.current = () => window.removeEventListener('deviceorientation', onTurn)
  }

  const arm = () => {
    if (detach.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof DeviceOrientationEvent === 'undefined') return
    const req = (DeviceOrientationEvent as DOEC).requestPermission
    if (typeof req === 'function') {
      req()
        .then((r) => {
          localStorage.setItem(KEY, JSON.stringify(r))
          if (r === 'granted') attach()
        })
        .catch(() => {
          /* stays on drift — quiet by default */
        })
    } else {
      attach()
    }
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof DeviceOrientationEvent === 'undefined') return
    const req = (DeviceOrientationEvent as DOEC).requestPermission
    if (typeof req !== 'function') {
      attach() // Android/desktop: listening is free; data-tilt flips only on real readings
    } else if (localStorage.getItem(KEY) === '"granted"') {
      req()
        .then((r) => r === 'granted' && attach())
        .catch(() => {})
    }
    return () => {
      detach.current?.()
      detach.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, arm }
}
