/**
 * The haiku engraver: one 5-7-5 per itinerary stop, keyed by the moment key
 * `d{dayId}:{activityIndex}`. Authored in-session (Claude Fable, 2026-07-10;
 * re-engraved for the real itinerary 2026-07-11) and committed as data — no
 * runtime AI (DECISIONS.md #14/#16). When a moment is loved, its poem is
 * engraved into the treasure card.
 * Rules: English 5-7-5, kid-readable, concrete to the stop, no apostrophes.
 */
export const haiku: Record<string, string> = {
  // Day 1 — Home · The Leap
  'd1:0': 'One bag left half full\nroom for whatever Japan\ndecides to send home',
  'd1:1': 'Say it at the gate\nwe are flying to Japan\ntoday is the day',
  'd1:2': 'Eleven hours up\nan ocean rolls underneath\ndinner in the clouds',
  'd1:3': 'The plane eats Sunday\nsomewhere over the water\nMonday takes the wheel',

  // Day 2 — Tokyo · Soft Landing
  'd2:0': 'Wheels kiss the runway\nthe whole trip opens its doors\njust past the jet bridge',
  'd2:1': 'Out the train window\nsmall houses grow into tall\ncanyons made of light',
  'd2:2': 'Bags drop to the floor\nthe room stops gently moving\nwe are really here',
  'd2:3': 'Bright shelves hum softly\nmystery snacks in our hands\ndinner is research',
  'd2:4': 'Down the old lane, cats\ncarved and real, watch us wander\nto the sunset stairs',

  // Day 3 — Tokyo · Puroland Day
  'd3:0': 'A pink striped train hums\nwest across the morning town\nto the kingdom gates',
  'd3:1': 'Inside is a world\nwhere even the rain cannot\nfind Hello Kitty',
  'd3:2': 'Curry with a face\ntoo cute to eat, we eat it\nsmiling anyway',
  'd3:3': 'High over the street\nGodzilla waits for the hour\nthen roars it open',
  'd3:4': 'Beneath the great store\na museum made of food\neach picks a treasure',

  // Day 4 — Tokyo · Old Tokyo, Tall Tokyo
  'd4:0': 'Smoke curls from the urn\nwe wave good luck on our heads\nthe old bell agrees',
  'd4:1': 'Little iron molds\nstamp warm cakes shaped like lanterns\nthree hundred years sweet',
  'd4:2': 'Up where the sky starts\na glass floor dares us to look\nFuji floats out there',
  'd4:3': 'A thousand strangers\ncross in every direction\nHachikō still waits',
  'd4:4': 'Rainbow cotton clouds\nbigger than our heads and sweet\nHarajuku laughs',
  'd4:5': 'Small bullet train brings\ntamago straight to our seats\nsend the tray back fast',

  // Day 5 — Kyoto · The Bullet Train Day
  'd5:0': 'A city of trains\nunder one enormous roof\nfind our platform first',
  'd5:1': 'We choose by the box\nthe lunch inside stays secret\nuntil the train moves',
  'd5:2': 'Bento on our laps\nJapan blurs past at full speed\nlook right for Fuji',
  'd5:3': 'Bags in a locker\nold Kyoto holds its breath\ntonight it will sing',
  'd5:4': 'Lanterns on towers\nflutes and bells from up inside\ntown in yukata',

  // Day 6 — Kyoto · Gion Matsuri
  'd6:0': 'Wooden towers roll\nturned on wet bamboo, creaking\na thousand years loud',
  'd6:1': 'The sun takes the streets\nso we take the shaded room\nboth of us are right',
  'd6:2': 'Lanterns flick awake\ndown the old teahouse alley\na silk shadow slips',
  'd6:3': 'A shrine rides shoulders\na hundred voices keep time\nthe street shouts along',
  'd6:4': 'An alley so thin\nwe eat above the river\nlanterns lean closer',

  // Day 7 — Kyoto · A Thousand Gates
  'd7:0': 'Ten thousand red gates\ntunnel up the fox mountain\nwhat do foxes hold',
  'd7:1': 'The fox eats tofu\nso we slurp what foxes love\nnoodles at the gate',
  'd7:2': 'Green stalks knock and creak\nthe forest talks in the wind\nclose your eyes and count',
  'd7:3': 'Noon is for napping\nthe temples have stood this long\nthey can wait an hour',
  'd7:4': 'A porch on stilts holds\nthe whole city in one view\nchoose one stream to drink',
  'd7:5': 'Ice cream on the bridge\nbelow us the herons fish\nin the lamplit dark',

  // Day 8 — Nara · The Deer Day
  'd8:0': 'Sit up at the front\nthe train threads hills of bamboo\ninto deer country',
  'd8:1': 'Bow to the deer first\nit bows back like a small lord\ncrackers for manners',
  'd8:2': 'The Buddha is vast\nhis open hand could hold us\na nostril sized door',
  'd8:3': 'Hammers fly, men shout\nthe rice surrenders to speed\nwarm mochi, soft cloud',
  'd8:4': 'Forty minutes west\na louder hungrier town\ngrins and grabs our hands',
  'd8:5': 'The running man runs\nthe giant crab waves its claw\nOsaka shows off',

  // Day 9 — Osaka · Universal Day
  'd9:0': 'The train wears movies\nall the way around the loop\nto the story gates',
  'd9:1': 'First through the great gate\nthumbs race the app for a slot\nthe mushroom kingdom',
  'd9:2': 'Enter through a pipe\ncome out inside the level\npunch every question',
  'd9:3': 'Water on the hour\na cool show, a queue, repeat\nJuly plays for keeps',
  'd9:4': 'Legs full of the park\nnoodles in the quiet street\nsleep comes before dark',

  // Day 10 — Osaka · Daruma & Whale Sharks
  'd10:0': 'A hillside of eyes\ndaruma in every ledge\neach one kept a wish',
  'd10:1': 'Down from the cool hill\nthe city glitters with heat\nlunch behind cold glass',
  'd10:2': 'Down the great spiral\nthe whale sharks pass us five times\nwave, they are counting',
  'd10:3': 'Butter and scallops\nwe point at lunch and lunch comes\neaten standing up',
  'd10:4': 'The cheesecake jiggles\nstamped with a smiling uncle\nwarm from the oven',
  'd10:5': 'The family votes\nbest bite Osaka gave us\njanken breaks the tie',

  // Day 11 — Tokyo · The Return
  'd11:0': 'One more platform snack\nwe know exactly which one\nseasoned travelers',
  'd11:1': 'Going home eastward\nFuji switches its window\nwave from the A seats',
  'd11:2': 'The same streets greet us\nwe landed here as strangers\nnow we know the way',
  'd11:3': 'Under the train tracks\na market shouts its prices\nlast treasure standing',
  'd11:4': 'The family votes\nthe best of twelve days, again\njanken breaks the tie',

  // Day 12 — Home · The Long Way Home
  'd12:0': 'One last egg sando\nwe will dream of these bright shelves\nfor years and years yet',
  'd12:1': 'Thirty-six minutes\nthe fields become a painting\ngoodbye at full speed',
  'd12:2': 'Fly into the past\nthe line gives back the Sunday\nit borrowed from us',
  'd12:3': 'Home before we left\nwe write the next time promise\nJapan keeps a seat',
}
