/** Date-only helpers. The trip runs on Japan's clock, not the phone's. */

/** Today as YYYY-MM-DD in the given timezone (defaults to the device's). */
export function todayStr(timeZone?: string): string {
  return new Date().toLocaleDateString('en-CA', timeZone ? { timeZone } : undefined)
}

export const jstToday = () => todayStr('Asia/Tokyo')

/** Whole days from date a to date b (both YYYY-MM-DD, date-only math). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

/** YYYY-MM-DD that is `delta` days from the given date string. */
export function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10)
}
