# 旅路 Tabiji — The Tabi Roadmap

> *Tabiji: the road of the journey.* This is the unconstrained vision document for Tabi — every idea worth
> keeping, from a one-hour polish to hardware that doesn't exist yet. The app shipped under a strict
> "self-contained, no network, ever" philosophy. **That rule is hereby retired as a rule and demoted to a
> principle:** *offline-first, never offline-only.* Anything may reach the network — as long as the painting
> still works in a tunnel under Osaka when the signal dies.
>
> Tags: effort **S / M / L / XL** · `offline` runs with zero network · `net` needs connectivity ·
> `backend` needs a server (Supabase or similar) · `AI` uses the Claude API · `native` needs a Capacitor/Swift
> wrapper · `physical` ends as an object in the real world.

---

## Part I — Committed: the next build (v2.1 「記憶 Kioku」)

The four items below are agreed and specced in spirit. They deepen what exists without changing its soul.

1. **Kioku Journal** `M · offline` — One entry per day: free text plus photos, stored in IndexedDB (localStorage
   graduates with it). Loved moments auto-seed the entry. A WebGL ink-wash filter renders each photo as sumi-e
   so real memories live inside the app's art style instead of clashing with it. The treasures list becomes an
   illustrated diary the kids scroll on the flight home.
2. **Sound & haptic grammar** `S · offline` — A synthesized Web Audio layer (no samples, ~0 KB): a stone *tap*
   for did-it, a soft double heartbeat for loved-it, a brush *sweep* for skipped, the deep hanko *thunk* when an
   eki-stamp lands, a temple bell when a day completes. Paired vibration patterns. Off by default; one
   brush-icon tap to enable; always ducked under speech synthesis.
3. **Four travelers** `M · offline` — Each family member picks a name, an animal mascot (fox, deer, crane,
   crab…), and an ink color. Packing lists become *theirs*, quiz scores become a family leaderboard, loved
   moments carry whose heart it was, and Family Sync merges say "Dad's phone brought 12 moments." The data
   model barely changes; the ownership changes everything.
4. **The Japan clock** `S · offline` — Trip-day math pinned to JST so "Day 3 in Kyoto" flips at the right
   midnight for a jet-lagged family, plus groundwork for the solar palette (below): the app should know when
   the sun rises where *they* are.

---

## Part II — The Field

Everything else worth doing, by theme. Nothing here is rejected; it is sequenced.

### 🦊 For the kids — they stop being cargo

- **Yōkai Ink Camera** `L · offline` — Hand-drawn sumi-e yōkai haunt geofenced spots on this exact itinerary: a
  kappa under the Kamo river bridges, kitsune flickering between Fushimi Inari's torii, a tanuki in Nara-kōen,
  a tengu over the Hakone ropeway. Point the camera at the right place and the spirit materializes in animated
  ink over the live feed; capture it by painting its sigil with a finger. Captured yōkai fill a bestiary with
  kid-readable folklore cards. GPS and camera are on-device; the art ships in the bundle — the whole haunting
  works offline.
- **Denshadex** `M · offline` — The trip rides an absurd roster of iconic rolling stock (N700S, Yamanote E235,
  Hakone Tozan switchbacks, Romancecar, Randen tram, the Rapi:t rocket). Every one becomes a collectible card:
  grey silhouette until logged, then flooded with ink. Rarity tiers, top-trump stats, each card playing that
  line's real departure melody. The eki-stamp system, extended into the thing Japanese kids actually collect.
- **Day Captain** `M · offline` — Each morning one kid is crowned with a hanko-sealed badge and three sealed
  decision cards drawn from the day: pick the snack stop, choose the train car, call the rain-plan swap,
  command the gachapon budget. Their choices are inked into the record as *Captain's Orders*.
- **Daily Boss Battle** `M · offline` — Each day's checklist reframed as a cooperative boss: Day 1 is the *Oni
  of Jet Lag*, Fushimi Inari day the *Thousand-Gate Serpent*, Osaka the *Glutton Kaiju*. Completed stops, brave
  bites, and phrases spoken to real humans deal visible damage until the boss cracks and washes away. Same
  tri-state data, re-skinned as a game siblings fight *together*.
