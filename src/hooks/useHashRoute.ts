import { useCallback, useEffect, useState } from 'react'

/**
 * Tiny hash router. Routes are plain segments: #/journey/8, #/discover,
 * #/sync/<payload>. Real history entries mean iOS edge-swipe back works,
 * refresh keeps your place, and days are deep-linkable.
 */
function parse(): string[] {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

export function useHashRoute() {
  const [route, setRoute] = useState<string[]>(parse)

  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const nav = useCallback((path: string, replace = false) => {
    const hash = '#/' + path.replace(/^\/+/, '')
    if (replace) {
      const url = new URL(location.href)
      url.hash = hash
      history.replaceState(null, '', url)
      setRoute(parse())
    } else {
      location.hash = hash
    }
  }, [])

  return [route, nav] as const
}
