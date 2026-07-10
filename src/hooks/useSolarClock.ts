import { useEffect } from 'react'
import { applySolarPalette } from '../lib/solar'

/** Keeps the palette on the sun's schedule: re-tints every minute and
 *  whenever the app returns to the foreground after a pocket nap. */
export function useSolarClock() {
  useEffect(() => {
    applySolarPalette()
    const id = setInterval(applySolarPalette, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') applySolarPalette()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}
