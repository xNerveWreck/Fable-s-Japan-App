import { jstToday, shiftDate } from './dates'

/**
 * ?demo=1 — seed a lived-in trip so the showcase never opens on an empty
 * state: mid-journey on Day 7 (the Fushimi Inari day), six days of resolved
 * moments with loves and skips, travelers named, a reservation filed.
 * Overwrites existing state. perDay mirrors each day's activity count.
 */
export function seedDemo(): void {
  const moments: Record<string, string> = {}
  const perDay: Record<number, number> = { 1: 4, 2: 5, 3: 5, 4: 6, 5: 5, 6: 5 }
  for (const [day, count] of Object.entries(perDay)) {
    for (let i = 0; i < count; i++) {
      moments[`d${day}:${i}`] = i === 0 ? 'loved' : i === count - 1 ? 'skipped' : 'done'
    }
  }

  const seed: Record<string, unknown> = {
    moments,
    departure: shiftDate(jstToday(), -6), // today is Day 7 — the thousand-gates day
    travelers: [
      { id: 't1', name: 'Mika', animal: 'crane', color: 'sakura' },
      { id: 't2', name: 'Ken', animal: 'tanuki', color: 'pine' },
      { id: 't3', name: 'Yui', animal: 'fox', color: 'gold' },
      { id: 't4', name: 'Taro', animal: 'crab', color: 'indigo' },
    ],
    reservations: { 5: [{ id: 'demo-1', label: 'Shinkansen 12:33 → Kyoto', code: 'SMEX-4471' }] },
    packed: { passports: true, esims: true, suica: true, cash: true, 'walking-shoes': true, 'trash-bag': true },
    'phrase-favs': ['thanks', 'oishii', 'sugoi'],
    'quiz-scores': { t3: 12, t4: 9 },
  }

  for (const [key, value] of Object.entries(seed)) {
    localStorage.setItem(`tabi:${key}`, JSON.stringify(value))
  }
}