- **Courage Koban** `S · offline` — The phrasebook becomes dare cards: actually order your own taiyaki, ask a
  station attendant "Nara-yuki wa?". A parent confirms; the kid earns gold koban coins that convert — at a
  family-set exchange rate — into real gachapon yen. The scariest moments of the trip become its best game loop.
- **Gacha-dex & the virtual gacha machine** `M · offline` — Photograph every real capsule-toy haul into a
  shared Gacha-dex; spend leftover koban in an in-app hand-cranked gacha that dispenses virtual omamori — the
  rare ones *modify the app itself* (petal storms, a golden route brush, secret dark-mode fireflies).
- **Side Quests** `M · offline` — Three to five geofenced micro-hunts per city that only unlock on arrival:
  find the dragon fountain at Sensō-ji, spot the fox holding a key in its teeth, catch the Glico man from the
  classic angle. A photo proves the find and the day's painted vignette *gains a new hand-drawn detail* — the
  quest paints itself into the artwork. Parents can author custom quests the night before.
- **Shinkansen Arcade** `M · offline` — A hidden tab that only unlocks when GPS reads bullet-train speed.
  Headliner: *Fuji Spotter*, which counts down to the exact timetable window Fuji appears and scores who sees
  the summit first. Kids beg for the train ride — the greatest trick a travel app can pull.
- **Deer Diplomacy** `S · offline` — The night before Nara, an ink-drawn simulator teaches shika-senbei
  protocol (bow, present, retreat; get it wrong and a cartoon deer eats your map). On the day it becomes a
  live log: bows exchanged, ranks earned, from *Nervous Envoy* to *Deer Whisperer*.
- **Hyakumonogatari Night** `S · offline` — For the ryokan evening: a full-screen candle circle adapting the
  Edo ghost-story parlor game. Read a kid-safe yōkai tale (from the captured bestiary), blow into the mic to
  extinguish a candle, the indigo room darkening until the last flame unlocks a secret badge.
- **Vending-machine bingo** `S · offline` — A 5×5 card of finds: hot corn soup, a canned pancake drink, a
  machine in the middle of nowhere, a mascot machine. The ¥300 daily machine budget becomes a scavenger sport.
- **Coin Dojo** `M · offline` — Point the camera at a handful of yen coins; the app identifies and totals them,
  then challenges the kid to assemble the exact fare or pay for their own gacha. Camera-based coin literacy —
  the skill every foreign kid in Japan secretly wants.

### 🎒 For the parents — practical magic, upgraded

- **Live Transit Copilot** `L · net` — Wire the 73 stops to a transit API (Ekispert/NAVITIME) so the plan knows
  the actual next train: a soft temple-bell nudge says "leave the ryokan by 9:12 for the 9:31 Hakone Tozan" —
  including which car to board so you step off at the elevator.
- **Rain-Day Auto-Replan** `M · net` — Feed JMA's hourly forecast into the hand-written rain plans: at 6 a.m.
  the app proposes the swap ("Kyoto: 90% rain from noon — promote the rain plan?"), one tap re-sequences the day.
- **Meltdown SOS** `M · net` — One thumb-reachable button for the wall-hit moment: nearest konbini, clean
  Western toilet with changing table, vending machine, covered bench, quiet corner — from a curated offline
  dataset, upgraded live when online. Pairs with a sumi-e calm-breathing screen.
- **Luggage Ghost** `M · net` — The takkyubin ritual, automated: pre-filled airbills (hotel addresses in
  Japanese from the itinerary, delivery-date math so bags beat you to Kyoto), plus same-day storage via Ecbo
  Cloak. Watch "the bags" travel as their own character on the route map.
- **Shinkansen Strategist** `M · net` — Deep-link into SmartEX with four seats together + the oversized-baggage
  row pre-selected, remind everyone Fuji is out the E-window heading west, and offer an ekiben picker with
  photos and allergen notes.
- **Geofenced eki-stamps** `M · offline` — Badges upgrade from tap-to-earn to *earn-by-being-there* via
  on-device geolocation, with the ink-thunk landing only within a few hundred meters of the real station.
- **IC-Card Family Wallet** `L · native` — Read each family member's physical Suica/ICOCA over NFC (FeliCa):
  "Kenta's card has ¥310 — top up before Hakone, the Tozan fare is ¥460." Ride history auto-annotates the journal.
