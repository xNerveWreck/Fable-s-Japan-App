<div align="center">

# 旅 Tabi — Japan, Together

**A family of four's first journey through Japan.**
Fourteen days, hand-crafted. Built for iPhone, works offline, beautiful in daylight and lantern-light.

</div>

---

<p align="center">
  <img src="docs/screens/journey-light.png" width="30%" alt="Journey home screen, washi-paper day theme" />
  <img src="docs/screens/journey-dark.png" width="30%" alt="Journey home screen, indigo snow-night theme" />
  <img src="docs/screens/day-detail-light.png" width="30%" alt="Day 8 detail — Fushimi Inari timeline" />
</p>

## What this is

Tabi (旅, *journey*) is a complete travel companion for a family's first two weeks in Japan — Tokyo → Hakone → Kyoto → Nara → Osaka. It's a React PWA designed exclusively for the iPhone in your pocket on a Kyoto street corner: installable to the Home Screen, fully offline once loaded, no accounts, no servers, no tracking. Everything lives on the device.

### The four tabs

| | |
|---|---|
| ⛩️ **Journey** | The 14-day itinerary as a living record. Every day has a theme, a painted city vignette, a timeline of stops, honest family pacing, a rain plan, a **reservations pocket** for confirmation codes, and 🦊 *For the kids* tips on nearly every activity. Mark each stop **Did it / Loved it / Skipped** — loved moments collect into a treasures list. The home screen carries the countdown (then live *Up next today* during the trip), **The Road** — the route as one brushstroke, where a red hanko stamp lands on each completed city — a rotating phrase of the day, and the **stamp journal**: fourteen eki-stamp badges earned day by day. |
| 🪭 **Discover** | A field guide to how Japan works: etiquette (onsen rules, chopstick taboos, the escalator-side rivalry), transit mastery (Suica, Shinkansen, luggage forwarding), practical magic (konbini, vending machines, gachapon), culture keys (shrine vs. temple, omamori) — plus a 20-dish food guide rated on a five-petal **kid-meter**, and the **Train Quiz**: sixteen questions to pass around the shinkansen, scored like an omikuji fortune. |
| 💬 **Speak** | A 46-phrase family phrasebook with kana, romaji, and usage notes. Tap the speaker and the phone *says the phrase aloud* in Japanese (on-device speech synthesis, offline). Star your go-to phrases; search across everything. Includes a Kids' Corner — *sugoi!*, *yatta!*, *janken pon!* |
| 🎒 **Kit** | Yen ⇄ USD converter with adjustable rate · daily budget guide · five persistent packing checklists · a tap-to-build **allergy card** that renders full-screen in written Japanese to show restaurant staff · **Family Sync** — fold the whole trip state into a link, AirDrop it to another phone, and merge additively (no servers; the link *is* the data) · emergency numbers as one-tap calls. |

<p align="center">
  <img src="docs/screens/stamps-light.png" width="30%" alt="The Road map and eki-stamp journal" />
  <img src="docs/screens/day-nara-light.png" width="30%" alt="Nara day with painted deer vignette" />
  <img src="docs/screens/day-hakone-dark.png" width="30%" alt="Hakone day with Mount Fuji vignette at night" />
</p>

<p align="center">
  <img src="docs/screens/quiz-light.png" width="30%" alt="The Train Quiz" />
  <img src="docs/screens/phrases-light.png" width="30%" alt="Phrasebook with speech synthesis" />
  <img src="docs/screens/kit-sync-dark.png" width="30%" alt="Family Sync in the Kit tab, dark theme" />
</p>

## The design

The visual language is drawn from sumi-e ink-wash painting and shin-hanga woodblock prints:

- **Day** — ink on washi-paper cream, sakura pink and vermillion accents, a red hanko seal for the day counter.
- **Night** — the palette shifts to the indigo of Tsuchiya Koitsu's snow prints: the red sun becomes a pale moon, falling sakura petals become falling snow, and a lantern lights up inside the pagoda.

All the artwork — the hero landscape, six city vignettes (Tokyo Tower, Fuji over Lake Ashi, the Fushimi torii tunnel, a Nara deer, the Dōtonbori crab, the flight home), the brushstroke route map, and fourteen eki-stamp badges — is hand-composed inline SVG. Every color is a CSS custom property, so *one set of brushwork* renders both scenes. No image assets, no web fonts, no external requests of any kind: the display type is New York / Hiragino Mincho straight off iOS.

Details that matter on a real trip: hash routing so iOS edge-swipe back and pull-to-refresh behave like a native app (days are deep-linkable, too), safe-area-aware layout for the notch and home indicator, frosted-glass tab bar, spring-press animations, `prefers-reduced-motion` respected, and a service worker that caches the whole app — because the moment you need the allergy card is not the moment to have signal.

## Run it

```bash
npm install
npm run dev        # local dev
npm run build      # production build → dist/
npm run preview    # serve the build
```

Open on an iPhone (or any browser at iPhone width), then **Share → Add to Home Screen** for the full standalone experience.

## Stack

React 18 + TypeScript + Vite. No UI libraries, no CSS frameworks, no runtime dependencies beyond React — the entire app is ~87 KB gzipped. Verified with a 22-check Playwright suite at iPhone viewport in both color schemes, including a full two-phone Family Sync roundtrip.

---

<div align="center">

*Built end-to-end — concept, itinerary, artwork, design system, and code — by Claude.*

いってらっしゃい — safe travels. 🌸

</div>
