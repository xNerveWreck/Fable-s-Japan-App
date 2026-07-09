/**
 * The sound & haptic grammar. Every tone is synthesized on the fly with the
 * Web Audio API — zero samples, zero bytes of assets. Off by default; the
 * toggle lives in Kit. Each sound has a paired vibration where supported.
 *
 *   tap    — stone on stone (did it)
 *   loved  — a soft double heartbeat
 *   skip   — a feather-light brush sweep
 *   stamp  — the deep thunk of a hanko landing
 *   bell   — a temple bell for a completed day
 *   right / wrong — quiz verdicts
 */

export type SoundName = 'tap' | 'loved' | 'skip' | 'stamp' | 'bell' | 'right' | 'wrong'

let ctx: AudioContext | null = null

export function soundEnabled(): boolean {
  try {
    return JSON.parse(localStorage.getItem('tabi:sound') ?? 'false') === true
  } catch {
    return false
  }
}

function ensureCtx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One enveloped oscillator note. */
function note(
  ac: AudioContext,
  at: number,
  freq: number,
  dur: number,
  peak: number,
  type: OscillatorType = 'sine',
  glideTo?: number
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + dur)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

/** A short burst of shaped noise (brush sweeps, hanko texture). */
function noise(ac: AudioContext, at: number, dur: number, peak: number, filterHz: number) {
  const len = Math.ceil(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ac.createBufferSource()
  src.buffer = buf
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterHz
  const gain = ac.createGain()
  gain.gain.value = peak
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start(at)
}

const vibrations: Record<SoundName, number | number[]> = {
  tap: 8,
  loved: [12, 60, 24],
  skip: 6,
  stamp: 45,
  bell: [15, 80, 15],
  right: [10, 40, 10],
  wrong: 60,
}

export function play(name: SoundName): void {
  if (!soundEnabled()) return

  try {
    navigator.vibrate?.(vibrations[name])
  } catch {
    /* no haptics — sound still plays */
  }

  const ac = ensureCtx()
  if (!ac) return
  const t = ac.currentTime + 0.01

  switch (name) {
    case 'tap':
      note(ac, t, 880, 0.07, 0.12, 'sine', 620)
      break
    case 'loved':
      note(ac, t, 523.25, 0.12, 0.1) // C5
      note(ac, t + 0.11, 659.25, 0.18, 0.12) // E5
      break
    case 'skip':
      noise(ac, t, 0.12, 0.05, 1200)
      break
    case 'stamp':
      note(ac, t, 130, 0.18, 0.3, 'sine', 70)
      noise(ac, t, 0.05, 0.12, 400)
      break
    case 'bell':
      note(ac, t, 660, 1.4, 0.16)
      note(ac, t, 1320, 1.0, 0.05)
      note(ac, t, 990, 0.7, 0.03)
      break
    case 'right':
      note(ac, t, 659.25, 0.1, 0.1)
      note(ac, t + 0.1, 880, 0.16, 0.12)
      break
    case 'wrong':
      note(ac, t, 220, 0.2, 0.1, 'triangle', 180)
      break
  }
}