- **Yen Ledger + tax-free tracker** `M · AI` — Photograph any receipt; vision itemizes, converts, and files it
  against the budget by city ("how much have we *actually* spent on gachapon?"), and tracks the ¥5,000
  same-store tax-free threshold.
- **Earthquake & Typhoon Guardian** `M · net` — JMA early warnings relayed in plain English with exactly what
  to do, a muster point auto-set from tonight's reservation, and offline evacuation phrases beside the
  emergency screen.
- **Lost-Kid Protocol** `L · net physical` — Generated, laminated sumi-e omamori lanyard cards per kid — name,
  allergies, "I'm lost, please help me call my parents" in Japanese, QR to reach the parents — plus an
  optional live family presence map when online.
- **Jet-lag companion** `S · offline` — A quiet 4 a.m. mode: pre-dawn palette, a breathing exercise, "what's
  open right now within a walk" (konbini, of course), and a gentle plan for holding out until Japan's morning.
- **Reservation Sniper** `XL · backend` — A watcher for the bookings first-timers always lose: the Ghibli
  Museum's 10th-of-the-month drop, teamLab slot releases, Shibuya Sky sunset windows, Pokémon Café
  cancellations. Push with a deep link the second a slot opens.

### 🎨 The living painting — the aesthetic becomes a system

- **Living Sky Engine** `M · net` — Real weather piped straight into the `--art-*` variables: rain in Hakone
  becomes diagonal sumi rain-streaks, humidity softens ink contrast, wind drives the petals' drift. The kids
  look at the app, then out the ryokan window — and they match.
- **Solar palette clock** `M · offline` — Replace binary day/night with continuous interpolation from real
  sunrise/sunset math (pure on-device astronomy): asayake pink at dawn, washi cream at noon, a vermillion
  yūyake wash at dusk, a warm lantern hour, then indigo night. The app breathes on the country's clock.
- **72 Microseasons** `M · offline` — Japan's classical calendar of five-day seasons ("First lotus blossoms,"
  "Cool winds arrive") — computable offline — retunes the accent palette and writes the season's name in
  vertical calligraphy on the Journey header. The family learns Japan has 72 seasons, not four.
- **Opening cinematic** `L · offline` — A skippable 20-second title: an unseen brush lays the route stroke in
  real time, five hanko stamps thunk down with haptic bumps, Fuji rises in three washes, the ink bleeds into
  the home screen. Tuned to that day's city and weather.
- **Sumi, the ink spirit** `L · offline` — A mascot painted in three brushstrokes — an ink-blob fox-tanuki
  spirit living in the corner of every screen. Naps under a lantern at night, shakes off rain, does a joyful
  blot-splash when a moment is loved, wears deer antlers in Nara and a towel on its head in Hakone. (For its
  Claude-powered brain, see the Moonshot Shelf.)
- **Generative soundscape** `L · offline` — Procedural Web Audio, synthesized not sampled: suikinkutsu water
  drops in Kyoto temples, cicada shimmer in summer, a furin chime whose ring rate follows the wind, the real
  5 p.m. gojī-no-chaimu melody the kids will recognize from the street.
- **Living vignettes** `L · offline` — The city paintings become inhabited: tilt-parallax planes like an
  unrolling emakimono, a heron crossing the Kamo every few minutes, the ropeway gondola inching along its
  cable, Osaka's lanterns flickering after sunset.
- **Nijimi ink physics** `M · offline` — Wet ink as the universal feedback: taps bloom small ink blots,
  transitions are a loaded brush wiping across, pull-to-refresh drags a wet stroke that snaps back. One shared
  SVG filter primitive powers all of it.
- **Generative kamon** `M · offline` — Each family member picks a motif and the app composes a proper enclosed
  family crest by classical construction rules. It seals every sync link like wax, and gains one tiny petal per
  loved moment — visibly fuller by Osaka than it was at the airport.
- **Hiroshige forecast** `L · net` — Tomorrow's weather as a woodblock print: rain over Kyoto drawn as driving
  diagonal lines across a bridge, heat as shimmer above Osaka rooftops. Checking the weather becomes the most
  beautiful thing you do each morning.
