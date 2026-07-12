import { useMemo, useState } from 'react'
import { phraseCategories, type Phrase } from '../data/phrases'
import { useSpeech } from '../hooks/useSpeech'
import { useStored } from '../hooks/useStored'
import { SpeakerIcon, StarIcon } from '../art/icons'
import { VoiceButton } from '../components/VoiceButton'
import { SignLens } from '../components/SignLens'
import { MenuLens } from '../components/MenuLens'

export function Phrases() {
  const { speak, speakingId, supported } = useSpeech()
  const [favorites, setFavorites] = useStored<string[]>('phrase-favs', [])
  const [query, setQuery] = useState('')

  const toggleFav = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return null
    return phraseCategories
      .flatMap((c) => c.phrases)
      .filter(
        (p) =>
          p.en.toLowerCase().includes(q) ||
          p.romaji.toLowerCase().includes(q) ||
          p.jp.includes(query.trim()) ||
          (p.note ?? '').toLowerCase().includes(q)
      )
  }, [q, query])

  const favPhrases = phraseCategories.flatMap((c) => c.phrases).filter((p) => favorites.includes(p.id))

  const renderPhrase = (p: Phrase) => (
    <div key={p.id} className="card phrase-card">
      <div className="texts">
        <div className="en">{p.en}</div>
        <div className="jp">{p.jp}</div>
        <div className="romaji">{p.romaji}</div>
        {p.note && <div className="note">{p.note}</div>}
      </div>
      <button
        className={`icon-btn ${favorites.includes(p.id) ? 'starred' : ''}`}
        aria-label={favorites.includes(p.id) ? 'Remove from favorites' : 'Add to favorites'}
        onClick={() => toggleFav(p.id)}
      >
        <StarIcon filled={favorites.includes(p.id)} />
      </button>
      {supported && (
        <button
          className={`icon-btn ${speakingId === p.id ? 'speaking' : ''}`}
          aria-label={`Say "${p.en}" in Japanese`}
          onClick={() => speak(p.id, p.jp)}
        >
          <SpeakerIcon />
        </button>
      )}
      <VoiceButton phraseId={p.id} />
    </div>
  )

  return (
    <div className="screen">
      <header className="screen-head">
        <div className="t-kicker">Phrasebook · 話す</div>
        <h1>Speak</h1>
        <p className="sub">Tap the speaker — the phone says it, the family repeats it.</p>
      </header>

      <div className="search-box">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          placeholder="Search: thank you, toilet, oishii…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <SignLens />
      <MenuLens />

      {filtered ? (
        <>
          <div className="phrase-cat-title">
            <h2>Results</h2>
            <span className="jp">{filtered.length} found</span>
          </div>
          <div className="phrase-list">
            {filtered.length > 0 ? (
              filtered.map(renderPhrase)
            ) : (
              <p className="empty-note">
                Nothing yet — try “thank you”, “train”, or “sugoi”.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {favPhrases.length > 0 && (
            <>
              <div className="phrase-cat-title">
                <h2>⭐️ Your go-to phrases</h2>
              </div>
              <div className="phrase-list">{favPhrases.map(renderPhrase)}</div>
            </>
          )}

          {phraseCategories.map((cat) => (
            <section key={cat.id}>
              <div className="phrase-cat-title">
                <h2>
                  {cat.emoji} {cat.name}
                </h2>
                <span className="jp">{cat.jp}</span>
              </div>
              <div className="phrase-list">{cat.phrases.map(renderPhrase)}</div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
