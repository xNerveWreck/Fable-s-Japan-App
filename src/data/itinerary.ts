/**
 * The journey: 12 days, four travelers, first time in Japan — the real one.
 * Tokyo → Kyoto (Gion Matsuri week) → Nara → Osaka → Tokyo, paced for a
 * family in July heat: out by eight, AC at noon, evenings out — the
 * festivals are evening events anyway.
 */

export type ActivityKind = 'food' | 'sight' | 'ride' | 'rest' | 'shop' | 'magic'

export interface Activity {
  time: string
  title: string
  jp?: string
  note: string
  kind: ActivityKind
  kidTip?: string
}

export type DayColor = 'sakura' | 'pine' | 'gold' | 'indigo'

export interface Day {
  id: number
  /** Calendar date, YYYY-MM-DD (Japan time once airborne). */
  date: string
  city: string
  cityJp: string
  title: string
  theme: string
  color: DayColor
  stay: string
  rainPlan?: string
  /** The Tokyo→Kyoto shinkansen day: renders the Fuji Window scroll. */
  fujiWindow?: boolean
  /** The Nara day: renders the Deer Diplomacy dojo. */
  deerDojo?: boolean
  activities: Activity[]
}

export const TRIP_LENGTH = 12

export const itinerary: Day[] = [
  {
    id: 1,
    date: '2026-07-12',
    city: 'Home',
    cityJp: '旅立ち',
    title: 'The Leap',
    theme: 'The day the plane eats. Take off on a Sunday, land on a Monday — the trip begins the moment the door closes.',
    color: 'indigo',
    stay: 'A window seat, somewhere over the Pacific',
    activities: [
      {
        time: '7:00',
        title: 'Last pack check',
        note: 'Passports ×4, chargers, the printed backup page — and empty space in every bag. A suitcase that leaves full comes home overstuffed; leave room for treasure.',
        kind: 'rest',
        kidTip: 'Choose one pocket-sized friend to travel with you. It gets the window seat at takeoff.',
      },
      {
        time: '9:00',
        title: 'Drive to LAX',
        note: 'UA39 to Tokyo Haneda. Say it out loud at the gate, because it is true: we are flying to Japan today.',
        kind: 'ride',
      },
      {
        time: '11:30',
        title: 'Wheels up — eleven hours of ocean',
        jp: 'いってきます',
        note: 'Movies, naps, and a walk down the aisle every hour or so. Dinner over the Pacific, breakfast over the Pacific, and somehow it is tomorrow.',
        kind: 'ride',
        kidTip: 'Ittekimasu means "I’m going — and coming back." It’s what Japanese families call out at the door. Try it as the plane leaves the gate.',
      },
      {
        time: '??:??',
        title: 'Cross the date line',
        note: 'Somewhere out over the middle of the ocean, Sunday quietly becomes Monday. The plane eats a whole day of your life — and gives it back on the way home.',
        kind: 'magic',
        kidTip: 'Tonight has no midnight. You will go looking for Sunday night and it simply won’t be there. Where did it go? (Nobody actually knows.)',
      },
    ],
  },
  {
    id: 2,
    date: '2026-07-13',
    city: 'Tokyo',
    cityJp: '東京',
    title: 'Soft Landing',
    theme: 'Arrive gently. Today has one job: get everyone fed, bathed, and asleep at a Japanese hour.',
    color: 'sakura',
    stay: 'Hotel Tokyo Trip, Nishi-Nippori',
    rainPlan: 'Perfect rain day already — everything is indoors or a short dash.',
    activities: [
      {
        time: '15:05',
        title: 'Land at Haneda',
        jp: '羽田空港',
        note: 'Immigration with the Visit Japan Web QR codes ready, then load Suica cards onto everyone’s phones and switch the eSIMs on. The kids get to tap their own gates from minute one.',
        kind: 'ride',
        kidTip: 'The airport has a rooftop observation deck — watch one plane leave for home, then go start your adventure.',
      },
      {
        time: '16:30',
        title: 'Trains to Nishi-Nippori',
        note: 'Keikyū into the city, then the Yamanote loop north — about an hour door to door. Watch Tokyo assemble itself outside the window, low houses turning into neon canyons.',
        kind: 'ride',
      },
      {
        time: '18:00',
        title: 'Check in, breathe out',
        note: 'Drop the bags, wash the flight off your faces, and let the room stop moving. You made it.',
        kind: 'rest',
      },
      {
        time: '18:45',
        title: 'The konbini dinner rite',
        jp: 'コンビニ',
        note: 'Walk to the nearest 7-Eleven or Lawson. First-night dinner of onigiri, egg sandwiches, and mystery drinks is a rite of passage.',
        kind: 'food',
        kidTip: 'Everyone picks one snack they can’t identify from the label. Trade bites. Rank them.',
      },
      {
        time: '19:30',
        title: 'Yanaka Ginza at dusk',
        jp: '谷中銀座',
        note: 'Ten minutes on foot: an old shopping street the earthquakes and fires somehow missed, ending at the "sunset staircase." One street snack each, then home — jet lag wins tonight, and tomorrow belongs to Kitty-chan.',
        kind: 'magic',
        kidTip: 'Yanaka is Tokyo’s cat town. Seven carved cats hide along the street — start counting tonight, the hunt runs all trip.',
      },
    ],
  },
  {
    id: 3,
    date: '2026-07-14',
    city: 'Tokyo',
    cityJp: '東京',
    title: 'Puroland Day',
    theme: 'Kawaii headquarters — a fully indoor, air-conditioned kingdom on the hottest kind of day, then Shinjuku switches its lights on.',
    color: 'gold',
    stay: 'Hotel Tokyo Trip, Nishi-Nippori',
    rainPlan: 'Puroland is entirely indoors — the day is rain-proof end to end.',
    activities: [
      {
        time: '8:30',
        title: 'Yamanote west, Keiō out',
        jp: '京王線',
        note: 'Loop to Shinjuku, then the Keiō line to Keiō-Tama-Center — about 35 minutes and a seven-minute walk. Tickets are already booked; today is pure arrival.',
        kind: 'ride',
        kidTip: 'Some Keiō trains wear full Sanrio livery — Hello Kitty painted nose to tail. Spot one and you’ve already won the morning.',
      },
      {
        time: '10:00',
        title: 'Sanrio Puroland',
        jp: 'サンリオピューロランド',
        note: 'Hello Kitty’s entire indoor kingdom: a boat ride through every character’s world, live shows, a glittering parade — and blessed air conditioning while the city outside bakes.',
        kind: 'magic',
        kidTip: 'The characters bow when you bow. Try it. Deepest bow wins.',
      },
      {
        time: '13:00',
        title: 'Character lunch & the shops',
        note: 'Curry with a Kitty face on it, desserts too cute to stab a fork into. The shops here sell things that exist nowhere else on Earth — treasure rule applies.',
        kind: 'food',
        kidTip: 'Souvenir rule of the trip: one treasure each per city. Choose like a dragon.',
      },
      {
        time: '16:30',
        title: 'Shinjuku: Godzilla & Memory Lane',
        note: 'Back via Shinjuku while the neon warms up. Say hi to the life-size Godzilla head looming over Kabukichō, then squeeze down Omoide Yokochō — lantern-lit yakitori alleys from the 1940s, smoky and glowing.',
        kind: 'sight',
        kidTip: 'Godzilla roars on the hour. Get the timing right and film it — nobody at school will believe you otherwise.',
      },
      {
        time: '18:30',
        title: 'Depachika dinner hunt',
        jp: 'デパ地下',
        note: 'A department-store basement food hall: a food museum where everything is for sale. Everyone points, everyone chooses, picnic dinner back at the hotel.',
        kind: 'food',
        kidTip: 'Pick one dessert you cannot name. The fancier the box, the better the mystery.',
      },
    ],
  },
  {
    id: 4,
    date: '2026-07-15',
    city: 'Tokyo',
    cityJp: '東京',
    title: 'Old Tokyo, Tall Tokyo',
    theme: 'Start where Tokyo started, climb to where it ends, finish in the crowd that never stops crossing.',
    color: 'pine',
    stay: 'Hotel Tokyo Trip, Nishi-Nippori',
    rainPlan: 'Nakamise arcade is covered; swap Shibuya for the Sumida Aquarium under Skytree.',
    activities: [
      {
        time: '8:00',
        title: 'Sensō-ji before the crowds',
        jp: '浅草寺',
        note: 'Tokyo’s oldest temple. Walk through the great Kaminarimon lantern gate, let the kids waft incense smoke over their heads for luck, and draw omikuji fortunes (¥100 — a bad one gets tied to the rack and left behind).',
        kind: 'sight',
        kidTip: 'Find the giant straw sandals hanging on the temple gate. They’re warnings to demons: someone very big lives here.',
      },
      {
        time: '9:30',
        title: 'Nakamise snack street',
        jp: '仲見世通り',
        note: 'The 250-meter approach to the temple is lined with stalls that have sold snacks for 300 years. Fresh ningyo-yaki cakes, melon pan, agemanju — breakfast, round two.',
        kind: 'food',
        kidTip: 'Watch the ningyo-yaki machines stamp out little cakes shaped like lanterns and birds — then eat one warm.',
      },
      {
        time: '11:30',
        title: 'Skytree — the midday AC move',
        jp: '東京スカイツリー',
        note: 'Up 450 meters while the streets cook. On a clear day Fuji floats on the horizon like a painting. (Rainy or sold out? The Ueno museums hold the same cool, dark hours.)',
        kind: 'sight',
        kidTip: 'There’s a section of glass floor. Dare accepted?',
      },
      {
        time: '15:30',
        title: 'Shibuya Crossing + Hachikō',
        jp: '渋谷スクランブル交差点',
        note: 'Cross it once at street level in the swarm, then find the statue of Hachikō — tell the kids his story, and warn them it has a sad part.',
        kind: 'magic',
        kidTip: 'Cross the scramble, then watch the same chaos from the Starbucks window above. Spot where you just walked.',
      },
      {
        time: '17:00',
        title: 'Takeshita Street, quickly',
        jp: '竹下通り',
        note: 'One stop to Harajuku for the teen-fashion gauntlet: crepe stands, rainbow cotton candy bigger than a head, purikura photo booths.',
        kind: 'shop',
        kidTip: 'Family purikura session — the booths make everyone’s eyes enormous. Print the stickers, they go in the journal.',
      },
      {
        time: '19:00',
        title: 'Sushi train, then suitcases',
        jp: '回転寿司',
        note: 'Conveyor-belt sushi for dinner: order on the touchscreen, dishes arrive by bullet-train rail. Then home to pack — the real shinkansen leaves tomorrow.',
        kind: 'food',
        kidTip: 'The plates arrive on a little shinkansen. Race: who can send the empty tray back first?',
      },
    ],
  },
  {
    id: 5,
    date: '2026-07-16',
    city: 'Kyoto',
    cityJp: '京都',
    title: 'The Bullet Train Day',
    theme: 'One last Tokyo morning, then 285 km/h to the old capital — arriving on the biggest festival night of the year.',
    color: 'indigo',
    stay: 'Airbnb machiya, Shimogyō ward',
    rainPlan: 'The train doesn’t care about rain, and Yoiyama’s stalls run under a roof of umbrellas.',
    fujiWindow: true,
    activities: [
      {
        time: '9:30',
        title: 'Check out, Tokyo Station',
        jp: '東京駅',
        note: 'Yamanote down to Tokyo Station with time to spare — the station is a city with platforms. Find the brick facade outside if there’s a minute.',
        kind: 'ride',
      },
      {
        time: '11:30',
        title: 'Ekiben hunt on the platform',
        jp: '駅弁',
        note: 'Buy ekiben boxed lunches and drinks before boarding — eating a bento at 285 km/h is a core memory.',
        kind: 'food',
        kidTip: 'Pick the bento by its box, not its contents. The box is the adventure.',
      },
      {
        time: '12:00',
        title: 'Shinkansen to Kyoto — seats D/E',
        jp: '新幹線',
        note: 'Two hours and a quarter of Japan on fast-forward. Reserved right-side seats D/E: Mt. Fuji shows up around 40 minutes in — low odds in July haze, but the seats were free to choose.',
        kind: 'ride',
        kidTip: 'Keep watch on the right around minute 40: if the sky is kind, Fuji fills the whole window. The scroll below keeps the appointment for you.',
      },
      {
        time: '14:30',
        title: 'Bags down, breath caught',
        note: 'Airbnb check-in opens at 4 — until then it’s station lockers or the host’s storage, and an air-conditioned pause. Tonight runs late; charge everyone.',
        kind: 'rest',
      },
      {
        time: '18:00',
        title: 'Yoiyama — the biggest night',
        jp: '宵山',
        note: 'July 16th is THE night: Shijō and Karasuma close to cars, the great festival floats stand lit with lanterns, food stalls run to the horizon, and the whole city comes out in yukata. All of it walking distance from your door.',
        kind: 'magic',
        kidTip: 'Listen for Gion-bayashi — flutes and bells played by musicians sitting way up inside the floats. Follow the sound to the biggest one.',
      },
    ],
  },
  {
    id: 6,
    date: '2026-07-17',
    city: 'Kyoto',
    cityJp: '京都',
    title: 'Gion Matsuri',
    theme: 'A thousand-year-old parade in the morning, lanterns by night — festival day, paced for the heat.',
    color: 'gold',
    stay: 'Airbnb machiya, Shimogyō ward',
    rainPlan: 'The parade rolls rain or shine — the floats get clear ponchos, and so do you.',
    activities: [
      {
        time: '8:30',
        title: 'Yamaboko Junkō — the float parade',
        jp: '山鉾巡行',
        note: 'Wooden towers on wheels, taller than the buildings, pulled by fifty people each — a parade running since the year 869. Watch from Oike-dōri’s north side, west of Karasuma: roomier, shadier, kid-friendly.',
        kind: 'magic',
        kidTip: 'Wait for a corner: they turn the whole tower by dragging it sideways over wet bamboo. It’s called tsuji-mawashi, and it’s the loudest creak in Japan.',
      },
      {
        time: '12:00',
        title: 'Retreat, regroup, AC',
        note: 'Back to the machiya for the hot hours — lunch, fans, flop. The festival isn’t going anywhere; it’s been here eleven centuries.',
        kind: 'rest',
      },
      {
        time: '16:30',
        title: 'Shirakawa canal & Hanamikōji',
        jp: '祇園白川',
        note: 'Gion as the lanterns flick awake: willows over the canal, wooden teahouses down Hanamikōji, and maybe — maybe — a geiko slipping between doors.',
        kind: 'sight',
        kidTip: 'The little stone bridge over the canal is Kyoto’s most photographed spot. Herons fish under it — count the statues that turn out to be real birds.',
      },
      {
        time: '18:00',
        title: 'Mikoshi Togyo at Yasaka',
        jp: '神輿渡御',
        note: 'Portable shrines carried on a hundred shoulders, shouted through the streets near Yasaka Shrine. Watch from the edges — it’s loud, sweaty, and glorious.',
        kind: 'magic',
        kidTip: 'The carriers chant "hoitto, hoitto!" to keep time. It’s okay to chant along. Quietly. From the side.',
      },
      {
        time: '19:30',
        title: 'Pontochō alley dinner',
        jp: '先斗町',
        note: 'A lantern-lit alley one tatami-mat wide. In summer, restaurants build dining platforms over the river. Yakitori or okonomiyaki level — no reservations needed if you eat early.',
        kind: 'food',
      },
    ],
  },
  {
    id: 7,
    date: '2026-07-18',
    city: 'Kyoto',
    cityJp: '京都',
    title: 'A Thousand Gates',
    theme: 'The mountain of vermillion torii at dawn, a forest that creaks like a ship, and a temple on stilts at golden hour.',
    color: 'sakura',
    stay: 'Airbnb machiya, Shimogyō ward',
    rainPlan: 'Fushimi Inari is actually magical in rain — umbrellas and fewer people. The bamboo hushes louder.',
    activities: [
      {
        time: '7:00',
        title: 'Fushimi Inari at seven',
        jp: '伏見稲荷大社',
        note: 'Ten thousand vermillion gates tunneling up the mountain — magical at seven, brutal at noon, so we go at seven. JR Nara line, two stops. Hike to the Yotsutsuji overlook (40 min) for the city view; the full loop is optional credit.',
        kind: 'magic',
        kidTip: 'This whole mountain belongs to fox messengers. Count the fox statues — check what each one holds in its mouth: a key, a scroll, a jewel?',
      },
      {
        time: '9:00',
        title: 'Fox snacks at the base',
        note: 'Kitsune udon (the fox’s favorite fried tofu) and fox-face senbei crackers at the shrine-front shops.',
        kind: 'food',
      },
      {
        time: '10:30',
        title: 'Arashiyama Bamboo Grove',
        jp: '嵐山竹林',
        note: 'Across town to the famous green corridor before the midday heat. Stand still and listen — the stalks knock and creak in the wind.',
        kind: 'sight',
        kidTip: 'Close your eyes for ten seconds in the middle of the grove. That sound has an official name: one of Japan’s "100 Soundscapes."',
      },
      {
        time: '12:30',
        title: 'The AC hours',
        note: 'Back to the machiya while the city bakes. The heat plan is the plan: melt nothing, nap something.',
        kind: 'rest',
      },
      {
        time: '16:30',
        title: 'Kiyomizu-dera + the stone lanes',
        jp: '清水寺',
        note: 'The great temple veranda stands on wooden stilts over the hillside — no nails. Drink from the Otowa waterfall, then wander down Sannenzaka and Ninenzaka as the tour groups thin out.',
        kind: 'sight',
        kidTip: 'The waterfall splits into three streams — health, school, love. Drink from ONE. Choosing all three is greedy, and the monks are watching.',
      },
      {
        time: '19:00',
        title: 'Kamo riverside dinner, then pack',
        note: 'Udon or tonkatsu near the river, ice cream on the Sanjō bridge while the herons fish under the lights. Tomorrow: deer.',
        kind: 'food',
      },
    ],
  },
  {
    id: 8,
    date: '2026-07-19',
    city: 'Nara',
    cityJp: '奈良',
    title: 'The Deer Day',
    theme: 'Sacred deer that bow for crackers, the giant Buddha, then down the line to the loudest kitchen in Japan.',
    color: 'pine',
    stay: 'Daiwa Roynet, Sakaisuji-Honmachi, Osaka',
    rainPlan: 'Deer come out in rain anyway (they want the crackers). The Great Buddha is under the world’s biggest wooden roof.',
    deerDojo: true,
    activities: [
      {
        time: '8:30',
        title: 'JR Nara line south',
        note: 'Check out and ride 45 minutes into Japan’s first capital. Sit up front; the last stretch runs through hills and bamboo.',
        kind: 'ride',
      },
      {
        time: '9:30',
        title: 'Nara Park & the bowing deer',
        jp: '奈良公園',
        note: 'Twelve hundred wild deer, considered sacred messengers for 1,300 years. Buy shika-senbei crackers (¥200) from the old ladies’ stands — hold them high, bow, and the deer bow back.',
        kind: 'magic',
        kidTip: 'Bow first, then feed. Empty hands out and open means "all done!" — they understand it. Mostly.',
      },
      {
        time: '11:00',
        title: 'Tōdai-ji Great Buddha',
        jp: '東大寺',
        note: 'A 15-meter bronze Buddha from the year 752 inside one of the largest wooden buildings on Earth. His open hand alone is taller than a person.',
        kind: 'sight',
        kidTip: 'Behind the Buddha is a pillar with a hole the size of his nostril. Crawl through it and you’re granted enlightenment. Kids fit. Parents, assess honestly.',
      },
      {
        time: '12:30',
        title: 'Mochi-pounding show & lunch',
        note: 'Nakatanidou’s mochi masters pound rice at full speed with shouts and flying hammers — then sell you the softest yomogi mochi of your life, still warm.',
        kind: 'food',
        kidTip: 'They pound the rice three hits per second. Try clapping that fast while you watch.',
      },
      {
        time: '15:00',
        title: 'Kintetsu to Osaka, check in',
        note: 'The express to Namba (~40 min), then the Midōsuji line two stops to Honmachi. Check-in from 2pm — one room, two twin beds, four people: kids bunk with parents, completely normal in Japan.',
        kind: 'ride',
      },
      {
        time: '18:00',
        title: 'Dōtonbori at full neon',
        jp: '道頓堀',
        note: 'The Glico running man, the giant mechanical crab, takoyaki flipped by guys with the hands of blackjack dealers. Kuidaore — "eat until you fall over" — is the local motto. Tonight, it’s dinner.',
        kind: 'magic',
        kidTip: 'Scavenger hunt: find the running man, the giant crab, the puffer-fish lantern, and the dragon eating a wall. Photo of each = takoyaki reward.',
      },
    ],
  },
  {
    id: 9,
    date: '2026-07-20',
    city: 'Osaka',
    cityJp: '大阪',
    title: 'Universal Day',
    theme: 'Mario, minions, and wizards, one whole day of it — with water breaks on the hour, because July.',
    color: 'gold',
    stay: 'Daiwa Roynet, Sakaisuji-Honmachi, Osaka',
    rainPlan: 'Ponchos and shorter lines — half of USJ’s queues are indoors anyway.',
    activities: [
      {
        time: '7:30',
        title: 'Chūō line → the Loop → Universal City',
        note: 'About 35 minutes from Honmachi. Power bank in the bag, hats on heads — today is long on purpose.',
        kind: 'ride',
        kidTip: 'The Loop line’s Universal trains wear full movie wraps. If yours has minions on it, that’s a good omen.',
      },
      {
        time: '8:30',
        title: 'Rope drop at USJ',
        jp: 'ユニバ',
        note: 'Arrive BEFORE opening. The moment you’re through the gate, grab the free Super Nintendo World timed-entry in the USJ app — it runs out by mid-morning.',
        kind: 'ride',
      },
      {
        time: '10:30',
        title: 'Super Nintendo World',
        jp: 'マリオの世界',
        note: 'You enter through an actual warp pipe and come out inside the game — coin blocks, Koopa shells, Bowser’s castle on the hill. Power-up bands make the whole land playable.',
        kind: 'magic',
        kidTip: 'Punch the blocks. All of them. The band keeps score, and yes, there’s a family leaderboard.',
      },
      {
        time: '13:30',
        title: 'Shows, shade, water — repeat',
        note: 'The July rule: hourly water breaks for the kids, forced if necessary, and alternate outdoor queues with indoor shows. The park is a marathon, not a sprint.',
        kind: 'rest',
      },
      {
        time: '19:00',
        title: 'Loop home, easy dinner',
        note: 'Back to Honmachi’s quiet streets — exactly what post-USJ legs need. Noodles, bath, collapse.',
        kind: 'food',
      },
    ],
  },
  {
    id: 10,
    date: '2026-07-21',
    city: 'Osaka',
    cityJp: '大阪',
    title: 'Daruma & Whale Sharks',
    theme: 'A hillside of ten thousand wishing dolls in the morning, whale sharks in the afternoon, jiggly cheesecake to finish.',
    color: 'indigo',
    stay: 'Daiwa Roynet, Sakaisuji-Honmachi, Osaka',
    rainPlan: 'Kaiyūkan and the covered arcades carry a rainy day whole.',
    activities: [
      {
        time: '8:00',
        title: 'Katsuōji, the daruma temple',
        jp: '勝尾寺',
        note: 'Midōsuji line to Senri-Chūō (~20 min), then bus 29 (~35 min — it runs thin on weekdays, check the schedule; a taxi at ~¥3,000 is the backup). Thousands of daruma dolls tucked into every ledge, lantern, and tree root — winners’ wishes, left on the hillside.',
        kind: 'magic',
        kidTip: 'A daruma gets one eye painted when you make your wish, the other when it comes true. Find the tiniest one hiding — some are smaller than your thumb.',
      },
      {
        time: '12:00',
        title: 'Back down the hill, AC lunch',
        note: 'Return to town for the hot hours. Eat indoors, plan the afternoon from a cold seat.',
        kind: 'rest',
      },
      {
        time: '14:00',
        title: 'Kaiyūkan Aquarium',
        jp: '海遊館',
        note: 'One of the planet’s great aquariums: a spiral walk eight stories down around a central Pacific tank where whale sharks cruise past your face. Otters, penguins, and a touch pool of rays near the end.',
        kind: 'magic',
        kidTip: 'The whale sharks are named Kai and Yū. The spiral means you’ll meet them five times — wave every time, they’re keeping count.',
      },
      {
        time: '16:30',
        title: 'Kuromon Market graze',
        jp: '黒門市場',
        note: 'Osaka’s market eats: grilled scallops with butter, fresh-cut fruit skewers, wagyu skewers if you’re celebrating. Eat standing, point at things, be happy.',
        kind: 'food',
      },
      {
        time: '18:00',
        title: 'Rikuro & the last treasure run',
        note: 'Shinsaibashi’s covered arcade: Don Quijote for chaotic souvenir everything, and Rikuro’s jiggly cheesecake fresh from the oven — get one whole, eat it warm as a family.',
        kind: 'shop',
        kidTip: 'They stamp every Rikuro’s cheesecake with a smiling uncle. It jiggles. That’s the whole point. Take the jiggle video before you eat him.',
      },
      {
        time: '19:30',
        title: 'Last Osaka dinner, pack',
        note: 'Family vote: the best thing anyone ate in Osaka — go have it one more time. Then suitcases; the shinkansen points home tomorrow.',
        kind: 'food',
      },
    ],
  },
  {
    id: 11,
    date: '2026-07-22',
    city: 'Tokyo',
    cityJp: '東京',
    title: 'The Return',
    theme: 'Back up the Tōkaidō with Fuji on the other side, one last Tokyo evening in the old neighborhood.',
    color: 'sakura',
    stay: 'One last hotel, Ueno/Nippori',
    rainPlan: 'A travel day and a covered market — rain barely notices you.',
    activities: [
      {
        time: '9:30',
        title: 'Check out, Shin-Osaka',
        jp: '新大阪',
        note: 'Out by 11 at the latest; the Midōsuji line runs straight to Shin-Osaka. Grab platform snacks — you know the drill by now.',
        kind: 'ride',
      },
      {
        time: '11:00',
        title: 'Shinkansen home-bound — seats A',
        jp: '新幹線',
        note: 'Two and a half hours back to Tokyo. Going east, Fuji switches sides: window seats A, on the LEFT this time.',
        kind: 'ride',
        kidTip: 'Same mountain, new angle. If it hid behind the haze on the way down, this is Fuji’s last chance to say hello — and yours to wave goodbye.',
      },
      {
        time: '14:30',
        title: 'Check in at Ueno/Nippori',
        note: 'The trip’s last hotel, back in week-one territory. You know this neighborhood now — that’s a different city than the one you landed in.',
        kind: 'rest',
      },
      {
        time: '16:00',
        title: 'Ameyoko souvenir run',
        jp: 'アメ横',
        note: 'Ueno’s market street under the train tracks: snacks by the kilo, socks with sushi on them, the last Don Quijote sweep. Whatever the treasure list still needs, it’s here.',
        kind: 'shop',
        kidTip: 'Final treasure audit: one per city was the rule. Anyone short a city gets to fix it tonight.',
      },
      {
        time: '18:30',
        title: 'The farewell-favorite dinner',
        note: 'Family vote: the best thing anyone ate in twelve days — go have it one more time. Ties settled by janken (rock-paper-scissors), the Japanese way. Then repack for the flight.',
        kind: 'food',
      },
    ],
  },
  {
    id: 12,
    date: '2026-07-23',
    city: 'Home',
    cityJp: '帰り道',
    title: 'The Long Way Home',
    theme: 'One last konbini breakfast, one very fast train, and a plane that lands before it takes off.',
    color: 'indigo',
    stay: 'The plane — chasing the sun home',
    activities: [
      {
        time: '8:00',
        title: 'Konbini breakfast, one last time',
        note: 'Egg sandos and melon pan for the road. Pour one out for the 7-Eleven you’ll dream about for years.',
        kind: 'food',
      },
      {
        time: '12:45',
        title: 'Keisei Skyliner to Narita',
        jp: '京成スカイライナー',
        note: 'Nippori to Narita Terminal 1 in 36 minutes at 160 km/h — the fastest train in Japan that isn’t a shinkansen. Leave the hotel by 12:30; airport by 1:45 for the 4:45 flight.',
        kind: 'ride',
        kidTip: 'Last train of the trip, and it’s the fastest one after the bullet train. Watch the countryside smear — Tokyo is already becoming a story.',
      },
      {
        time: '16:45',
        title: 'UA33 — wheels up',
        note: 'Fly east, straight into yesterday afternoon. Somewhere over the Pacific, the date line hands back the day it took on the way out.',
        kind: 'ride',
      },
      {
        time: '10:55',
        title: 'Land at LAX — this same morning',
        note: 'You land five hours before you took off, by the clock. On the drive home, do the family debrief: best bite, best ride, weirdest vending machine, first thing we do when we come back. Because you’ll be back.',
        kind: 'magic',
        kidTip: 'Start the list on the plane: "Next time in Japan we will…" — keep it somewhere safe. It’s a promise, not a wish.',
      },
    ],
  },
]

export const kindMeta: Record<ActivityKind, { label: string; chip: string }> = {
  food: { label: 'Eat', chip: 'chip-gold' },
  sight: { label: 'See', chip: 'chip-indigo' },
  ride: { label: 'Go', chip: 'chip-pine' },
  rest: { label: 'Breathe', chip: 'chip-pine' },
  shop: { label: 'Treasure', chip: 'chip-sakura' },
  magic: { label: 'Magic', chip: 'chip-sakura' },
}