- **Fuji Window** `L · offline` — On the Tokyo→Kyoto leg, on-device GPS scrolls a painted Tōkaidō emakimono
  past the hero at the train's real speed — and pings "Fuji on the right in 3 minutes" at the exact geometric
  moment, blooming the mountain across the screen as it appears outside. The single most Japan-specific magic
  trick this app could perform.
- **Per-city app icons** `M · native` — The home-screen icon repaints itself as the trip moves (ink Tokyo
  Tower → torii in mist → pagoda → bowing deer → Osaka Castle), settling into a commemorative "completed
  scroll" mark forever after day 14.

### 🤖 The AI companion — Claude in the daypack

- **Menu Lens** `M · AI` — Photograph any menu — handwritten izakaya chalkboard, ramen ticket machine — and
  vision translates it, cross-checks every dish against the stored allergy card, marks the kid-safe picks, and
  drafts the exact polite Japanese to order.
- **Sign & Etiquette Decoder** `S · AI` — Camera on any onsen rules placard, shrine instruction board, or
  coin-locker screen; back comes not a translation but *what this means and what your family should do next*,
  faux-pas warnings first.
- **Two-Way Voice Interpreter** `L · AI` — Hold, speak English; natural, correctly-polite Japanese comes out
  of the existing speech engine. Flip the phone; the ryokan owner replies; English streams back. It already
  knows the family's context — "ask if the broth contains fish" comes out perfectly, because the allergy card
  is in the prompt.
- **"Worth the Detour?" concierge** `M · AI` — A chat grounded in the full itinerary plus live trip state: "Is
  Fushimi Inari doable at 4 p.m. with a wiped-out six-year-old?" gets answered by something that knows what you
  skipped this morning and what tomorrow costs.
- **Rainy-Day Replanner agent** `L · AI net` — The rain plan becomes a tool-using agent: checks the hourly
  forecast, holiday closures, and museum hours, then re-sequences the actual day while preserving the nap window.
