import { useRef, useState } from 'react'
import { useStored } from '../hooks/useStored'
import { decodeSign, downscale, FAIL_FACE, LensError, lensFixture, type LensFail, type LensResult } from '../lib/lens'

/** Decode a sign · 読む — photograph any sign, learn what it means and what to do. */
export function SignLens() {
  const [key] = useStored<string>('claude-key', '')
  const [state, setState] = useState<'idle' | 'reading' | 'done' | 'failed'>('idle')
  const [result, setResult] = useState<LensResult | null>(null)
  const [fail, setFail] = useState<LensFail>('offline')
  const fileRef = useRef<HTMLInputElement>(null)

  const begin = () => {
    if (!key && !lensFixture()) {
      setFail('no-key')
      setState('failed')
      return
    }
    fileRef.current?.click()
  }

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    setState('reading')
    try {
      const b64 = await downscale(file)
      setResult(await decodeSign(b64, key))
      setState('done')
    } catch (e) {
      setFail(e instanceof LensError ? e.kind : 'offline')
      setState('failed')
    }
  }

  return (
    <div className="card lens-card sign-lens">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void onPhoto(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {state === 'idle' && (
        <button className="lens-begin" onClick={begin}>
          <span className="lens-kanji" aria-hidden="true">読</span>
          <span className="grow">
            <span className="lens-title">Decode a sign</span>
            <span className="lens-sub">photograph any sign — learn what it means and what to do</span>
          </span>
        </button>
      )}
      {state === 'reading' && <div className="lens-reading">Reading the sign…</div>}
      {state === 'failed' && (
        <div className="lens-fail">
          <p>{FAIL_FACE[fail]}</p>
          <button className="lens-again" onClick={() => setState('idle')}>Try again</button>
        </div>
      )}
      {state === 'done' && result && (
        <div className="lens-result">
          {result.warnings.map((w, i) => (
            <p key={i} className="lens-warning">{w}</p>
          ))}
          <div className="lens-sect">
            <h3>What it says</h3>
            <p className="jp">{result.reads}</p>
          </div>
          <div className="lens-sect">
            <h3>What it means</h3>
            <p>{result.means}</p>
          </div>
          {result.do.length > 0 && (
            <div className="lens-sect">
              <h3>What to do</h3>
              <ul>
                {result.do.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="lens-again" onClick={() => setState('idle')}>Decode another</button>
        </div>
      )}
    </div>
  )
}
