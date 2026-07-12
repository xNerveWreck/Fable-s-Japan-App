# Session Notes — Tabi (旅)

Running log, newest entry on top. Read after README, before DECISIONS.md and the
plan. The repo is the only memory shared between the laptop and claude.ai cloud
sessions — never end a session without an entry here or a wrapped report.

---

## 2026-07-13 — v4.1.0 shipped: Michizure merged, tagged, released, live on the phones

**What happened (desktop session, morning after the overnight build):** the owner
merged **PR #24** (`claude/menu-kamon-sumi`), refreshed both phones, and tapped
the **Kiwi** chip (it synced family-wide). This session then ran the ship
routine: `main` verified **130/130 at the merge commit (7b7f10e)**, tagged
**v4.1.0**, and published the
[Release](https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v4.1.0)
with the dist zip attached. Docs bump rides branch `claude/v4.1.0-docs`
(this entry, README Current state → v4.1.0, ROADMAP v4.1 row → shipped,
IMPLEMENTATION_PLAN status/index) — pushed, awaiting owner merge; docs-only,
no urgency.

**Verified how:** fresh `npm run build` + `npm run check` on `main` after the
merge — 130/130, all offline. (The overnight session's per-feature verification
and visual pass are in the entry below.)

**Pick up here:** (1) The **Menu Lens real-key smoke test is the next meal** —
first real menu photo through the owner's key; fixtures covered everything but
the actual API round-trip. If anything looks off, `?menu=ok` isolates UI from
API. (2) Owner merges `claude/v4.1.0-docs` whenever. (3) Next builds from the
deferred list when asked: Phrase Dojo, generative soundscape, opening
cinematic — or field requests, which is how v3.6.0 and v4.0.1 happened.
(4) Sumi extension points ready: `tabi:loved`, `currentCity()`.

---

## 2026-07-12 (overnight) — the Michizure batch: Menu Lens + kiwi, the kamon, and Sumi

**What happened (desktop session, branch `claude/menu-kamon-sumi` off main@d70edc7
— three feature commits pushed, awaiting owner merge → proposed v4.1.0):** the
owner picked three of the six vision-talk features and went to bed ("knock out
all of them at once. Menu, kiwi, Sumi, and Kamon"); Phrase Dojo, soundscape, and
the opening cinematic stay deferred. Everything landed:

1. **Menu Lens + kiwi** (`fa3be32`) — the second lens on the #17 key (shared
   `lensCall`, `?menu=` fixtures, allergy card in the prompt; dishes with
   vermillion avoid-strikes, gold cautions, 子 kid picks, the polite order
   line). Kiwi (キウイフルーツ) joined the allergen picker — it's a live-synced
   field, so one tap propagates to all four phones.