- **Nightly Journal Weaver** `M · AI` — Thirty seconds of voice bullets ("kids went feral at the gacha
  machines") plus the day's tri-state data → a journal entry in Tabi's own prose voice, streamed onto a washi
  page beside the day's vignette.
- **Kamishibai bedtime stories** `L · AI` — Each night, today's loved moments become a Japanese folktale with
  the kids as protagonists — and because the whole art system is SVG driven by CSS variables, the illustrations
  are generated *in the app's own brush language*.
- **Phrase Dojo** `M · AI` — The phrasebook listens back: a kid says *sumimasen* into the mic, and the coach
  responds playfully ("your *su* was perfect — make the *mi* shorter, like a hiccup"). Phrases nailed in the
  wild earn golden stamps.
- **Point-and-Listen Docent** `M · AI` — Aim the camera at the thing in front of you — Kaminarimon's lantern,
  the Daibutsu — and a 60-second story streams out, tuned separately to each kid's age.
- **Konbini Mystery Snack Referee** `S · AI` — Day 1's snack-roulette game gets an official: scans the label,
  flags hidden allergens, and reveals what the snack actually *was* only after everyone has tasted and ranked it.
- **Haiku Engraver** `S · AI` — Every loved moment quietly receives a 5-7-5, engraved into its treasure card.
  On the flight home they unroll as a single tanzaku scroll: the trip, written as poetry, by the day it was lived.
- **Dinner-table quiz** `S · AI` — Five fresh questions each night generated from what the family actually did
  today ("How much was the mystery drink Dad hated?"). Same painted quiz UI; the answer key is your own day.
- **Build-Time Lore Press** `M · AI offline-at-runtime` — The contrarian play: Claude runs only in CI, batch-
  enriching all 73 stops with age-tuned tip variants, "if you only have 20 minutes" cuts, and pre-baked Q&A —
  shipping an app that *feels* AI-deep while staying 100% offline at runtime.

### 📱 Deeper into the iPhone — the platform maximal

- **Shinkansen Live Activity** `L · native` — The route brushstroke fills across the Lock Screen; the Dynamic
  Island shows an ink train nose and minutes to Kyoto; at the timetable moment Fuji becomes visible, the island
  expands with a haptic pulse: *"Look right — Fuji for the next 90 seconds."*
- **Today's Painting widgets + StandBy** `M · native` — The day's vignette, next stop, and phrase of the day on
  the Home and Lock Screens; docked sideways on the nightstand, StandBy shows the indigo night palette and
  tomorrow's first departure.
- **Apple Watch** `L · native` — Tri-state check-offs and kid tips on the wrist, an eki-stamp progress
  complication, and escalating get-off-here haptics from preloaded station geofences — so a parent herding two
  kids never has to pull out a phone.
- **AirTag family dashboard** `L · native` — AirTags in backpacks and suitcases appear as living hanko on the
  route map. The killer Japan move: takkyubin mode, where the forwarded suitcase becomes its own character the
  kids can check on as it travels a day ahead.
- **Siri + Action Button** `M · native` — "Hey Siri, say my son has a peanut allergy" speaks the ja-JP audio
  aloud, hands-free at the counter. The Action Button hold-flashes the full-screen allergy card — no unlock, no
  navigation, works in a panic.
- **App Clip stamp rally** `L · native physical` — Fourteen washi NFC stickers, planted secretly by parents
  near each day's anchor stop. A kid taps their phone and — no install, no login — the hanko ceremony plays.
- **Wallet passes** `M · native` — Every reservations-pocket entry becomes an ink-wash `.pkpass` with time and
  geofence relevance, surfacing on the Lock Screen as you approach the venue.
- **Apple Journal flow** `S · native` — Every loved moment becomes a suggested Journal entry via the
  Journaling Suggestions API, arriving half-written with the photos and location from that exact hour.
- **UWB "find Mom in the scramble"** `M · native` — The U-series chip turns any family phone into a compass to
  any other: an ink arrow swims across the screen pointing through the Shibuya crowd, haptics quickening as you
  converge. Peer-to-peer; no network; built for the three seconds of terror.
- **7-Eleven postcard press** `L · native AI physical` — Each evening the family votes on four photos; on-device
  style transfer repaints them as sumi-e postcards; the app books them into 7-Eleven's netprint network and
  hands you a code. The kids walk to any konbini in Japan and print their own trip.
- **On-device intelligence concierge** `XL · native offline` — The Foundation Models framework runs the
  concierge entirely on-device, grounded in the itinerary and guide data — honoring the app's original
  no-backend soul while still answering "it's raining and the kids are melting down, what now?"

### 🏮 Keepsakes — data becomes heirloom

- **Ukiyo-e trip poster** `L · physical` — The family's actual data — route, check-offs, city stamps, weather,
  loved moments — composed into one woodblock-style poster, family name in a katakana cartouche. Printed,
  shipped, framed, argued over for decades.
- **Heirloom photo book** `L · net physical` — Photos auto-matched to stops by timestamp and GPS; the painted
  vignettes become chapter dividers; loved moments get full-page spreads; one tap to a lay-flat hardcover.
- **Real goshuincho** `L · physical` — The 14 earned eki-stamps graduate into an actual accordion-fold pilgrim
  stamp book: vermilion pages, the date, the day's haiku, one line a kid dictated on the spot, bound in indigo
  cloth.
- **Sound postcards** `M · offline→physical` — A record button on every stop captures 30 seconds of ambience —
  the scramble, the departure melody, deer snorting for crackers. Clips pin to the route map; post-trip they
  can become NFC washi postcards that play their moment when tapped to a phone.
- **Family voice phrasebook** `S · offline` — Next to every synthesized phrase, a record button for the family's
  own attempts. Ten years on, the phrasebook still plays their eight-year-old voices trying *oishii!* — an
  heirloom hiding inside a utility.
- **Purikura booth** `M · offline` — An in-app photo-sticker booth with sumi-e frames per city, sparkle stamps,
  and finger-doodling — homage to the arcade booths the kids will beg for anyway.
- **Printable stamp-rally passport** `M · offline physical` — A client-side PDF passport: one page per city,
  QR deep-links to the day, and blank squares for Japan's *real* station stamps (nearly every JR station has
  one, free). The rally runs in atoms and bits simultaneously.
- **This Day Last Year** `M · backend` — Exactly one year later, fourteen consecutive mornings of "remember
  when": the vignette, the check-offs, the haiku, the sound clip. Automatic, forever.
