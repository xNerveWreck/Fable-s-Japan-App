import { useEffect, useRef, useState } from 'react'
import {
  deletePhoto,
  getEntry,
  getPhoto,
  importPhoto,
  putEntry,
  putPhoto,
  type JournalEntry,
} from '../lib/db'
import { animalEmoji, type Traveler } from '../data/travelers'
import { useStored } from '../hooks/useStored'
import { play } from '../lib/sound'
import { queuePublish } from '../lib/liveFeed'
import { familyId, inkOn } from '../lib/liveSync'
import { TrashIcon } from '../art/icons'

/**
 * The Kioku journal — one entry per day: what actually happened, plus photos
 * that live in IndexedDB and display through a sumi-e ink filter (tap any
 * photo to flip between ink and original).
 */
export function Journal({ dayId }: { dayId: number }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [travelers] = useStored<Traveler[]>('travelers', [])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // load the entry and its photo blobs
  useEffect(() => {
    let alive = true
    const urls: string[] = []
    ;(async () => {
      const loaded = (await getEntry(dayId)) ?? { dayId, text: '', photos: [], updatedAt: 0 }
      if (!alive) return
      setEntry(loaded)
      const map: Record<string, string> = {}
      for (const photo of loaded.photos) {
        const blob = await getPhoto(photo.id)
        if (blob) {
          const url = URL.createObjectURL(blob)
          urls.push(url)
          map[photo.id] = url
        }
      }
      if (alive) setPhotoUrls(map)
    })()
    return () => {
      alive = false
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [dayId])

  const save = (next: JournalEntry) => {
    setEntry(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void putEntry({ ...next, updatedAt: Date.now() }).then(() => {
        queuePublish(next.dayId) // the kairanban: this page flies to the family
      })
    }, 500)
  }

  const addPhotos = async (files: FileList | null) => {
    if (!files || !entry) return
    let next = entry
    for (const file of Array.from(files)) {
      try {
        const blob = await importPhoto(file)
        const id = `p${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        await putPhoto(id, blob)
        const url = URL.createObjectURL(blob)
        setPhotoUrls((m) => ({ ...m, [id]: url }))
        next = { ...next, photos: [...next.photos, { id, ink: true }] }
      } catch {
        /* unreadable file — skip it, keep the rest */
      }
    }
    save(next)
    play('tap')
  }

  const toggleInk = (id: string) => {
    if (!entry) return
    save({ ...entry, photos: entry.photos.map((p) => (p.id === id ? { ...p, ink: !p.ink } : p)) })
  }

  const removePhoto = async (id: string) => {
    if (!entry) return
    await deletePhoto(id)
    setPhotoUrls((m) => {
      const { [id]: gone, ...rest } = m
      if (gone) URL.revokeObjectURL(gone)
      return rest
    })
    save({ ...entry, photos: entry.photos.filter((p) => p.id !== id) })
  }

  if (!entry) return null

  return (
    <div className="card journal">
      <div className="row">
        <div className="t-kicker">Journal · 記憶</div>
        <span className="grow" />
        {travelers.length > 0 && (
          <div className="journal-authors">
            {travelers.map((t) => (
              <button
                key={t.id}
                className={`author-chip ${entry.authorId === t.id ? 'on' : ''}`}
                title={`Written by ${t.name}`}
                onClick={() => save({ ...entry, authorId: entry.authorId === t.id ? undefined : t.id })}
              >
                {animalEmoji(t.animal)}
              </button>
            ))}
          </div>
        )}
      </div>
      <textarea
        className="journal-text"
        placeholder="What actually happened today — the deer that followed you, the vending machine triumph, the meltdown and the recovery…"
        value={entry.text}
        rows={3}
        onChange={(e) => save({ ...entry, text: e.target.value })}
      />
      {entry.photos.length > 0 && (
        <div className="journal-photos">
          {entry.photos.map((photo) => (
            <div key={photo.id} className={`journal-photo ${photo.ink ? 'ink' : ''}`}>
              {photoUrls[photo.id] && (
                <img
                  src={photoUrls[photo.id]}
                  alt="Journal photo"
                  onClick={() => toggleInk(photo.id)}
                  title={photo.ink ? 'Showing as ink wash — tap for original' : 'Tap for ink wash'}
                />
              )}
              <button className="photo-del" aria-label="Delete photo" onClick={() => removePhoto(photo.id)}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          void addPhotos(e.target.files)
          e.target.value = ''
        }}
      />
      <button className="journal-add-photo" onClick={() => fileRef.current?.click()}>
        + Add photos — they’ll be painted in ink
      </button>
      {inkOn() && familyId() !== null && (
        <p className="journal-flows">this page flows to the family · 回覧板</p>
      )}
    </div>
  )
}
