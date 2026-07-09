import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Japanese text-to-speech via the Web Speech API. iOS ships an excellent
 * ja-JP voice (Kyoko), so the phrasebook talks with zero network and zero
 * dependencies.
 */
export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current =
        voices.find((v) => v.lang === 'ja-JP' && v.localService) ??
        voices.find((v) => v.lang === 'ja-JP') ??
        voices.find((v) => v.lang.startsWith('ja')) ??
        null
    }
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
  }, [supported])

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      if (voiceRef.current) u.voice = voiceRef.current
      u.rate = 0.88 // a touch slow, so the family can repeat after it
      u.onend = () => setSpeakingId(null)
      u.onerror = () => setSpeakingId(null)
      setSpeakingId(id)
      window.speechSynthesis.speak(u)
    },
    [supported]
  )

  return { speak, speakingId, supported }
}