- **Time capsule letters** `S · backend physical` — On the flight home, everyone writes a letter to their
  future self; the app seals them behind a locked shrine-gate UI and delivers in five years — optionally
  printed and wax-sealed with the family kamon.
- **Grandparents' ehagaki** `L · backend physical` — Each evening an auto-composed picture postcard to a private
  grandparent URL — and optionally *actually mailed from within Japan* the same day, arriving with real stamps.
- **Route furoshiki** `L · physical` — The brushstroke route — GPS-corrected to the path actually walked,
  including the wrong turn that found the best ramen — printed on a furoshiki cloth or a noren for the kitchen
  doorway.
- **Omamori memory charms** `L · physical` — Real brocade omamori, one per family member, an NFC tag sewn
  inside: tap your charm to any phone and your personal treasures replay. Clips to a backpack like the ones
  they saw at the shrine.
- **Plan vs. reality diff** `M · offline` — After the trip, the intended route in faint grey ink under the
  walked truth in full black — every skipped shrine and serendipitous detour visible as brushwork. The most
  honest map of any family trip ever drawn.

### 🤝 Together — many phones, one journey

- **Family Ink (live sync)** `M · backend` — Trip state graduates from a folded link to realtime rows: Dad
  marks Fushimi Inari loved and the vermillion blooms on Mom's phone mid-shrine. The existing additive merge
  becomes the conflict resolver; the link survives as the zero-account fallback. (CloudKit is the serverless
  alternative if the answer is "Apple runs it.")
- **Shinkansen mesh** `L · offline` — The same sync as a CRDT that also moves phone-to-phone over local
  WebRTC — so the family stays in sync in a tunnel with zero bars, honoring the app's original soul as a
  *degraded mode* rather than a restriction.
- **Where's Dad? (park mode)** `L · backend` — Auto-arms inside DisneySea or teamLab: everyone's phone becomes
  a small sumi-e figure walking across a hand-painted map of the venue. Kids tap "meet me here."
- **Split-party days** `L · backend` — Fork Day 9 into two tracks (railway museum vs. temples) with a painted
  regroup point; each party watches the other's check-offs arrive as parallel brushstrokes on the same vignette.
- **Grandparents' Window** `M · backend` — A read-only live scroll for the folks at home, rendered in their
  timezone ("while you slept, they climbed the torii gates"), with one interaction: a tapped *cheer* that
  floats into the kids' app as a golden koi.
- **Today's Scroll** `L · backend` — Photos from all four phones auto-bind to the stop where they were taken
  and assemble each evening into a shared illustrated diary page.
- **Reservation inbox** `L · backend AI` — Forward any confirmation email to `your-trip@in.tabi.app`; a parser
  extracts the codes and files them into the right day's pocket on every phone at once.
- **Collaborative planning table** `L · backend` — Pre-trip, the itinerary becomes a live document: kids splash
  limited "wish ink" on candidate stops, parents propose swaps, the family votes with painted seals.
- **Trip Remix Gallery** `L · backend` — Publish a finished itinerary as a forkable template (personal data
  stripped); remix lineage renders as a growing branch diagram — the original trip as trunk.
- **Families-like-yours ink wash** `L · backend` — Opt-in aggregate wisdom rendered as ink density on the map:
  stops that families with young kids consistently loved glow darker; "62% of families skipped the upper
  Fushimi loop with under-10s" appears as a quiet marginal note.
- **Pod mode** `M · backend` — Two families, one trip: shared days, a party-of-8 dinner view, and yen bill
  splitting through the existing converter.
- **Sutanpu StreetPass** `XL · backend` — Every family designs a custom hanko; when two Tabi families check off
  the same landmark within the hour, they exchange stamps — a travelers-met page growing rarer encounters, a
  stamp rally layered on the country that invented them.

### 🌏 Tabi beyond this trip — the product

- **Atelier Packs** `L · net` — Refactor the Japan content into a versioned destination-pack format and prove
  the engine with Japan Route #2 (Tōhoku snow-and-onsen), Kyūshū, Okinawa — each pack hand-drawn in a local art
  tradition (Korea in minhwa folk painting, Taiwan in gongbi ink-and-color). Every destination as loved as
  this one, or it doesn't ship.
