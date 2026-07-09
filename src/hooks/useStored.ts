import { useEffect, useState } from 'react'

/** useState persisted to localStorage — the whole trip's state lives on-device. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`tabi:${key}`)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(`tabi:${key}`, JSON.stringify(value))
    } catch {
      // storage full or private mode — the app still works, state just won't persist
    }
  }, [key, value])

  return [value, setValue] as const
}
