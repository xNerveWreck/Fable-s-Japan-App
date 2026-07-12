import { useRef, useState } from 'react'
import { useStored } from '../hooks/useStored'
import { allergens } from '../data/kit'
import { decodeMenu, downscale, FAIL_FACE, LensError, menuFixture, type LensFail, type MenuResult } from '../lib/lens'

/** Read a menu · 食 — photograph any menu; allergy flags and kid-safe picks. */
export function MenuLens() {
  const [key] = useStored<string>('claude-key', '')
  const [chosen] = useStored<string[]>('allergies', [])
  const [state, setState] = useState<'idle' | 'reading' | 'done' | 'failed'>('idle')
  const [result, setResult] = useState<MenuResult | null>(null)
  const [fail, setFail] = useState<LensFail>('offline')
  const fileRef = useRef<HTMLInputElement>(null)

  const begin = () => {
    if (!key && !menuFixture()) {
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
      const card = allergens.filter((a) => chosen.includes(a.id))
      setResult(await decodeMenu(b64, key, card))
      setState('done')
    } catch (e) {
      setFail(e instanceof LensError ? e.kind : 'offline')
      setState('failed')
    }
  }

  return (
    <div className="card lens-card menu-lens">
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
          <span className="lens-kanji" aria-hidden="true">食</span>
          <span className="grow">
            <span className="lens-title">Read a menu</span>
            <span className="lens-sub">photograph any menu — allergy flags and kid-safe picks</span>
          </span>
        </button>
      )}
      {state === 'reading' && <div className="lens-reading">Reading the menu…</div>}
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
          {result.dishes.length > 0 && (
            <div className="lens-sect">
              <h3>The menu</h3>
              <div className="menu-dishes">
                {result.dishes.map((d, i) => (
                  <div key={i} className={`menu-dish${d.flag !== 'ok' ? ` ${d.flag}` : ''}`}>
                    <span className="grow">
                      <span className="jp">{d.jp}</span>
                      <span className="menu-en">
                        {d.en}
                        {d.kid && <span className="menu-kid" title="a good pick for the kids"> · 子</span>}
                      </span>
                      {d.why && <span className="menu-why">{d.why}</span>}
                    </span>
                    {d.price && <span className="menu-price">{d.price}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.picks.length > 0 && (
            <div className="lens-sect">
              <h3>Good picks</h3>
              <ul>
                {result.picks.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {result.order && (
            <div className="lens-sect">
              <h3>To order</h3>
              <p className="jp">{result.order}</p>
            </div>
          )}
          <button className="lens-again" onClick={() => setState('idle')}>Read another</button>
        </div>
      )}
    </div>
  )
}
