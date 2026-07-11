/**
 * The haiku engraver: one 5-7-5 per itinerary stop, keyed by the moment key
 * `d{dayId}:{activityIndex}`. Authored in-session (Claude Fable, 2026-07-10)
 * and committed as data — no runtime AI (DECISIONS.md #14/#16). When a moment
 * is loved, its poem is engraved into the treasure card.
 * Rules: English 5-7-5, kid-readable, concrete to the stop, no apostrophes.
 */
export const haiku: Record<string, string> = {
  // Day 1 — Tokyo · Soft Landing
  'd1:0': 'Wheels kiss the runway\nfourteen mornings of Japan\nwait past the jet bridge',
  'd1:1': 'Out the train window\nsmall houses grow into tall\ncanyons made of light',
  'd1:2': 'Bright shelves hum softly\nmystery snacks in our hands\ndinner is research',
  'd1:3': 'Under the great gate\nthe neon hums its welcome\nwe are really here',

  // Day 2 — Tokyo · Old Tokyo
  'd2:0': 'Smoke curls from the urn\nwe wave good luck on our heads\nthe old bell agrees',
  'd2:1': 'Little iron molds\nstamp warm cakes shaped like lanterns\nthree hundred years sweet',
  'd2:2': 'The spaceship shaped boat\nslides underneath twelve bridges\nTokyo drifts past',
  'd2:3': 'Up where the sky starts\na glass floor dares us to look\nFuji floats out there',
  'd2:4': 'Tonight we cook here\nspatulas flip sizzling moons\nthe table applauds',

  // Day 3 — Tokyo · Forest & Neon
  'd3:0': 'One hundred thousand\nhand planted trees hold their breath\nthe city outside',
  'd3:1': 'Rainbow cotton clouds\nbigger than our heads and sweet\nHarajuku laughs',
  'd3:2': 'Sweet lunch then slow walk\nwe drift down quiet Cat Street\nto find the crossing',
  'd3:3': 'A thousand strangers\ncross in every direction\nHachikō still waits',
  'd3:4': 'From the open roof\nwe watch a million lights wake\nthe city breathes gold',
  'd3:5': 'Small bullet train brings\ntamago straight to our seats\nsend the tray back fast',

  // Day 4 — Tokyo · Wonder Day
  'd4:0': 'Barefoot in water\nkoi made of light swim through us\nwe become the art',
  'd4:1': 'Coins into the slot\na ticket becomes ramen\nslurp your compliments',
  'd4:2': 'A garden so wide\nlying on the lawn allowed\nclouds do the walking',
  'd4:3': 'Godzilla watches\nas we hunt whole floors of toys\nchoosing like dragons',
  'd4:4': 'Down Memory Lane\nsmoke and lanterns and skewers\nwe eat standing up',

  // Day 5 — Tokyo · DisneySea
  'd5:0': 'Forty minute ride\ntickets glowing on our phones\na volcano waits',
  'd5:1': 'Gates open at nine\nwe race to the volcano\nhear it clear its throat',
  'd5:2': 'Six popcorn flavors\nhidden all around the park\nlunch is a quest now',
  'd5:3': 'Twenty thousand leagues\nthen a slow gondola glides\nunder painted skies',
  'd5:4': 'Flames dance on water\nthen the sleepy train ride home\ncarried like treasure',

  // Day 6 — Hakone · Into the Mountains
  'd6:0': 'The front seat is glass\nthe driver sits overhead\nwe become the train',
  'd6:1': 'Sculptures in mountains\nthe net woods takes only kids\na tower of glass',
  'd6:2': 'We sail on cables\nover sulfur steam and stone\nblack eggs for long life',
  'd6:3': 'A real pirate ship\ncrosses the old crater lake\nFuji at the bow',
  'd6:4': 'Shoes off at the door\nwash first then sink to your chin\nthe mountain soaks too',
  'd6:5': 'Twelve tiny courses\narrive like wrapped up presents\ntry the mystery',

  // Day 7 — Kyoto · The Bullet Train Day
  'd7:0': 'Mist on the mountains\none more soak before the train\nsmall fish for breakfast',
  'd7:1': 'A red gate standing\nknee deep in the quiet lake\ncedars hold the hush',
  'd7:2': 'Bento on our laps\nJapan blurs past at full speed\nlook right for Fuji',
  'd7:3': 'Lanterns flick awake\ndown the old teahouse alley\na silk shadow slips',
  'd7:4': 'Ice cream on the bridge\nbelow us the herons fish\nin the lamplit dark',

  // Day 8 — Kyoto · A Thousand Gates
  'd8:0': 'Ten thousand red gates\ntunnel up the fox mountain\nwhat do foxes hold',
  'd8:1': 'The fox eats tofu\nso we slurp what foxes love\nnoodles at the gate',
  'd8:2': 'Four hundred meters\nof pickles and octopus\nwho takes the dare first',
  'd8:3': 'Under covered streets\nwe pat the small brass cow twice\nfor luck and stickers',
  'd8:4': 'An alley so thin\nwe eat above the river\nlanterns lean closer',

  // Day 9 — Kyoto · Bamboo & Monkeys
  'd9:0': 'Green stalks knock and creak\nthe forest talks in the wind\nclose your eyes and count',
  'd9:1': 'Seven hundred years\nthe garden has not blinked once\nthe dragon watches',
  'd9:2': 'Up the mountain path\nthe humans go in the cage\nthe monkeys stay free',
  'd9:3': 'Skipping flat stones where\nthe boatmen pole slowly past\nthe river runs jade',
  'd9:4': 'A one car tram sways\nthrough back gardens of Kyoto\na toy train grown up',
  'd9:5': 'Sweet curry supper\namakuchi means mild please\nrice islands in gold',

  // Day 10 — Kyoto · Gold & Stone
  'd10:0': 'Gold above water\ngold below in the still pond\nthe phoenix sees both',
  'd10:1': 'Fifteen quiet stones\nfrom every seat on the porch\nyou can count fourteen',
  'd10:2': 'Hot tofu wobbles\nin its little temple pot\nudon for the rest',
  'd10:3': 'Turn the bowl twice, sip\nthe sweet before the bitter\ngreen foam, quiet hands',
  'd10:4': 'Tiptoe carefully\nthe floor sings like little birds\nno sneaking allowed',
  'd10:5': 'Willows lean over\nthe canal at blue evening\nstone bridges listen',

  // Day 11 — Nara · The Deer Day
  'd11:0': 'Sit up at the front\nthe train threads hills of bamboo\ninto deer country',
  'd11:1': 'Bow to the deer first\nit bows back like a small lord\ncrackers for manners',
  'd11:2': 'The Buddha is vast\nhis open hand could hold us\na nostril sized door',
  'd11:3': 'Hammers fly, men shout\nthe rice surrenders to speed\nwarm mochi, soft cloud',
  'd11:4': 'Three thousand lanterns\nwear moss like old green sweaters\ndeer walk us to prayer',
  'd11:5': 'The train rocks us home\nfull of deer and great Buddhas\npack for Osaka',

  // Day 12 — Osaka · The Nation's Kitchen
  'd12:0': 'Thirty minutes south\na louder hungrier town\ngrins and grabs our hands',
  'd12:1': 'White and gold castle\non stones heavier than homes\nfind Octopus Stone',
  'd12:2': 'Butter and scallops\nwe point at lunch and lunch comes\neaten standing up',
  'd12:3': 'Choose your adventure\nretro games or river lights\nboth answers are right',
  'd12:4': 'The running man runs\nthe giant crab waves its claw\nOsaka shows off',
  'd12:5': 'Careful, molten core\nhot octopus balls spinning\neat until you fall',

  // Day 13 — Osaka · Ocean & Sky
  'd13:0': 'Down the great spiral\nthe whale sharks pass us five times\nwave, they are counting',
  'd13:1': 'The glass floored wheel turns\nthe harbor tilts far below\nonly brave feet ride',
  'd13:2': 'The cheesecake jiggles\nstamped with a smiling uncle\nwarm from the oven',
  'd13:3': 'Escalators climb\nthrough open sky to the ring\nwe say our thank yous',
  'd13:4': 'The family votes\nbest bite of thirteen long days\njanken breaks the tie',

  // Day 14 — Home · The Long Way Home
  'd14:0': 'One last egg sando\nwe will dream of these bright shelves\nfor years and years yet',
  'd14:1': 'A rocket shaped train\ncarries us to an island\nbuilt upon the sea',
  'd14:2': 'Over the ocean\nwe write the next time promise\nJapan keeps a seat',
}