- **Trip Weaver** `L · AI` — Conversational onboarding: eight questions (kids' ages, trip length, energy
  budget, food fears) and a blank washi page inks itself into *your* itinerary in Tabi's format — days, stops,
  rain plans, kid tips. Trip-length flexibility falls out for free.
- **Michikusa audio guides** `M · AI physical-adjacent` — A warm two-minute storyteller short per stop, aimed at
  the kids, downloaded offline before departure. Parents stop being tour guides; the walk becomes the content.
- **Localization** `M · offline` — The phrasebook goes truly bilingual: a French family sees français → 日本語
  with romaji tuned to French phonetics. Family travel to Japan is exploding from everywhere; this is a 5×
  audience multiplier with zero new features.
- **Accessibility as flagship** `M · offline` — Authored audio descriptions for every painted vignette, reduced-
  motion brush alternatives, dyslexia-friendly type, WCAG 2.2 AA. Because the art is semantic inline SVG, Tabi
  can do accessibility no bitmap app can — a launch headline, not a checkbox.
- **App Store twins** `M · native` — One codebase, Capacitor-wrapped for both stores — not for the install
  button but for the surfaces a travel day lives on (Live Activities, widgets, offline TTS voices). Web stays
  the free canonical version.
- **Open-core** `M` — MIT the engine and the Japan trip (forever-free demo and star magnet); sell destination
  packs and a subscription bundling the AI planner, live sync, and Live Activities. A family spends $2,000+
  per trip day; a $30 software decision is invisible.
- **The Memory Vault (v5)** `XL · backend` — Every completed journey sits on a painted bookshelf, each opening
  into its illustrated book; phrasebook streaks carry across trips. The pitch matures from "an app for our
  Japan trip" to *"the shelf where our family keeps its adventures."*

---

## Part III — The Moonshot Shelf 🚀

The ideas that make no economic sense until they suddenly define the product. Kept loud on purpose.

1. **Sumi with a brain** `XL · AI` — The ink-spirit mascot becomes a Claude-powered companion the kids talk to:
   it knows the itinerary and their loved moments, invents I-spy games on long train legs, teases callbacks to
   the jiggly cheesecake, and narrates tomorrow's plan at bedtime, in character. Voice in, voice out, kid-safe.
2. **Morning Scroll Steward** `XL · AI backend` — An always-on agent that wakes at 6 a.m. JST every trip day:
   checks typhoon advisories, JR disruptions on today's exact route, confirms tonight's reservation, remembers
   the kids melt down after 3 p.m. — and has the day's adjusted scroll waiting when the family wakes.
3. **The Concierge with a phone number** `XL · AI backend` — A Twilio-provisioned Japanese number backed by a
   Claude voice agent that makes the calls foreign families cannot: booking the tempura counter that only takes
   phone reservations, confirming allergy-safe kaiseki with the ryokan — reading straight from the allergy card.
4. **AI sumi-e camera / the family emaki** `XL · AI backend` — Every photo repainted in the app's exact palette
   as ink-wash art: your actual kids feeding actual deer, as if Hiroshige sketched it — accumulating into a
   14-day handscroll. The feature that makes strangers ask *what app is that?*
5. **The Ink Scroll storybook** `XL · AI physical` — Each night the day's data becomes an illustrated storybook
   page with the kids as heroes; on the last night, one tap prints the fourteen pages into a hardbound book
   that's waiting in the mailbox when they land. The trip writes its own picture book.
6. **The Orihon / printed emakimono** `XL · physical` — The idea four independent brainstorms converged on: the
   full merged trip — every loved moment in each member's ink color, photos, stamps, quiz duels, grandparents'
   cheer seals — compiled into an accordion-fold washi book, foil-stamped with the family kamon, shipped home.
   The app was always pretending to be a paper object; this makes it one.
7. **Tabi no Kioku documentary** `XL · AI backend` — A pipeline ingests the trip's clips, sound postcards, and
   journal answers, writes a 15-minute chaptered documentary script, narrates it in warm bilingual voiceover,
   and animates the app's own vignettes as scene transitions.
8. **Taste Replay** `XL · physical backend` — A taste log during the trip; one year later a box arrives with
   the exact Nara mochi, the specific Kyoto matcha, the 7-Eleven egg sando's nearest legal equivalent — each
   item QR-linked to the moment it was first eaten.
