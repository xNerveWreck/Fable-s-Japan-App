/** The Discover tab's field guide: how Japan works, gently explained. */

export interface GuideEntry {
  id: string
  title: string
  jp?: string
  body: string
  kidNote?: string
}

export interface GuideSection {
  id: string
  name: string
  jp: string
  emoji: string
  intro: string
  entries: GuideEntry[]
}

export const guideSections: GuideSection[] = [
  {
    id: 'etiquette',
    name: 'Etiquette',
    jp: '作法',
    emoji: '🙇',
    intro: 'Japan runs on quiet consideration. Nobody expects visitors to be perfect — they expect you to try, and trying is warmly rewarded.',
    entries: [
      {
        id: 'bowing',
        title: 'Bowing',
        jp: 'お辞儀',
        body: 'A small nod of the head is plenty for travelers — when thanking, greeting, or apologizing. You’ll start doing it on the phone by day three, and that’s normal.',
        kidNote: 'The deer in Nara bow for crackers. If a deer can learn it, so can we.',
      },
      {
        id: 'shoes',
        title: 'Shoes off',
        jp: '靴を脱ぐ',
        body: 'Shoes come off at ryokan, temples, some restaurants, and fitting rooms. The clue: a step up in the floor and a row of slippers. Toilet slippers are separate — swapping them at the bathroom door and forgetting to swap back is the classic tourist blooper.',
        kidNote: 'Slip-on shoes = superpower. You’ll be in before the grown-ups finish their laces.',
      },
      {
        id: 'trains-quiet',
        title: 'Quiet trains',
        jp: '電車のマナー',
        body: 'Trains are library-quiet. Phones on silent ("manner mode"), calls are a no, conversations at a murmur. Eating on local trains is frowned on — the shinkansen, with its tray tables and bento culture, is the delicious exception.',
        kidNote: 'Train challenge: whisper mode from door to door. The whole country is playing along with you.',
      },
      {
        id: 'chopsticks',
        title: 'Chopstick rules',
        jp: '箸のマナー',
        body: 'Two real taboos: never stick chopsticks upright in rice, and never pass food chopstick-to-chopstick — both echo funeral rites. Resting them across your bowl is fine. Asking for a fork is fine too; nobody minds.',
        kidNote: 'Rubber-band trick: fold the wrapper into a wedge, band the chopsticks at the top — instant training chopsticks anywhere.',
      },
      {
        id: 'trash',
        title: 'The mystery of no trash cans',
        jp: 'ゴミ',
        body: 'Public bins are rare, yet the streets are spotless: people carry their trash home. Keep a small bag in the daypack for wrappers. Konbini bins are for things you bought there.',
        kidNote: 'Secret mission: leave every place cleaner than you found it. Locals will notice. They always notice.',
      },
      {
        id: 'onsen',
        title: 'Onsen bathing',
        jp: '温泉',
        body: 'Wash and rinse completely at the seated showers before entering the shared bath — the bath is for soaking, not soaping. Small towel stays out of the water (fold it on your head like a local). Swimsuits are a no; a private family bath (kashikiri) is the perfect first-timer move.',
        kidNote: 'It’s a giant hot bath you share like a hot spring monkey. Wash first, then soak and count the stars if it’s outdoors.',
      },
      {
        id: 'escalator',
        title: 'Escalator sides',
        jp: 'エスカレーター',
        body: 'Stand left in Tokyo, stand RIGHT in Osaka — a genuine regional rivalry. Watch what locals do and copy them; it changes mid-trip and delights everyone when you get it right.',
      },
      {
        id: 'money-tray',
        title: 'The little money tray',
        jp: 'カルトン',
        body: 'At registers, put cash or card on the small tray rather than handing it over directly. Change comes back with two hands and a bow. Tipping does not exist — great service is the default, and leaving money causes genuine confusion.',
      },
    ],
  },
  {
    id: 'transit',
    name: 'Getting Around',
    jp: '交通',
    emoji: '🚉',
    intro: 'The trains are the attraction. Clean, on time to the second, and genuinely fun — here’s the family playbook.',
    entries: [
      {
        id: 'suica',
        title: 'Suica / IC cards',
        jp: 'Suica・ICカード',
        body: 'One tap-to-pay card rules all trains, subways, buses, vending machines, and konbini nationwide. Add Suica to each iPhone’s Apple Wallet (Watch works too) and top up from the card in seconds — no machines needed. Kids love tapping their own gate.',
        kidNote: 'Your phone is your train ticket. Tap in, tap out, listen for the happy beep.',
      },
      {
        id: 'shinkansen',
        title: 'Riding the Shinkansen',
        jp: '新幹線',
        body: 'Reserve seats a day or two ahead (SmartEX app or any ticket office). Big suitcases need the oversized-luggage seats at car ends — or better, forward the bags. Arrive 10 minutes early; the train stops for exactly 60 seconds. Buy ekiben boxed lunches on the platform.',
        kidNote: 'The nose is 15 meters long and shaped by studying a kingfisher’s beak. It never, ever leaves late — time it!',
      },
      {
        id: 'luggage',
        title: 'Takkyubin luggage forwarding',
        jp: '宅急便',
        body: 'Japan’s best travel secret: hand suitcases to any hotel front desk or konbini and they appear at your next hotel by the next day (~¥2,000/bag). Forward the big bags Tokyo→Kyoto or Kyoto→Osaka and ride the trains with daypacks only. Travel weightless.',
      },
      {
        id: 'metro',
        title: 'Subway survival',
        jp: '地下鉄',
        body: 'Every sign is in English; stations have numbered exits — know your exit number (e.g. "A3") and life is easy. Rush hours (7:30–9:00, 17:30–19:00) with kids and luggage: avoid. Google Maps transit directions are flawless in Japan.',
      },
      {
        id: 'taxi',
        title: 'Taxis',
        jp: 'タクシー',
        body: 'Immaculate, lace-doilied, driver in white gloves. The rear left door opens and closes by itself — do not touch it. Show your destination written in Japanese. GO app = Japan’s Uber. Pricey but perfect for the tired-kid emergency.',
      },
      {
        id: 'koban',
        title: 'Kōban police boxes',
        jp: '交番',
        body: 'Tiny neighborhood police posts on every few blocks. Lost, need directions, dropped a wallet? Go to a kōban. Lost items in Japan get returned at rates that make the news elsewhere — including cash.',
      },
    ],
  },
  {
    id: 'practical',
    name: 'Practical Magic',
    jp: '知恵',
    emoji: '💴',
    intro: 'The small systems that make Japan the easiest hard-looking country in the world.',
    entries: [
      {
        id: 'konbini',
        title: 'The convenience store religion',
        jp: 'コンビニ',
        body: '7-Eleven, Lawson, FamilyMart — every 200 meters, open 24/7: real good food, clean toilets, ATMs that take foreign cards (7-Eleven’s are the most reliable), event tickets, luggage shipping. The konbini will solve 80% of trip problems.',
        kidNote: 'Famichiki (FamilyMart fried chicken) vs 7-Eleven karaage — the family must run this taste test and declare a winner.',
      },
      {
        id: 'cash',
        title: 'Cash vs card',
        jp: '現金',
        body: 'Cards and Suica cover most things now, but keep ¥10,000–20,000 in cash for shrines, small restaurants, market stalls, and coin lockers. Coins pile up fast — the ¥100s feed vending machines and gachapon.',
      },
      {
        id: 'vending',
        title: 'Vending machines',
        jp: '自販機',
        body: 'Five million of them, everywhere, and everything works. Blue labels = cold, red = HOT (hot milk tea and corn soup in cans!). Budget the kids ¥300 of machine money a day and they’ll curate finds like sommeliers.',
        kidNote: 'Hot corn soup. In a can. From a machine on a mountain. You have to. It’s the rules.',
      },
      {
        id: 'toilets',
        title: 'Toilet technology',
        jp: 'トイレ',
        body: 'Heated seats, sound effects, a dozen buttons in Japanese. The one you need: 流す (flush) — often a lever or wall sensor instead. 大 = big flush, 小 = small. The spray button is an adventure you take voluntarily.',
      },
      {
        id: 'wifi',
        title: 'Staying connected',
        jp: '通信',
        body: 'Best move: an eSIM (Ubigi, Airalo) per phone, bought before you fly. Pocket Wi-Fi from the airport works for the whole family at once. Free Wi-Fi exists at konbini and stations but don’t depend on it.',
      },
      {
        id: 'gachapon',
        title: 'Gachapon capsule machines',
        jp: 'ガチャポン',
        body: 'Capsule-toy machines (¥200–500) with astonishing miniatures: tiny food, cats in hats, shrine replicas. Akihabara and malls have walls of hundreds. The perfect small-treasure engine for kids’ souvenir budgets.',
        kidNote: 'The rule of gachapon: you get what you get, and it’s always somehow exactly right.',
      },
    ],
  },
  {
    id: 'seasons',
    name: 'Culture Notes',
    jp: '文化',
    emoji: '🏮',
    intro: 'Little keys that unlock what you’re looking at.',
    entries: [
      {
        id: 'shrine-temple',
        title: 'Shrine or temple?',
        jp: '神社とお寺',
        body: 'Torii gate (two posts, two crossbars, often vermillion) = Shintō shrine; bow slightly before entering, wash hands at the fountain, and it’s two bows, two claps, one bow to pray. Buddhist temples have incense and Buddha statues; hands together quietly, no claps. Both welcome respectful visitors.',
        kidNote: 'Quick ID: gate with no doors = shrine. Big incense cauldron = temple. Now you can’t unsee it.',
      },
      {
        id: 'omamori',
        title: 'Omamori charms',
        jp: 'お守り',
        body: 'Small brocade amulets sold at shrines (~¥500–1,000) for luck, health, studies, safe travel. Beautiful, inexpensive, meaningful souvenirs — but never open one; the luck lives inside.',
        kidNote: 'Pick your quest: good grades? safe travels? sports victory? There’s a charm for it. Do not open. Seriously.',
      },
      {
        id: 'omikuji',
        title: 'Omikuji fortunes',
        jp: 'おみくじ',
        body: 'Shake the box, draw a numbered stick, receive your fortune (~¥100–300). 大吉 = great blessing, 凶 = curse. Bad fortune? Tie it to the racks and leave the bad luck behind — that’s what they’re for.',
      },
      {
        id: 'seasonality',
        title: 'Everything is seasonal',
        jp: '旬',
        body: 'Japan celebrates seasons hard: sakura-everything in spring, cold noodles chased with fireworks in summer, maple-leaf tempura in autumn, strawberry sandwiches in winter. Whatever is "limited edition" (期間限定) right now — get it. It will be gone.',
      },
      {
        id: 'depachika',
        title: 'Depachika food halls',
        jp: 'デパ地下',
        body: 'Under every department store lies a basement food wonderland: ¥10,000 melons, jewel-box pastries, endless free-sample energy. Assemble a fancy picnic dinner for a hotel-room night off.',
      },
      {
        id: 'kawaii',
        title: 'The cult of cute',
        jp: 'かわいい',
        body: 'Construction barriers shaped like ducks, police mascots, a cartoon face on your cheesecake. Kawaii is a national language — every prefecture, train line, and bank has a mascot. The kids will keep a spotting tally without being asked.',
      },
    ],
  },
]