2. **Generative kamon** (`9bcdce4`) — the crest derives from the travelers'
   animals + ink colors (no picker, DECISIONS #25), gains a petal per loved
   moment (capped 36), seals Family Ink and the Treasures header, blossom
   fallback pre-travelers.
3. **Sumi v1** (`9530a28`) — the ink spirit above the tab bar (DECISIONS #26):
   breathes/blinks, sleeps at `data-phase='night'` as a pale moonlit spirit,
   hops with an ink splash on the new `tabi:loved` event, Nara antlers via the
   newly exported `currentCity()`, pettable, stilled by reduced motion.

**Verified how:** suite **107 → 130/130 green** (build + check before every
commit); visual pass via Playwright element screenshots at iPhone viewport, day
and night — menu result card, kamon close-up and both mounts, Sumi awake/asleep/
antlered/in-place. One design iteration each on the kamon (fold dividers + knot
to bind the field, stronger motif silhouettes) and Sumi's antlers (beams-with-
tines, not antennae) after looking at real renders. Docs: DECISIONS #24–#26,
ROADMAP Part II ✅s + the v4.1 道連れ row, README (Current state, Speak, Treasures,
Sumi), and the spec at `docs/superpowers/specs/2026-07-12-menu-lens-kamon-sumi-design.md`.

**Pick up here:** (1) **owner merges** `claude/menu-kamon-sumi` → Pages deploys →
phones refresh on Wi-Fi; then tag **v4.1.0** + Release on his go. (2) On any
phone: Kit → Allergy card → tap **Kiwi** once (it unions everywhere), then point
the Menu Lens at dinner — the real-key smoke test is that first meal. (3) Sumi
extension points are ready when wanted: `tabi:loved` for reactions,
`currentCity()` for costumes (Kyoto/Osaka ideas in ROADMAP), the brain stays
moonshot. (4) Still deferred: Phrase Dojo, soundscape, opening cinematic.

---

## 2026-07-12 (night) — v4.0.1 fix: the synced card now shows invite codes

**What happened (desktop session, branch `claude/fix-invite-code`, stacked on
`claude/v4.0.0-docs` — pushed, awaiting owner merge):** the owner paired the
real phones, then found **"Invite another phone" did nothing.** Root cause in
`liveSync.ts` `markSynced()`: the SYNCED status object never carried
`code`/`codeExpiresAt` — only the solo branch did — so `freshCode()` minted a
code server-side that the card could never show (and the status-equality
guard suppressed even the re-render). Fix: the code rides both branches while
it's alive; expired codes now drop off on the next status pass instead of
lingering as dead ink.

**Verified how:** TDD — a new live E2E check reproduced the bug **RED (7/8)**,
then the fix went **GREEN**: offline suite **107/107** (new `?ink=invited`
fixture: a synced card showing a fresh code), live E2E **8/8**. Test families
cleaned after both runs; **the family's real row (2 phones) is live on the
project and untouched.**

**Shipped, same night:** owner merged **PR #21** (docs) and **PR #22** (the
fix); `main` re-verified **107/107 at the merge commit** (45e3c32), tagged
**v4.0.1**, [Release published](https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v4.0.1)
with the dist zip. Wrap-up docs pass rode `claude/v4.0.1-docs`: README Current
state → v4.0.1, IMPLEMENTATION_PLAN status/index/invariants caught up (the
two-exceptions network rule, the live-payload law), AGENTS.md gained the
check:live / Supabase-row-safety / Compress-Archive quirks.

**Pick up here:** nothing is mid-flight. (1) Phones pick everything up on
their next Wi-Fi refresh — then "Invite another phone" works for a third
phone; (2) next builds are the owner's pick from IMPLEMENTATION_PLAN's
candidates — item 0 is the small Family Ink hardening list; (3) during-trip
polish requests will arrive from the field, as v3.6.0 and v4.0.1 did. The
family is in Japan with a live-syncing painting. よい旅を!

---

## 2026-07-12 (later, departure day) — Family Ink live sync built, ships dark

**What happened (desktop session, branch `claude/live-family-sync` — pushed,
awaiting owner merge):**

1. **Backend:** a fresh Supabase project, `tabi-family-sync` (Tokyo, free
   tier); migration `supabase/migrations/20260712000000_family_ink.sql`
   **applied to the live project** — the `families`, `family_members`, and
   `family_state` tables, RLS, and the pairing RPCs.
2. **Engine:** `src/lib/liveSync.ts` — lazy-loaded `supabase-js`, `FUJI-42`-
   style single-use pairing codes, a 5-second fold-and-push loop, and a
   realtime bloom back onto every other phone in the family.
3. **Kit card:** "Family ink" — start a family, or join one by typing a code.
4. **App wiring:** boot + bloom — the live view folds in on load and blooms
   as rows arrive over realtime.

