import { useState } from 'react'
import { animals, animalEmoji, inkColors, type Traveler } from '../data/travelers'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'

/**
 * The four travelers — the family stops being an abstraction. Names, animal
 * mascots, and each person's ink color, shown as a compact card on Journey
 * home with an inline editor.
 */
export function TravelersCard() {
  const [travelers, setTravelers] = useStored<Traveler[]>('travelers', [])
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftAnimal, setDraftAnimal] = useState<string>(animals[0].id)

  const add = () => {
    const name = draftName.trim()
    if (!name) return
    const traveler: Traveler = {
      id: `t${Date.now()}`,
      name,
      animal: draftAnimal,
      color: inkColors[travelers.length % inkColors.length],
    }
    setTravelers((t) => [...t, traveler])
    setDraftName('')
    setDraftAnimal(animals[(travelers.length + 1) % animals.length].id)
    play('tap')
  }

  const remove = (id: string) => setTravelers((t) => t.filter((x) => x.id !== id))

  return (
    <>
      <div className="section-title">
        <h2>The travelers</h2>
        <span className="jp">旅人 · {travelers.length || 'add yours'}</span>
      </div>
      <div className="card travelers-card">
        {travelers.length > 0 && (
          <div className="traveler-row-wrap">
            {travelers.map((t) => (
              <button
                key={t.id}
                className={`traveler-chip text-${t.color}`}
                onClick={() => editing && remove(t.id)}
                title={editing ? `Remove ${t.name}` : t.name}
              >
                <span className="mascot">{animalEmoji(t.animal)}</span>
                <span className="name">{t.name}</span>
                {editing && <span className="x">✕</span>}
              </button>
            ))}
          </div>
        )}
        {travelers.length === 0 && !editing && (
          <p className="pocket-hint" style={{ marginTop: 0 }}>
            Give the family names and mascots — packing, quiz scores, and journal entries become theirs.
          </p>
        )}

        {editing ? (
          <>
            <div className="animal-picker">
              {animals.map((a) => (
                <button
                  key={a.id}
                  className={`animal-opt ${draftAnimal === a.id ? 'on' : ''}`}
                  onClick={() => setDraftAnimal(a.id)}
                  aria-label={a.label}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
            <div className="pocket-add">
              <input
                placeholder="Name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <button className="icon-btn" aria-label="Add traveler" onClick={add}>
                +
              </button>
            </div>
            <button className="travelers-done" onClick={() => setEditing(false)}>
              Done
            </button>
          </>
        ) : (
          <button className="travelers-edit" onClick={() => setEditing(true)}>
            {travelers.length === 0 ? 'Add the travelers →' : 'Edit'}
          </button>
        )}
      </div>
    </>
  )
}