9. **Tabi-kun pendant** `XL · hardware` — An ESP32 e-ink tamagotchi in a 3D-printed netsuke shell, one per kid:
   a tiny sumi-e spirit fed by real steps and station taps over BLE, buzzing when a side quest is within 100
   meters. Siblings bump pendants to trade charms. Pokéwalker energy, this app's own art, real e-paper.
10. **The JR partnership** `XL · business physical` — Geofence-verified badges, a pre-trip physical stamp
    passport and family hanko kit, and a real partnership with JR East's eki-stamp program: scan the station's
    actual stamp poster, unlock the app's badge with a location-exclusive animation. Kids drag parents to
    stations; JR gets foot traffic; Tabi gets the most defensible moat in family travel.
11. **ARKit kitsune guide** `XL · native` — At the itinerary's magic-tagged stops, a brushstroke fox rendered in
    RealityKit materializes against the real torii gates and pads ahead, leading the kids to the day's stamp.
12. **The Metal port** `XL · native` — Full SwiftUI rebuild where brushstrokes bleed into washi grain via Metal
    shaders, pages turn like a folding byōbu at 120 Hz, and every stamp lands with a Core Haptics thunk — the
    offline soul intact, the craft turned up to eleven.
13. **Tabi Ateliers** `XL · backend business` — Real Japanese illustrators paint new vignette packs and local
    itineraries in the house ink language, paid per fork of their template. Tabi becomes a platform whose
    content moat is *art*.

---

## Part IV — Sequencing sketch

| Version | Name | Theme | Contents |
|---|---|---|---|
| **v2.1** ✅ | 記憶 *Kioku* | Remember | The committed four: journal + photos, sound & haptics, four travelers, the Japan clock — *shipped July 2026* |
| **v3** 🖌️ | 生きている *Ikiteiru* | The painting lives | **Shipped:** solar clock, microseasons, nijimi physics, living vignettes (tilt/drift depth planes, the heron, the gondola, the deer's bow, after-dark neon and windows), Fuji Window (the Day-7 GPS Tōkaidō scroll — "Fuji on the right in N minutes") (plus field fixes: the iOS departure-date picker, day-to-day paging, Windows story-suite spawn). **Remaining:** Sumi (mascot), opening cinematic, kids' game layer (yōkai camera, Denshadex, boss battles, side quests), geofenced stamps |
| **v3.5** | 相棒 *Aibō* | The companion | Claude layer: Menu Lens, interpreter, concierge, journal weaver, bedtime stories, phrase dojo — every feature degrading gracefully offline |
| **v4** | 一緒に *Issho ni* | Together | Backend: live Family Ink sync, grandparents' window, split-party days, reservation inbox, park mode, transit copilot, rain auto-replan |
| **v4.5** | 手元に *Temoto ni* | In your hands | The physical pipeline: trip poster, goshuincho, photo book, postcards from 7-Eleven, furoshiki, omamori charms |
| **v5** | 旅の棚 *Tabi no tana* | The shelf | Destination packs, Trip Weaver, remix gallery, ateliers, the Memory Vault — Tabi as the place a family keeps its adventures |

---

## Part V — The compass

Rules that survive the retirement of "no network, ever":

1. **Offline-first, never offline-only.** Any feature may use the network; no feature may *require* it to
   leave the family stranded. When the signal dies in the Ōsaka subway, a working painting remains.
2. **The ink is the interface.** Nothing ships in default-widget clothing. If a feature can't be drawn in
   brushstrokes, it isn't designed yet.
3. **The kids are protagonists, not cargo.** Every layer asks: what does the eight-year-old *do*?
4. **Data becomes heirloom.** Everything the app collects should be printable, ownable, and worth keeping for
   twenty years. If it can't become a memory, question why it's collected at all.
5. **Quiet by default.** Sound, notifications, and AI assistance are invitations, never interruptions. Japan
   itself is the main event; the app is the daypack.

— *composed from an eight-lens brainstorm (play, logistics, platform, AI, memory, social, art, product) plus
the builder's own list; ~117 raw ideas, deduplicated and sequenced. No idea was left unsaid.* 🌸
