/** Denshadex — the rolling stock this trip actually rides. Grey silhouette
 *  until logged; 乗った! floods the card with ink. Ids are fixed (n700s is
 *  load-bearing for the story suite) — never rename an existing id. */

export interface Train {
  id: string
  name: string
  jp: string
  line: string
  days: number[]
  topKmh: number
  debut: number
  rarity: 1 | 2 | 3
  blurb: string
  kidFact: string
}

export const trains: Train[] = [
  {
    id: 'keikyu1000',
    name: 'Keikyū 1000',
    jp: '京急1000形',
    line: 'Keikyū Airport Line',
    days: [1],
    topKmh: 120,
    debut: 2002,
    rarity: 1,
    blurb:
      'The red rocket waiting right off the plane — first train of the trip, straight from Haneda into the city’s noise and neon.',
    kidFact:
      'Count the doors as it pulls in — three per side, and every one of them opens at once so the whole platform climbs on together.',
  },
  {
    id: 'e235',
    name: 'E235 Yamanote',
    jp: 'E235系',
    line: 'JR Yamanote Loop',
    days: [2, 3, 4, 5],
    topKmh: 90,
    debut: 2015,
    rarity: 1,
    blurb:
      'The train that never really arrives anywhere — it just keeps circling Tokyo, all day and all night, the city’s own carousel.',
    kidFact:
      'Watch the little line map above the doors light up green — it counts down all 30 stations of the loop before you’re back where you started.',
  },
  {
    id: 'ginza1000',
    name: 'Ginza 1000 Retro',
    jp: '銀座線1000系',
    line: 'Tokyo Metro Ginza',
    days: [2, 3],
    topKmh: 65,
    debut: 2012,
    rarity: 2,
    blurb:
      'A canary-yellow throwback built to echo Japan’s very first subway car, still running under the busiest streets in the world.',
    kidFact:
      'Find the little badge near the door — it marks 1927, the year the real first train ran this exact line.',
  },
  {
    id: 'romancecar',
    name: 'Romancecar GSE',
    jp: 'ロマンスカーGSE',
    line: 'Odakyū Hakone',
    days: [6],
    topKmh: 110,
    debut: 2018,
    rarity: 2,
    blurb:
      'The train built for looking, not just riding — a glass observation nose so the front-row seat feels like flying to Hakone.',
    kidFact:
      'Grab the very front seats if you can — through that huge nose window you’ll see the track disappear under the train before anyone else does.',
  },
  {
    id: 'tozan',
    name: 'Hakone Tozan Allegra',
    jp: '箱根登山3000形',
    line: 'Hakone Tozan Line',
    days: [6],
    topKmh: 40,
    debut: 2014,
    rarity: 2,
    blurb:
      'A mountain goat of a train that climbs Hakone by zig-zag, swapping direction at every switchback.',
    kidFact:
      'At the switchbacks the driver and conductor walk past each other to trade ends — count the three reversals.',
  },
  {
    id: 'n700s',
    name: 'N700S Shinkansen',
    jp: 'N700S新幹線',
    line: 'Tōkaidō Shinkansen',
    days: [7],
    topKmh: 285,
    debut: 2020,
    rarity: 3,
    blurb:
      'The blue-striped bullet — 285 km/h of hush, and the fastest thing the family will ride without leaving the ground.',
    kidFact: 'Watch the nose bow to the platform — it is shaped like a duck’s bill to hush the tunnel boom.',
  },
  {
    id: 'randen',
    name: 'Randen Tram',
    jp: '嵐電モボ',
    line: 'Keifuku Arashiyama',
    days: [8, 9],
    topKmh: 40,
    debut: 1975,
    rarity: 2,
    blurb:
      'A one-car tram that’s been rattling through Arashiyama’s back streets since before your grandparents were born, bell and all.',
    kidFact: 'Listen for the bell right before it pulls away — the driver rings it by hand, every single stop.',
  },
  {
    id: 'kintetsu',
    name: 'Kintetsu 8A',
    jp: '近鉄8A系',
    line: 'Kintetsu Nara Line',
    days: [11],
    topKmh: 105,
    debut: 2024,
    rarity: 1,
    blurb: 'The newest train on this whole trip, fresh off the line in 2024, carrying you into deer country in two-tone quiet.',
    kidFact: 'Run a finger along the seams near the doors — this one’s barely a year old, so the paint still shines showroom-bright.',
  },
  {
    id: 'midosuji',
    name: 'Midōsuji 30000',
    jp: '御堂筋線30000系',
    line: 'Osaka Metro',
    days: [12, 13],
    topKmh: 70,
    debut: 2011,
    rarity: 1,
    blurb: 'Osaka’s busiest subway line, a red-striped workhorse that has carried this city to work and back for generations.',
    kidFact: 'Look for the red line painted along the platform floor — it marks exactly where the doors will stop, every time.',
  },
  {
    id: 'haruka',
    name: 'Haruka 281',
    jp: 'はるか281系',
    line: 'JR Kansai Airport Express',
    days: [14],
    topKmh: 130,
    debut: 1994,
    rarity: 2,
    blurb: 'The last train of the trip — a swept-nose express that carries the whole family from Kyoto straight out to the airport gate.',
    kidFact: 'Watch for the oversized luggage racks — bigger than any other train’s, built just for suitcases heading home.',
  },
]
