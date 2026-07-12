# Live Family Ink — realtime sync — Design

**Date:** 2026-07-12 (JST) · **Roadmap item:** 一緒に *Issho ni*, "Family Ink (live sync)" (`M · backend`), pulled forward from v4
**Status:** designed with the owner in-session; Supabase project **created**; build next.
**Unblocks:** the owner's original question — *"does the app auto-sync when the phones are online?"* — becomes "yes."

## Intent

Dad marks Fushimi Inari **loved**; the vermillion blooms on Mom's phone mid-shrine. Trip
state graduates from the folded link to a living channel: whenever a phone is online, it
syncs by itself. The folded link (AirDrop / iMessage) remains forever as the floor — the
manual share is not deprecated, it is the fallback.

Compass fit: **offline-first, never offline-only** (#1) — live sync is an enhancement
layer; the app is byte-for-byte identical in behavior until the owner flips it on, and a
phone in a tunnel keeps working and flushes when the sky returns. **Quiet by default** —
no login screens, no accounts, no emails; phones acquire identity silently.

## Owner decisions (2026-07-12, recorded as DECISIONS.md #22)

- **Backend:** the owner's Supabase — fresh free-tier project **`tabi-family-sync`**
  (ref `utvrwvxlkfbmlswcrxkc`, region `ap-northeast-1` Tokyo — nearest the phones for the
  trip window), org NerveWreckTech. $0/month.
- **Payload: trip progress only.** Reservations / PNRs / host names **never** reach the
  server (#19 upheld); the AI key never leaves the phone (#17, #11 precedents).
- **Pairing:** a short typed code (`FUJI-42` style), single-use, 15-minute expiry.
- **Ships dark:** OFF by default; each phone flips it on in Kit.
- **Fallback forever:** the manual share link stays in Kit, one breath below.

## The shape

```
 phone A ──save──▶ ┌───────────────────────┐ ──realtime push──▶ phone B
                   │  Supabase (Tokyo)     │
 phone B ──save──▶ │  one row per family   │ ──realtime push──▶ phone A
                   └───────────────────────┘
        payload = trip progress only · merge = the tested additive fold
```

Incoming state folds through the **same `mergeState()` that already ships** — loved beats
done beats skipped, packed stays packed, unions, high-score-wins. The merge is the hard
part of sync, and it is already written and suite-enforced.

## Data on the server — three tables

- `families` — `id uuid pk default gen_random_uuid()`, `join_code text unique`,
  `join_code_expires_at timestamptz`, `created_at`.
- `family_members` — `family_id fk`, `user_id uuid` (`auth.uid()`), `joined_at`;
  pk `(family_id, user_id)`.
- `family_state` — `family_id pk fk`, `state jsonb`, `version int`, `updated_at`,
  `updated_by uuid`. Realtime is enabled on this table only.

`state` holds a **SyncPayload**: `TripState` with `reservations` pinned to `{}` — an
explicit allowlist built by a new `collectLiveState()` (moments, packed, favs, allergies,
departure, rate, travelers, quizScores, notes, densha, deer). Pinning `reservations: {}`
(rather than removing the field) means `mergeState()` is reused **untouched** — the empty
map no-ops. `v: 1` is kept for the same tolerant-decode reasons as the link.

## Identity & access

Each phone calls `supabase.auth.signInAnonymously()` once, silently; supabase-js persists
the session in localStorage. No UI. **One owner-side dashboard step before first flip-on:**
Authentication → enable **Anonymous sign-ins** (the management MCP can't toggle auth
config; it is a ten-second switch, called out in the build report).

Row-level security, default-deny:

- `family_state`: `select` / `update` only where a `family_members` row matches
  `auth.uid()`.
- `family_members`: `select` limited to your own family's rows (feeds "Synced · N
  phones"); membership is **inserted only via RPC**.
- `families`: no direct table access; RPCs only.

Three `security definer` RPCs:

- `create_family()` → family + creator membership + empty state row; returns
  `{family_id, code}`.
- `new_join_code(family_id)` → member-only; mints a fresh code, 15-min expiry (for the
  third and fourth phone, or when one fades unused).
- `join_family(code)` → validates an unexpired code, inserts membership, **clears the
  code** (single-use), returns `{family_id, state}`.

Code format: a curated Japan word list (~64 entries — FUJI, NARA, KOI, ZEN, TORII…) plus
two digits: `FUJI-42`. ~6,400 combinations against a 15-minute single-use window; the
code is a pairing gesture, not a password — after the join, identity is the anon session.

The Supabase URL and **publishable** key are constants in the public bundle — that is the
intended Supabase model (RLS is the lock, not the key), and #17 already sets the
precedent that only publishable-class credentials may appear in the repo.

## The engine — `src/lib/liveSync.ts`

- **Lazy.** `import('@supabase/supabase-js')` happens only when `tabi:live-sync` is on —
  the dark feature adds ~0 bytes to the startup path.
- **Up.** A gentle loop: every 5 s while the app is visible (plus immediate flushes on
  `online` and on `visibilitychange → hidden`), hash `JSON.stringify(collectLiveState())`;
  if it differs from the last acknowledged hash → optimistic-concurrency write:
  `update family_state set state = :merged, version = version + 1 where family_id = :id
  and version = :readVersion`. Zero rows updated → someone else wrote first → re-read,
  re-merge locally, retry (bounded at 3; then the next tick owns it). The loop is the
  **single writer**; nothing else touches the row.
- **Down.** A Realtime `postgres_changes` subscription on the family's row → fold through
  `mergeState(incoming.state)` → `window.dispatchEvent(new Event('tabi:ink'))` → screens
  that matter live (Journey, Treasures, Kit's status line) re-read localStorage on that
  event; every other screen refreshes on next visit. v1 scope, deliberately.
- **Belt and suspenders on the down path:** one read-and-merge on every
  `visibilitychange → visible` and after every successful push — so a silently dropped
  websocket degrades to refresh-on-glance, invisible to the family.
- New localStorage keys: `tabi:live-sync` (`'on'` / absent) and `tabi:family`
  (the family id). Neither is ever added to `collectState()` / `collectLiveState()`.

## Kit — the Family Ink card

Sits above the existing share-link row. A status line — **Off** · **Solo — waiting for
family** · **Synced — N phones, HH:MM** — and three affordances:

- **Start our family** → creates the family, shows the code big and proud with an expiry
  countdown and a "new code" brush.
- **Join a family** → one text input, typed code, done.
- **Turn off** → local flip only; the server row stays; turning back on re-joins with the
  stored `tabi:family` id, no new code needed.

## Every failure has a face

| State | Face |
|---|---|
| Unreachable at flip-on | "The ink can't reach the sky right now — the link below still works." Retries on `online`. |
| Code wrong / expired | "That code has faded — ask for a fresh one." |
| Realtime socket drops | Silent; visibility-refresh and after-push reads carry it. |
| Write conflict | Invisible: re-read, re-merge, retry. |
| Future schema (`v > 1`) | `mergeState()` is already tolerant of unknown/missing fields; never crash, fold what we know. |
| Supabase project paused/gone | Status shows the unreachable face; app unaffected; the folded link carries the family. |

## Testing — the suite stays offline

- Default OFF → zero network in checks; the 98 stay green untouched.
- New checks: Kit renders the Family Ink card (off state); an `?ink=` fixture
  short-circuits the engine (the `?lens=` precedent) to render Solo / Synced states
  without network; **tripwire** — `collectLiveState()` output must contain no
  reservation contents and no `tabi:claude-key` (extends the existing key tripwire).
- Live E2E before the owner flips it on: two desktop browser profiles against the real
  project — pair by code, mark a moment on A, watch it bloom on B; cut B's network, mark
  on both, restore, confirm additive convergence.

## Ship

Branch `claude/live-family-sync` (stacked on `claude/v3.6.0-docs`, the #10 pattern).
Lands dark → owner merges → Pages deploys → phones pick it up on the next Wi-Fi service-
worker refresh → owner enables Anonymous sign-ins in the Supabase dashboard, then flips
Kit's switch on both phones whenever comfortable — even mid-trip, the link is the floor.
Tag **v4.0.0** on ship: first 一緒に feature, the #20 tag-ladder precedent. ROADMAP Part
IV row moves to shipped.

## Cost & blast radius

Free tier: 500 MB database / 2 GB egress / 200 realtime peers — a family's state is
~10 KB; this is a rounding error forever. Worst-case abuse of the public key:
rate-limited anonymous sign-ups creating empty families; nothing readable without
membership; the project is pausable in one click and the app degrades to today's manual
link.
