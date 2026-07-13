# 回覧板 Kairanban — the family journal feed · design

*2026-07-13, trip day two. Owner: "if someone puts a journal entry, it becomes visible on the other apps.
But can't be edited from there. Looking for a social media feel but just between the family." Two design
questions asked and answered: the existing day-journal **auto-publishes** (no new composer), and **hearts
are in v1**. This is ROADMAP's "Today's Scroll", built as the journal's sync layer.*

## The concept

A kairanban is the neighborhood circular board: one household writes, every household reads, nobody edits
someone else's notice. Here: everyone journals exactly as today (same card, same photos, same ink filter);
when Family Ink is on, each phone's day entry publishes itself a few seconds after the writer stops typing
and re-publishes on every edit. The family sees each other's pages in a **feed section at the top of
Treasures** (newest day first, then newest update) and on **each day's detail page** beneath their own
journal. Each member can leave **one vermillion ink-heart** per entry; the writer sees tiny hearts wearing
the mascots of who loved it.

## Ownership model — enforced by the database, not the UI

- A published entry row is keyed `(family_id, device_uid, day_id)` where `device_uid` is the phone's
  anonymous Supabase `auth.uid()`. **Row-level security allows INSERT/UPDATE only where
  `device_uid = auth.uid()`** — other family phones can read, and physically cannot write. There is **no
  DELETE policy**: pages of the trip diary are keepsakes (the author can still empty text/photos, which
  re-publishes an empty page).
- Hearts live in their own table keyed `(family_id, post_device, post_day, device_uid)` — each heart row is
  owned by the *reactor*, insert/delete only for `device_uid = auth.uid()`. One heart per person per entry
  by primary key. Single-writer per key ⇒ both tables converge under the live loop by construction
  (DECISIONS #23's law, satisfied by ownership instead of monotonicity).
- The traveler chip (`authorId`) stays what it is today: display metadata. Ownership is the device. Edge
  case, accepted: if a phone loses its anonymous session (storage cleared), its old rows freeze as
  read-only history and its next publish starts a fresh row — the feed groups visually by traveler chip, so
  this reads as a hiccup, not a break.

## Schema (new migration `20260713..._kairanban.sql`)

```sql
journal_posts  (family_id fk→families, device_uid uuid, day_id int,
                author_id text, body text, photos jsonb default '[]',
                updated_at timestamptz, primary key (family_id, device_uid, day_id))
journal_hearts (family_id fk→families, post_device uuid, post_day int,
                device_uid uuid, traveler_id text, created_at timestamptz,
                primary key (family_id, post_device, post_day, device_uid))
```

RLS: `select` by `is_family_member(family_id)` (the existing definer fn); `insert/update` (posts) and
`insert/delete` (hearts) additionally require the owning `device_uid = auth.uid()`. Both tables join the
`supabase_realtime` publication. **Realtime events are treated as doorbells only — the client refetches
rows on every event** (dodges payload-size limits on photo-carrying rows).

Riding along in the same migration, from the 2026-07-13 security sweep discussion (the feed raises what a
join-window intruder could see — kid photos now, not just check-offs): a **join-attempt throttle** —
`join_attempts(uid, window_start, tries)` checked inside `join_family()`, max 10 tries per uid per hour —
plus `revoke execute ... from anon/authenticated` + explicit grants so only the intended RPCs are callable.
This was finding #1 of the sweep; the code space is 6,400 and was previously unthrottled.

## Photos

On publish, each local journal photo (already ≤1280px JPEG in IndexedDB) is downscaled again to **≤640px
JPEG q0.72** (~40–90 KB) and embedded in the row's `photos` jsonb as base64, capped at **4 per entry**
(oldest first; the card notes "+N more on Dad's phone" past the cap). Full-resolution originals never
leave the authoring phone. Ink-filter flags travel with each photo so the feed honors the sumi-e toggle.
Sizing math: 12 days × 4 phones × ~4 photos × ~70 KB ≈ 13 MB worst case — far inside the free tier.

## Client engine (`src/lib/liveFeed.ts`)

- `publishDay(dayId)` — read entry + photos from IndexedDB, build the wire row, upsert. Debounced 3 s
  behind Journal saves (only when `inkOn() && familyId()`); flushed on `visibilitychange` hidden. Single
  writer ⇒ no version guard needed.
- `fetchFeed()` — all family rows + hearts; written to a new IndexedDB store `feed` (db version 3,
  `contains()`-guarded upgrade per the never-strand-state rule) so the feed still opens in a tunnel.
- `toggleHeart(postDevice, postDay)` — insert/delete own heart row with the phone's traveler chip.
- Realtime channel `feed:{family_id}` on both tables → refetch → `tabi:feed` window event; screens re-read.
- `?feed=` fixtures (posts/hearts/empty/offline states) keep the story suite fully offline, the `?ink=`
  precedent. `myDeviceUid()` exposed for read-only assertions.
- Reuses the Supabase client via a new `inkClient()` export from liveSync.ts (same lazy import, same
  anonymous session — one client, one uid, both engines).

## Feed UI (`src/components/FamilyFeed.tsx`)

Washi cards in the house language: author mascot + name in their ink color, day chip (Day N · city),
body text, photo thumbs through the ink filter (tap flips, same as the journal), the hearts row (tiny
vermillion blots wearing reactors' mascots; tap your own slot to heart/unheart — `play('loved')`), and a
quiet "updated 18:07" stamp. **Your own card carries the edit hint ("your page — edits flow to the
family"); other cards carry no affordances at all.** Mounts: Treasures (new top section, before the stamp
journal) and DayDetail (that day's pages, beneath the journal card). Unseen-content dot on the Treasures
tab icon via a `tabi:feed-seen` localStorage stamp. Empty state: "The kairanban is blank — write today's
page in your journal." Offline: last-fetched pages + "waiting for the sky" whisper. Reduced motion: no
new animation beyond opacity.

## The key-test button (rides along — from tonight's field failure)

Kit → Settings AI-key row gains **"test the brush"**: `testKey(key)` in lens.ts fires a `max_tokens: 1`
text-only message on the decoder model and maps the result through the existing `LensFail` faces — ✓
stamps on success, the exact calm sentence on failure ("That key did not work…" / "needs the sky"). One
tap ≈ a fraction of a cent. `?keytest=ok|bad` fixture for the suite.

## Verification

- Story suite (offline): feed section renders from `?feed=ok` (cards, mascots, photos, hearts count);
  own-card vs. other-card affordances (no edit affordance on others); heart toggle updates the row;
  empty + offline faces; Treasures dot; key-test ✓ and bad faces; db v3 upgrade keeps v2 journal data.
- Live E2E (`npm run check:live` extension, two browsers, real project): A publishes → B sees the page;
  **B's direct UPDATE of A's row is rejected by RLS** (the read-only rule proven against the real
  database); B hearts A's page → A sees the mascot blot; join-throttle sanity (11th rapid join attempt
  refused). Test families/rows cleaned after; **never touch non-test rows** (the real family lives there).
- Visual pass at iPhone viewport, day + night palettes, before commit.

## Out of scope (noted for later)

Comments/threads (never, probably), the quick-post composer ("both" option — v2 if the family asks),
grandparents' read-only window (separate roadmap item; this schema is its natural substrate), photo cap
lift via Supabase Storage (only if the family hits the cap in practice).
