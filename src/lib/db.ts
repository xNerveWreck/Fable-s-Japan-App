/**
 * IndexedDB for the Kioku journal — entries and photos are too big and too
 * precious for localStorage. Stores: 'journal' keyed by dayId, 'photos'
 * keyed by photo id (Blobs), 'voices' keyed by phrase id (Blobs) — the
 * family's own recordings of each phrase. Deliberately not in Family Sync;
 * audio stays on the phone that recorded it.
 */

export interface JournalPhoto {
  id: string
  ink: boolean // display with the sumi-e filter?
}

export interface JournalEntry {
  dayId: number
  text: string
  authorId?: string
  photos: JournalPhoto[]
  updatedAt: number
}

const DB_NAME = 'tabi-kioku'
const DB_VERSION = 3

let dbPromise: Promise<IDBDatabase> | null = null

function open(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('journal')) db.createObjectStore('journal', { keyPath: 'dayId' })
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos')
      if (!db.objectStoreNames.contains('voices')) db.createObjectStore('voices')
      if (!db.objectStoreNames.contains('feed')) db.createObjectStore('feed') // v3 — the kairanban cache
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

/** The kairanban's offline copy — one record, whole feed. */
export async function putFeedCache(value: unknown): Promise<void> {
  const db = await open()
  const tx = db.transaction('feed', 'readwrite')
  tx.objectStore('feed').put(value, 'cache')
  return txDone(tx)
}

export async function getFeedCache<T>(): Promise<T | undefined> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction('feed').objectStore('feed').get('cache')
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function getEntry(dayId: number): Promise<JournalEntry | undefined> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction('journal').objectStore('journal').get(dayId)
    req.onsuccess = () => resolve(req.result as JournalEntry | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function putEntry(entry: JournalEntry): Promise<void> {
  const db = await open()
  const tx = db.transaction('journal', 'readwrite')
  tx.objectStore('journal').put(entry)
  return txDone(tx)
}

/** Which days have journal content — for the 📓 markers on day cards. */
export async function journalDays(): Promise<Set<number>> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction('journal').objectStore('journal').getAll()
    req.onsuccess = () => {
      const entries = (req.result as JournalEntry[]) ?? []
      resolve(new Set(entries.filter((e) => e.text.trim() || e.photos.length).map((e) => e.dayId)))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function putPhoto(id: string, blob: Blob): Promise<void> {
  const db = await open()
  const tx = db.transaction('photos', 'readwrite')
  tx.objectStore('photos').put(blob, id)
  return txDone(tx)
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction('photos').objectStore('photos').get(id)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function putVoice(id: string, blob: Blob): Promise<void> {
  const db = await open()
  const tx = db.transaction('voices', 'readwrite')
  tx.objectStore('voices').put(blob, id)
  return txDone(tx)
}

export async function getVoice(id: string): Promise<Blob | undefined> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction('voices').objectStore('voices').get(id)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await open()
  const tx = db.transaction('photos', 'readwrite')
  tx.objectStore('photos').delete(id)
  return txDone(tx)
}

/** Downscale an imported photo to trip-journal size (max 1280px, JPEG). */
export async function importPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('photo encode failed'))), 'image/jpeg', 0.82)
  })
}