Two calls worth recording as the session's real story, both in the spec's
SyncPayload section: (1) the non-converging fields — `notes`, `travelers`,
`departure`, `rate` — are **pinned out** of the live payload; their
mine-wins/append merge semantics would ping-pong a polling loop forever. (2)
the live view is **normalized** before it goes over the wire (favs/allergies
sorted, packed kept true-only) so identical progress always serializes
identically. What actually rides the wire: moments, packed, favs, allergies,
quizScores, densha, deer. Reservations/PNRs still never reach the server
(DECISIONS.md #19 upheld), and — inherited from the manual link — sync stays
additive only: no retraction while the ink is on.

**Verified how:** suite grew 98 → **106/106 green**, and the live two-browser
E2E (`npm run check:live`, real project, owner's Anonymous-sign-ins toggle ON)
passed **7/7 — twice**: pair by code, realtime bloom, tunnel-heal convergence,
and a planted fake PNR that never reached the other phone. Test families
deleted after each run (tables verified 0/0/0). Final whole-branch review
(fresh eyes, most capable model): **ready to merge**, zero blockers.

**Ships dark:** OFF by default, the folded link unchanged as the permanent
fallback. Owner-side before flip-on: (1) merge this branch; (2) enable
Anonymous sign-ins in the Supabase dashboard (Authentication → Sign In /
Providers); (3) Kit → Family ink → start our family on phone 1, join by code
on phone 2. Tag will be **v4.0.0** — the first 一緒に feature.

**Known sharp edge, consciously deferred (fix-before-flip-on candidate, not a
merge blocker):** a sync bloom remounts the visible screen, which closes an
open modal — e.g. the allergy card mid-display to restaurant staff. Data is
never lost (everything persists on change); recovery is two taps. Deferred
because the exposure window is owner-controlled (ink ships OFF) and any fix
touches trip-critical stable components mid-trip.

**Follow-ups logged (post-merge hardening, none block):** revoke anon EXECUTE
on the definer RPCs + attempt-cap the code-mint loops (one small migration);
enable Supabase anonymous-sign-in rate limiting; soften the unreachable-face
flicker on flaky Wi-Fi; speech can clip when a bloom remounts mid-phrase;
`client()` single-flight guard; freeze `LIVE_PIN`.

**Shipped, same day:** owner merged **PR #20**; `main` re-verified **106/106
green at the merge commit** (0891998), tagged **v4.0.0**, and the [Release is
published](https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v4.0.0)
with the dist zip. Pages auto-deploys `main`, so the live app carries the ink —
dark until flipped.

**Pick up here:** (1) both phones open the app on Wi-Fi to refresh the SW;
(2) Kit → Family ink → start our family on phone 1, join by code on phone 2 —
the dashboard toggle is already ON; (3) the follow-up hardening list above,
whenever. Spec: `docs/superpowers/specs/2026-07-12-live-family-sync-design.md`
· Plan: `docs/superpowers/plans/2026-07-12-live-family-sync.md` · Decisions:
DECISIONS.md #22–#23. よい旅を!

---

## 2026-07-12 (departure day) — both releases shipped

**What happened:** owner merged `claude/treasures-tab` (PR #18) and gave the go
to tag. Both versions are now tagged, pushed, and published as GitHub Releases
with the built app zipped as the asset:

- **[v3.5.0](https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v3.5.0)**
  — real itinerary + Sign Decoder (tag on the PR-17 merge commit `f4fb28e`)
- **[v3.6.0](https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v3.6.0)**
  — the Treasures shelf (tag on the PR-18 merge `ef826db`), marked Latest

Merged `main` verified **98/98 green** before tagging. The v3.5.0 zip was built
from a throwaway git worktree at that tag (then removed); the v3.6.0 zip is the
current build. README "Current state" updated to reflect both as shipped.
Pages auto-deploys `main`, so the live app is v3.6.0.

**Pick up here:** nothing is mid-flight in the code — the repo is clean and
both releases are out. The only open items are **on-device and the owner's**,
to do from Japan on hotel Wi-Fi: (1) reload the app on both phones so the
service worker caches v3.6.0; (2) paste a spend-capped Anthropic key into each
phone's Kit → Settings for the sign decoder; (3) type booking confirmation
numbers into each day's reservations pocket; (4) family-sync the phones. The
family is travelling Jul 13–23 — next real work is post-trip. よい旅を!

---

## 2026-07-12 (4am, departure day) — v3.5.0 merged; the Treasures shelf built from field feedback

**What happened (desktop session, branch `claude/treasures-tab` — pushed, awaiting owner merge):**

1. Owner merged `claude/real-itinerary` (PR #17) — **v3.5.0 content is live on
   main and on the family's phones** (screenshots from the device confirmed:
   Day 1 "The Leap" showing TODAY, travelers named). The **v3.5.0 tag +
   Release are still pending** — the tag push needs the owner's explicit
   go (permission-gated); one word and it ships.
2. First real-device feedback arrived at 4am with annotated screenshots, and
   became **v3.6.0** (DECISIONS.md #21): new **Treasures · 宝物 tab** (hanko
   icon) holding the stamp journal, loved moments + tanzaku, Denshadex, and
   Train Quiz (`src/screens/Treasures.tsx`, quiz extracted to
   `src/components/TrainQuiz.tsx`); Journey home slimmed to the plan;
   travelers moved into Kit → Settings; **The Road deleted** (owner's call;
   `src/art/RouteMap.tsx` removed); Discover back to field-guide only.

**Verified how:** suite grew 94 → **98/98 green** (red commit first); visual
pass at 390×844 via Playwright captures (Treasures shelf day + night, slim
Journey home, Kit settings with travelers). Browser-pane screenshots still
time out — the SHOT_DIR / one-off Playwright script path is the way.

**Pick up here:** (1) owner merges `claude/treasures-tab` (Pages deploys;
phones update on next Wi-Fi); (2) tag **v3.5.0** on the PR-17 merge commit
(f4fb28e) + Release with dist zip, then **v3.6.0** on this merge + Release —
both need the owner's go for the push; (3) on-device setup still open from
the last entry: spend-capped AI key per phone, booking refs into the
reservations pockets, family-sync both phones. The family flies TODAY —
anything further waits for hotel Wi-Fi. よい旅を!

---

## 2026-07-11 (late) — The real itinerary + the Sign Decoder, one branch, night before the flight

**What happened (desktop session, branch `claude/real-itinerary` — pushed, awaiting owner merge):**

1. **The real trip replaced the dream trip** (DECISIONS.md #18). The owner
   delivered the final booked plan (Jul 12–23) and approved a full replace:
   12 dated day cards — Day 1 is the flight day ("The Leap"), then
   Nishi-Nippori base, Puroland, Yoiyama on the biggest night, the Gion
   Matsuri parade, Fushimi Inari at 7am, the Nara→Osaka day, USJ, Katsuōji,
   the return shinkansen, and the Skyliner home. `TRIP_LENGTH = 12`; new
   `date` field on `Day` renders "Thu · Jul 16" labels; `fujiWindow` moved to
   day 5, `deerDojo` to day 8; **62 haiku re-engraved** (survivors ported);
   route map is now Tokyo → Kyoto → Nara → Osaka + a dashed arc home; Hakone
   vignette/coords/trains/quests retired (Skyliner AE, Keiō 8000, 323 Loop,
   Yanaka cat, Gion float wheel, tiniest daruma join); Kit gained **The Heat
   Plan** checklist; demo reseeded.
2. **Privacy line drawn** (DECISIONS.md #19): hotel names yes, booking
   refs/host names/PNRs no — those go in the on-device reservations pocket.
   The owner asked about "private repo + everything in": doesn't work, the
   Pages site (and bundle) is public regardless of repo visibility.
3. **Sign & Etiquette Decoder built** (DECISIONS.md #20) — the owner gave the
   go and asked for everything in one branch/merge. Executed
   `docs/superpowers/plans/2026-07-10-sign-decoder.md` exactly as written
   (red → green): `src/lib/lens.ts`, `SignLens` card in Speak, AI-key row in
   Kit → Settings, sync tripwire comment + suite check.

**Verified how:** suite grew 88 → **94/94 green** (two red commits first, per
process); visual pass at 390×844 via preview + the suite's SHOT_DIR
screenshots (day cards with dates, The Leap's plane vignette, Fuji Window on
day 5, Denshadex's new roster, SignLens idle/offline states, Heat Plan and AI
key in Kit, dawn/day/dusk/lantern/night palettes). Two stragglers caught in
the visual pass and fixed: the stamp journal's hardcoded `/14`, and the
pocket's teamLab placeholder.

**Weird things hit (gold for the next agent):**
- The Browser-pane `computer` screenshot tool timed out repeatedly even after
  a preview restart — the suite's `SHOT_DIR=<dir> npm run check` is the
  reliable way to get real screenshots (Playwright captures them).
- The itinerary now has **62** activities (was 73) — the suite counts with
  the strict `^\s*time: '` regex and haiku coverage is enforced 62/62.
- Sign-decoder red state: the plan's section-15 checks abort with a hard
  TimeoutError at the first missing locator rather than printing FAILs —
  known behavior (AGENTS.md), fine as the red proof.

**Pick up here:** (1) owner reviews + merges `claude/real-itinerary` (single
merge; Pages deploys automatically); (2) after merge: tag **v3.5.0** +
GitHub Release with `dist/` zipped (offered — see DECISIONS.md #20 for why
3.5 not 4.0); (3) BOTH phones on Wi-Fi: open the app to refresh the service
worker, set departure = **2026-07-12**, paste a spend-capped Anthropic key
into Kit → Settings on each phone, and type the booking numbers into the
reservations pockets (the copy list is in the session's final report — Day 2
Booking.com, Day 5 Airbnb, Day 8 Daiwa Roynet, Day 9 USJ tickets when
bought, Day 11 the last hotel); (4) family-sync the phones once everything
is entered. Nothing else is mid-flight. 行ってらっしゃい!

---

## 2026-07-11 — v3.2.0 tagged and released

**What happened:** owner merged `claude/haiku-engraver` (PR #15); main verified
**88/88 green at the merge commit**, then tagged **v3.2.0** and published the
GitHub Release with `dist/` zipped as the asset:
https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v3.2.0 — Pages
deploy on the merge ran green (33s), so the live app carries the engraver.
This entry rides the `claude/v3.2.0-docs` branch with the README current-state
bump (the v3.1.0 precedent, PR #14).

**Pick up here:** (1) owner merges this docs branch; (2) both phones open the
app on Wi-Fi before the 2026-07-12 flight so the service worker caches v3.2.0;
(3) the Sign & Etiquette Decoder builds on the owner's go — new branch
`claude/sign-decoder`, follow `docs/superpowers/plans/2026-07-10-sign-decoder.md`
top to bottom; nothing else is mid-flight.

---

## 2026-07-10 (late) — The Haiku Engraver ships; the Sign Decoder is fully planned

**What happened (desktop session, branch `claude/haiku-engraver` — awaiting owner merge):**

1. **Haiku Engraver built** (owner-approved design): `src/data/haiku.ts` — 73
   pre-authored 5-7-5s, one per itinerary stop, keyed by the moment key — no
   runtime AI (DECISIONS.md #16). Loved moments are engraved in their treasure
   rows; the *短冊 unroll* button opens the **TanzakuScroll** overlay (all loved
   poems in trip order, hanko seal, reduced-motion safe).
2. **Sign & Etiquette Decoder designed + planned, build deferred.** The big
   unlock: owner resolved #14 — **BYO Anthropic key pasted on-device** into Kit
   (localStorage `tabi:claude-key`, never synced), direct browser CORS calls,
   model `claude-opus-4-8` (DECISIONS.md #17). Executor-grade plan at
   `docs/superpowers/plans/2026-07-10-sign-decoder.md` is cold-session
   buildable: complete code for lens library, Speak-tab card, Kit key row,
   `?lens=` fixtures. Do not build until the owner says go.

**Verified how:** suite grew 79 → **88/88 green** (red commits first); visual
pass at 390×844 — treasures engraving, tanzaku scroll in day and night phases.

**Weird things hit (gold for the next agent):**
- The itinerary has **73** activities, not 74 — a loose `^\s*time:` regex
  over-counts by one; the suite's stricter `^\s*time: '` is the truth (and
  matches ROADMAP's "73 stops").
- Full-screen overlays must beat the tab bar: `.tabbar` is `z-index: 100`, so
  the tanzaku sits at 120 — otherwise Playwright reports the tabbar
  intercepting taps on the close button.
- The suite already had an `rmCtx` — new sections need fresh context names
  (ESM top-level `const` collisions kill the whole run, not one check).

**Pick up here:** (1) owner reviews + merges `claude/haiku-engraver`, then tag
**v3.2.0** + GitHub Release with `dist/` zipped; (2) decoder build is one
"go" away — new branch `claude/sign-decoder`, follow the plan, paste a
spend-capped key into Kit on each phone; (3) pre-flight phone checklist from
the previous entry still stands.

---

## 2026-07-10 — Living vignettes, Fuji Window, and the four-feature trip pack

**What happened (three arcs, one desktop session):**

1. **Living vignettes** shipped (owner merged as PR #10/#12 chain): every city
   painting split into depth planes that tilt with the phone (iOS permission from
   the first tap on a painting; autonomous drift without it), plus inhabitants —
   Kyoto's heron, Hakone's new ropeway gondola, Nara's bowing deer head, Osaka's
   claw wave and after-dark neon, Tokyo's twinkling windows, all pure CSS on the
   solar palette. Test/demo hook: `?vg=now` puts timed visitors mid-scene.
2. **Fuji Window** shipped (merged with the above): day 7's GPS Tōkaidō scroll
   (`src/lib/tokaido.ts` geometry + `src/components/FujiWindow.tsx`). Counts down
   to the real Fuji viewing window near Shin-Fuji, LOOK RIGHT bloom, tunnel-patient
   status. `?ride=<0..1>` drives it without GPS.
3. **Trip pack** built on branch `claude/trip-pack` (12 commits, **awaiting owner
   merge**): family voice phrasebook (mic per phrase → IndexedDB `voices` store,
   DB v2), Denshadex (10 train cards in a new Discover tab, synced via
   `tabi:densha`), Deer Diplomacy (day-11 dojo, ranks, synced count), Side Quests
   v1 (3 hunts × 5 cities, unlock by trip-day city or already-granted GPS; 2 finds
   reveal a hidden `vq-bonus` detail in that city's vignette). Built via
   executor-grade plan (`docs/superpowers/plans/2026-07-10-trip-pack.md`) + four
   Sonnet executor subagent waves with orchestrator diff review between each.

**Verified how:** story suite grew 42 → 60 → **79 checks, all green** (every
feature test-first: red commit, then green); independent re-runs after every
executor wave; visual pass at 390×844 across solar phases for every feature
(screenshots confirmed the senbei stack appearing in the Nara vignette after two
quest finds — the whole side-quest loop live).

**Weird things hit (gold for the next agent):**
- Mid-trip the solar clock follows the **current city's** sun, not Tokyo's — any
  night-time test assertion must use `?clock=00:30`, never a computed Tokyo
  lantern minute. Same trap exists for trip-day math: the app runs on JST
  (`jstToday()`), so a locally-computed departure date can be a day off.
- PowerShell 5.1 mangles double quotes inside `git commit -m` here-strings —
  commit messages must avoid embedded `"` entirely.
- `npm run check` serves `dist/` — always `npm run build` first.
- The Browser-pane preview tools changed shape mid-session; the `mcp__playwright__*`
  tools are the reliable fallback for visual verification.
- React: two `useStored` instances on the same key do NOT re-render each other —
  quest state had to be lifted into `DayDetail` so a find repaints the vignette
  live (executor caught this against the plan's sketch).

**Shipped:** owner merged PR #13 the same day; tagged **v3.1.0** (the repo's
first tag) and published the GitHub Release with `dist/` zipped as the asset:
https://github.com/xNerveWreck/Fable-s-Japan-App/releases/tag/v3.1.0 — main
verified 79/79 green at the merge commit before tagging.

**Pick up here:** (1) owner opens the app once on each phone on Wi-Fi so the
service worker caches v3.1.0 before the 2026-07-12 flight; (2) on a real iPhone:
tap a painting (motion permission), record one phrase (mic permission), log one
Denshadex card — report anything that feels off (tilt amplitude is a two-number
CSS tune). Next build candidates are in IMPLEMENTATION_PLAN.md; nothing is
mid-flight.

---

## 2026-07-09 — Desktop clone bootstrapped; Windows test-suite fix

**What happened:** First desktop clone of this repo to
`C:\Users\xlr86\Documents\Fable-s-Japan-App` (canonical GitHub:
`xNerveWreck/Fable-s-Japan-App`). Setup per CLAUDE.md: `npm install`,
`npx playwright install chromium`. Found and fixed a Windows-only bug: the story
suite spawned `npx` directly (ENOENT on Windows) — now spawns vite's JS entry via
`process.execPath` (merged as PR #9). Suite was 42/42 green after.

**Pick up here:** superseded by the 2026-07-10 entry above.
