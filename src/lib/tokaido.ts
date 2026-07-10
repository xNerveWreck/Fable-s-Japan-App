/**
 * The Tōkaidō line as geometry: sixteen stations Tokyo→Kyoto, cumulative
 * kilometres by haversine, nearest-segment projection of a GPS fix onto the
 * polyline, and the Fuji viewing window (the train passes ~20 km south of
 * the summit around Shin-Fuji; Fuji rides on the RIGHT heading west).
 * Distances are internally consistent, not official rail km.
 */

export type Fix = { lat: number; lon: number }

const R = 6371
const toRad = (d: number) => (d * Math.PI) / 180

export function haversineKm(a: Fix, b: Fix): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export interface Station {
  name: string
  jp: string
  lat: number
  lon: number
  major?: boolean
}

export const STATIONS: Station[] = [
  { name: 'Tokyo', jp: '東京', lat: 35.681, lon: 139.767, major: true },
  { name: 'Shinagawa', jp: '品川', lat: 35.629, lon: 139.739 },
  { name: 'Shin-Yokohama', jp: '新横浜', lat: 35.507, lon: 139.617 },
  { name: 'Odawara', jp: '小田原', lat: 35.256, lon: 139.155, major: true },
  { name: 'Atami', jp: '熱海', lat: 35.104, lon: 139.078 },
  { name: 'Mishima', jp: '三島', lat: 35.126, lon: 138.911 },
  { name: 'Shin-Fuji', jp: '新富士', lat: 35.142, lon: 138.663, major: true },
  { name: 'Shizuoka', jp: '静岡', lat: 34.972, lon: 138.389 },
  { name: 'Kakegawa', jp: '掛川', lat: 34.769, lon: 138.014 },
  { name: 'Hamamatsu', jp: '浜松', lat: 34.704, lon: 137.735, major: true },
  { name: 'Toyohashi', jp: '豊橋', lat: 34.763, lon: 137.382 },
  { name: 'Mikawa-Anjō', jp: '三河安城', lat: 34.969, lon: 137.061 },
  { name: 'Nagoya', jp: '名古屋', lat: 35.17, lon: 136.882, major: true },
  { name: 'Gifu-Hashima', jp: '岐阜羽島', lat: 35.316, lon: 136.686 },
  { name: 'Maibara', jp: '米原', lat: 35.314, lon: 136.29 },
  { name: 'Kyoto', jp: '京都', lat: 34.985, lon: 135.758, major: true },
]

export const CUM_KM: number[] = STATIONS.reduce<number[]>((acc, st, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + haversineKm(STATIONS[i - 1], st))
  return acc
}, [])

export const ROUTE_KM = CUM_KM[CUM_KM.length - 1]

/** Nearest point on the station polyline: km along the route, fraction, and
 *  perpendicular offset (flat-earth per segment — fine at these scales). */
export function project(fix: Fix): { km: number; s: number; offKm: number } {
  let best = { km: 0, offKm: Infinity }
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const a = STATIONS[i]
    const b = STATIONS[i + 1]
    const k = Math.cos(toRad((a.lat + b.lat) / 2))
    const ax = a.lon * k
    const ay = a.lat
    const dx = b.lon * k - ax
    const dy = b.lat - ay
    const len2 = dx * dx + dy * dy
    let t = len2 === 0 ? 0 : ((fix.lon * k - ax) * dx + (fix.lat - ay) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const off = haversineKm(fix, { lat: ay + t * dy, lon: (ax + t * dx) / k })
    if (off < best.offKm) best = { km: CUM_KM[i] + t * (CUM_KM[i + 1] - CUM_KM[i]), offKm: off }
  }
  return { km: best.km, s: best.km / ROUTE_KM, offKm: best.offKm }
}

const iMishima = STATIONS.findIndex((st) => st.name === 'Mishima')
const iShinFuji = STATIONS.findIndex((st) => st.name === 'Shin-Fuji')

/** Fuji is watchable from just past Mishima until ~20 km beyond Shin-Fuji. */
export const FUJI_ZONE = { startKm: CUM_KM[iMishima], endKm: CUM_KM[iShinFuji] + 20 }

export type RideStatus =
  | { kind: 'rolling' }
  | { kind: 'soon'; minutes: number }
  | { kind: 'look' }
  | { kind: 'past' }
  | { kind: 'kyoto' }
  | { kind: 'tunnel' }

export function statusFor(km: number, speedKmh: number, staleSec: number): RideStatus {
  if (staleSec > 25) return { kind: 'tunnel' }
  if (km < FUJI_ZONE.startKm) {
    const eta = ((FUJI_ZONE.startKm - km) / Math.max(speedKmh, 60)) * 60
    return eta <= 20 ? { kind: 'soon', minutes: Math.max(1, Math.ceil(eta)) } : { kind: 'rolling' }
  }
  if (km <= FUJI_ZONE.endKm) return { kind: 'look' }
  if (km / ROUTE_KM > 0.93) return { kind: 'kyoto' }
  return { kind: 'past' }
}
