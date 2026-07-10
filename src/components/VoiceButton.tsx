import { useEffect, useRef, useState } from 'react'
import { getVoice, putVoice } from '../lib/db'
import { MicIcon, PlaySmallIcon } from '../art/icons'

type VState = 'idle' | 'recording' | 'saved' | 'unavailable'

/** One family recording per phrase, kept in IndexedDB. Re-recording overwrites. */
export function VoiceButton({ phraseId }: { phraseId: string }) {
  const [state, setState] = useState<VState>('idle')
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const stopTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let alive = true
    getVoice(phraseId).then((b) => alive && b && setState('saved'))
    return () => {
      alive = false
      if (rec.current?.state === 'recording') rec.current.stop()
      clearTimeout(stopTimer.current)
    }
  }, [phraseId])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/mp4', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m))
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks.current = []
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: r.mimeType })
        if (blob.size > 0) {
          await putVoice(phraseId, blob)
          setState('saved')
        } else setState('idle')
      }
      rec.current = r
      r.start()
      setState('recording')
      stopTimer.current = window.setTimeout(() => r.state === 'recording' && r.stop(), 12000)
    } catch {
      setState('unavailable') // no mic / denied — the button retires quietly
    }
  }

  const stop = () => {
    clearTimeout(stopTimer.current)
    if (rec.current?.state === 'recording') rec.current.stop()
  }

  const playBack = async () => {
    const blob = await getVoice(phraseId)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    void audio.play()
  }

  if (state === 'unavailable') return null
  return (
    <span className="voice-wrap">
      {state === 'saved' && (
        <button className="voice-play" aria-label="Play the family recording" onClick={playBack}>
          <PlaySmallIcon />
        </button>
      )}
      <button
        className={`voice-btn${state === 'recording' ? ' vb-recording' : ''}`}
        aria-label={state === 'recording' ? 'Stop recording' : 'Record this phrase in your own voice'}
        onClick={state === 'recording' ? stop : start}
      >
        <MicIcon />
      </button>
    </span>
  )
}
