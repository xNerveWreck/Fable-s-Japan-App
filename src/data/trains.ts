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
    days: [2],
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
    days: [2, 3, 4, 5, 11],
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
    days: [4],
    topKmh: 65,
    debut: 2012,
    rarity: 2,
    blurb:
      'A canary-yellow throwback built to echo Japan’s very first subway car, still running under the busiest streets in the world.',
    kidFact:
      'Find the little badge near the door — it marks 1927, the year the real first train ran this exact line.',
  },
  {
    id: 'keio8000',
    name: 'Keiō 8000',
    jp: '京王8000系',
    line: 'Keiō Line',
    days: [3],
    topKmh: 110,
    debut: 1992,
    rarity: 1,
    blurb:
      'The pink-striped workhorse that carries Tokyo west toward the hills — and on Puroland days, sometimes dresses head to toe in Sanrio characters.',
    kidFact:
      'Keiō runs special Sanrio wrap trains — Hello Kitty painted nose to tail. Spot one on the way and the whole day is lucky.',
  },
  {
    id: 'n700s',
    name: 'N700S Shinkansen',
    jp: 'N700S新幹線',
    line: 'Tōkaidō Shinkansen',
    days: [5, 11],
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
    days: [7],
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
    days: [8],
    topKmh: 105,
    debut: 2024,
    rarity: 1,
    blurb: 'The newest train on this whole trip, fresh off the line in 2024, carrying you out of deer country toward the loudest kitchen in Japan.',
    kidFact: 'Run a finger along the seams near the doors — this one’s barely a year old, so the paint still shines showroom-bright.',
  },
  {
    id: 'midosuji',
    name: 'Midōsuji 30000',
    jp: '御堂筋線30000系',
    line: 'Osaka Metro',
    days: [8, 9, 10],
    topKmh: 70,
    debut: 2011,
    rarity: 1,
    blurb: 'Osaka’s busiest subway line, a red-striped workhorse that has carried this city to work and back for generations.',
    kidFact: 'Look for the red line painted along the platform floor — it marks exactly where the doors will stop, every time.',
  },
  {
    id: 'jr323',
    name: '323 Osaka Loop',
    jp: '323系',
    line: 'JR Osaka Loop Line',
    days: [9],
    topKmh: 100,
    debut: 2016,
    rarity: 1,
    blurb: 'Osaka’s answer to the Yamanote — a loop that circles the city all day, and on the Universal branch it goes to work wearing movie costumes.',
    kidFact: 'Some Loop trains bound for USJ are wrapped nose to tail in minions or dinosaurs. Check yours before you board — it might be in character.',
  },
  {
    id: 'skyliner',
    name: 'Keisei Skyliner AE',
    jp: '京成AE形',
    line: 'Keisei Skyliner',
    days: [12],
    topKmh: 160,
    debut: 2010,
    rarity: 2,
    blurb: 'The last train of the trip and the fastest thing in Japan that isn’t a shinkansen — Nippori to Narita in 36 minutes, styled by a fashion designer.',
    kidFact: 'At 160 km/h the rice fields turn into brushstrokes. Its sleek blue nose was designed by Kansai Yamamoto, who also dressed rock stars.',
  },
]
