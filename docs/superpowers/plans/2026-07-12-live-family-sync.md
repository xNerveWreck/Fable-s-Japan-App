# Live Family Ink — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trip state syncs between the family's phones automatically whenever they're online — Supabase realtime under the hood, the folded link staying forever as the fallback.

**Architecture:** One `family_state` row per family on the owner's Supabase project (`tabi-family-sync`, Tokyo). Phones sign in anonymously (silent, no UI), pair once by a typed short code, then a gentle 5-second hash-diff loop pushes local progress up (optimistic-concurrency, version-guarded) and a Realtime subscription folds remote progress down through the **existing, untouched** `mergeState()`. Ships dark: OFF by default, flipped per-phone in Kit.

**Tech Stack:** React 18 + TS + Vite 6 (existing) · `@supabase/supabase-js` ^2 (new, lazy-loaded) · Postgres RLS + `security definer` RPCs · Playwright story suite (existing, stays offline).

**Spec:** `docs/superpowers/specs/2026-07-12-live-family-sync-design.md` · **Decision:** DECISIONS.md #22.

## Global Constraints

- Branch: `claude/live-family-sync` (already exists, stacked on `claude/v3.6.0-docs`). Never merge, never tag — the owner does both.
- The story suite (`npm run check`) must stay **fully offline** — live sync is exercised only via the `?ink=` fixture and source/bundle greps; the real network is touched only by `tests/live-ink.mjs` (never wired into `npm run check`).
- `src/lib/sync.ts` is **read-only** for this feature: do not modify `collectState`, `mergeState`, `TripState`, or anything else in it.
- The sync payload is trip progress only: `reservations` pinned to `{}` (DECISIONS #19); the literal string `claude-key` must never appear in `src/lib/liveSync.ts` (#17/#11 — the suite greps for it).
- `@supabase/supabase-js` must never be statically imported — dynamic `import()` only, so the startup path stays supabase-free (suite enforces via bundle grep for `GoTrueClient`).
- New localStorage keys are exactly `tabi:live-sync` (`'on'` or absent) and `tabi:family` (family uuid, raw string). Neither may be added to `collectState()`/`collectLiveState()`.
- Supabase constants (public by design; RLS is the lock): URL `https://utvrwvxlkfbmlswcrxkc.supabase.co`, key `sb_publishable_HZzYgmIHjooWVZWtIieUdg_JrA_JUNW`.
- TypeScript strict — `npm run build` (tsc -b) must be green before every commit. No `any`.
- Copy voice: calm, painted, kid-plain ("The ink can't reach the sky right now — the link below still works."). No jargon in UI strings.
- Windows PowerShell 5.1 mangles embedded double quotes in `git commit -m` — use single-quoted messages or `git commit -F`.
- The suite currently passes **98/98**. Task 2 adds 4 checks (→102), Task 3 adds 4 (→106). Final state: **106/106**.

---

### Task 1: Backend — schema, RLS, RPCs on the real project

**Files:**
- Create: `supabase/migrations/20260712000000_family_ink.sql`

**Interfaces:**
- Consumes: nothing (first task).
- Produces (consumed by Task 2's engine): tables `families`, `family_members`, `family_state(family_id uuid pk, state jsonb, version int, updated_at timestamptz, updated_by uuid)`; RPCs `create_family() → {family_id, code}`, `new_join_code(fid uuid) → {code}`, `join_family(code_in text) → {ok, family_id?, state?}`; realtime enabled on `family_state` and `family_members`.

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260712000000_family_ink.sql` with exactly:

```sql
-- Live Family Ink — one shared row per family, membership-gated.
-- Spec: docs/superpowers/specs/2026-07-12-live-family-sync-design.md (DECISIONS #22)

create table families (
  id uuid primary key default gen_random_uuid(),
  join_code text unique,
  join_code_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table family_members (
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table family_state (
  family_id uuid primary key references families(id) on delete cascade,
  state jsonb not null default '{}',
  version int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table families enable row level security;
alter table family_members enable row level security;
alter table family_state enable row level security;

-- membership test as security definer: policies on family_members that query
-- family_members would recurse; a definer function reads past RLS safely.
create function is_family_member(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

create policy members_read on family_members for select
  using (is_family_member(family_id));
create policy state_read on family_state for select
  using (is_family_member(family_id));
create policy state_write on family_state for update
  using (is_family_member(family_id)) with check (is_family_member(family_id));
-- families: RLS on, zero policies — reachable only through the RPCs below.

-- FUJI-42 style pairing codes: a pairing gesture, not a password.
create function make_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  words text[] := array[
    'FUJI','NARA','KOI','ZEN','TORII','SAKURA','MOMIJI','ONSEN','KITSUNE','TANUKI',
    'SHIKA','DARUMA','KOKESHI','MATCHA','MOCHI','RAMEN','SUSHI','BENTO','KANJI','HAIKU',
    'TAIKO','KOTO','SUMI','WASHI','ORIGAMI','FUTON','TATAMI','SHOJI','YUKATA','GETA',
    'KABUKI','BONSAI','IKEBANA','SENSEI','GENKI','YAMA','KAWA','UMI','SORA','HOSHI',
    'TSUKI','YUKI','HANA','TORA','TSURU','KAME','NEKO','INU','USAGI','SUZUME',
    'MIKAN','YUZU','UME','KAKI','ICHIGO','TEMPURA','UDON','SOBA','DANGO','TAIYAKI',
    'ONIGIRI','WASABI','TANZAKU','TABI'
  ];
begin
  return words[1 + floor(random() * array_length(words, 1))::int]
      || '-' || lpad(floor(random() * 100)::int::text, 2, '0');
end $$;

create function create_family() returns json
language plpgsql security definer set search_path = public as $$
declare fid uuid; code text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  loop
    code := make_code();
    begin
      insert into families (join_code, join_code_expires_at)
        values (code, now() + interval '15 minutes')
        returning id into fid;
      exit;
    exception when unique_violation then
      -- code collision with another live family — roll again
    end;
  end loop;
  insert into family_members (family_id, user_id) values (fid, auth.uid());
  insert into family_state (family_id, updated_by) values (fid, auth.uid());
  return json_build_object('family_id', fid, 'code', code);
end $$;

create function new_join_code(fid uuid) returns json
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not is_family_member(fid) then raise exception 'not a member'; end if;
  loop
    code := make_code();
    begin
      update families
        set join_code = code, join_code_expires_at = now() + interval '15 minutes'
        where id = fid;
      exit;
    exception when unique_violation then
    end;
  end loop;
  return json_build_object('code', code);
end $$;

create function join_family(code_in text) returns json
language plpgsql security definer set search_path = public as $$
declare fam record;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into fam from families
    where join_code = upper(trim(code_in)) and join_code_expires_at > now();
  if not found then
    return json_build_object('ok', false);
  end if;
  insert into family_members (family_id, user_id) values (fam.id, auth.uid())
    on conflict do nothing;
  -- single-use: the code fades the moment it works
  update families set join_code = null, join_code_expires_at = null where id = fam.id;
  return json_build_object(
    'ok', true,
    'family_id', fam.id,
    'state', (select state from family_state where family_id = fam.id)
  );
end $$;

-- realtime: the state row (progress blooms) and memberships (phone count)
alter publication supabase_realtime add table family_state;
alter publication supabase_realtime add table family_members;
```

- [ ] **Step 2 (ORCHESTRATOR — needs the Supabase MCP): apply the migration**

Apply via the Supabase MCP `apply_migration` tool against project `utvrwvxlkfbmlswcrxkc`, name `family_ink`, query = the exact file contents above.

- [ ] **Step 3 (ORCHESTRATOR): verify the schema landed**

Via MCP: `list_tables` → expect `families`, `family_members`, `family_state` all with `rls_enabled: true`. Then `execute_sql`:

```sql
select routine_name from information_schema.routines
where routine_schema = 'public'
order by routine_name;
```

Expected to include: `create_family`, `is_family_member`, `join_family`, `make_code`, `new_join_code`.

- [ ] **Step 4 (ORCHESTRATOR): run the security advisors**

Via MCP: `get_advisors` type `security`. Expected: no ERROR-level findings about these tables/functions (definer functions all pin `search_path`; anonymous-auth lints are informational).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260712000000_family_ink.sql
git commit -m 'Backend: Family Ink schema - families, membership RLS, pairing-code RPCs (applied to tabi-family-sync)'
```

---

### Task 2: The engine — `src/lib/liveSync.ts` + suite tripwires

**Files:**
- Create: `src/lib/liveSync.ts`
- Modify: `package.json` (add dependency `@supabase/supabase-js`)
- Modify: `tests/story.mjs` (new section 17 — first 4 checks; `readdirSync` added to the fs import on line 13)

**Interfaces:**
- Consumes: `collectState()`, `mergeState(s: TripState)`, `type TripState` from `./sync` (Task 0 — already shipped); RPC names/shapes from Task 1.
- Produces (consumed by Tasks 3–4):
  - `interface InkStatus { kind: 'off'|'connecting'|'solo'|'synced'|'unreachable'; code?: string; codeExpiresAt?: number; phones?: number; lastSync?: number }`
  - `collectLiveState(): TripState` · `getInkStatus(): InkStatus` · `inkOn(): boolean` · `familyId(): string | null`
  - `maybeStartInk(): Promise<void>` · `startFamily(): Promise<boolean>` · `joinFamily(code: string): Promise<boolean>` · `freshCode(): Promise<void>` · `turnOnInk(): Promise<void>` · `turnOffInk(): void`
  - Window events: `'tabi:ink-status'` (status changed — re-read `getInkStatus()`), `'tabi:ink'` (a merge changed local state — re-read localStorage).

- [ ] **Step 1: Install the dependency**

```bash
npm install @supabase/supabase-js
```

Expected: `package.json` gains `"@supabase/supabase-js": "^2..."` under `dependencies`.

- [ ] **Step 2: Write the failing suite checks**

In `tests/story.mjs`: change line 13 from

```js
import { existsSync, mkdirSync, readFileSync } from 'fs'
```

to

```js
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs'
```

Then insert, immediately before the `const fails =` summary line (~552), the opening of section 17:

```js
/* ---- 17. Live family ink: the engine's guardrails (suite stays offline) ---- */
const inkSrc = existsSync('src/lib/liveSync.ts') ? readFileSync('src/lib/liveSync.ts', 'utf8') : ''
check('the ink carries progress only — reservations pinned empty', inkSrc.includes('reservations: {}'))
check('the AI key never touches the ink', inkSrc !== '' && !inkSrc.includes('claude-key'))

const inkHtml = readFileSync('dist/index.html', 'utf8')
const inkEntry = inkHtml.match(/assets\/(index-[\w-]+\.js)/)?.[1]
const inkEntrySrc = inkEntry ? readFileSync(`dist/assets/${inkEntry}`, 'utf8') : ''
check('supabase stays off the startup path', inkEntrySrc !== '' && !inkEntrySrc.includes('GoTrueClient'))
check(
  'the engine chunk exists and carries supabase',
  readdirSync('dist/assets')
    .filter((f) => f.endsWith('.js') && f !== inkEntry)
    .some((f) => readFileSync(`dist/assets/${f}`, 'utf8').includes('GoTrueClient')),
)
```

- [ ] **Step 3: Run to verify the new checks fail**

```bash
npm run build && npm run check
```

Expected: `FAIL — the ink carries progress only…`, `FAIL — the AI key never touches the ink` (inkSrc is `''`), `FAIL — the engine chunk exists and carries supabase`. (`supabase stays off the startup path` passes vacuously.) Total: 99 passed / 3 failed of 102.

- [ ] **Step 4: Write the engine**

Create `src/lib/liveSync.ts` with exactly:

```ts
/**
 * Live Family Ink — realtime trip-state sync on the owner's Supabase.
 * OFF by default; the folded link (sync.ts) is the permanent fallback.
 * The payload is trip progress ONLY: reservations are pinned {} and the
 * AI key never appears here (DECISIONS.md #22, upholding #19/#17/#11).
 * `?ink=` fixtures keep the story suite fully offline (the ?lens= precedent).
 * Design: docs/superpowers/specs/2026-07-12-live-family-sync-design.md
 */
import { collectState, mergeState, type TripState } from './sync'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

/* Public by design — the publishable key class; RLS is the lock (#17 precedent). */
export const SUPABASE_URL = 'https://utvrwvxlkfbmlswcrxkc.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_HZzYgmIHjooWVZWtIieUdg_JrA_JUNW'

const K_ON = 'tabi:live-sync'
const K_FAMILY = 'tabi:family'

export interface InkStatus {
  kind: 'off' | 'connecting' | 'solo' | 'synced' | 'unreachable'
  code?: string
  codeExpiresAt?: number
  phones?: number
  lastSync?: number
}

/** Trip progress only — the reservations pocket never leaves the phones (#19). */
export function collectLiveState(): TripState {
  return { ...collectState(), reservations: {} }
}

/* Canonical stringify: Postgres jsonb reorders object keys, so sorted-key
 * serialization is the only change detector that doesn't cry wolf forever. */
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(v)
}

/* ---- ?ink= fixtures: the suite's window into every card state, no network ---- */

const FIXTURES: Record<string, InkStatus> = {
  off: { kind: 'off' },
  solo: { kind: 'solo', code: 'FUJI-42', codeExpiresAt: Date.now() + 15 * 60_000 },
  synced: { kind: 'synced', phones: 2, lastSync: Date.now() },
  unreachable: { kind: 'unreachable' },
}

export function inkFixture(): InkStatus | null {
  const name = new URLSearchParams(location.search).get('ink')
  return name ? (FIXTURES[name] ?? null) : null
}

/* ---- status: one source of truth, announced by event ---- */

let status: InkStatus = { kind: 'off' }

function setStatus(s: InkStatus) {
  if (JSON.stringify(s) === JSON.stringify(status)) return
  status = s
  window.dispatchEvent(new Event('tabi:ink-status'))
}

export function getInkStatus(): InkStatus {
  return status
}

export function inkOn(): boolean {
  return localStorage.getItem(K_ON) === 'on'
}

export function familyId(): string | null {
  return localStorage.getItem(K_FAMILY)
}

/* ---- engine internals ---- */

let sb: SupabaseClient | null = null
let uid: string | null = null
let channel: RealtimeChannel | null = null
let timer: number | null = null
let lastAck = '' // canon() of the server's copy of the family state
let phones = 0
let lastSyncAt = 0
let activeCode: string | null = null
let activeCodeExp: number | null = null

async function client(): Promise<SupabaseClient> {
  if (sb) return sb
  const { createClient } = await import('@supabase/supabase-js')
  sb = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data } = await sb.auth.getSession()
  if (data.session) {
    uid = data.session.user.id
  } else {
    const { data: anon, error } = await sb.auth.signInAnonymously()
    if (error) throw error
    uid = anon.user?.id ?? null
  }
  return sb
}

/** Fold a server copy into this phone. Announces 'tabi:ink' only on real change. */
function applyIncoming(state: unknown) {
  const s = state as TripState
  if (!s || s.v !== 1 || typeof s.moments !== 'object') return // empty row / future schema — fold nothing
  const safe = { ...s, reservations: {} } // server rows never write the pocket
  const before = canon(collectLiveState())
  mergeState(safe)
  lastAck = canon(safe)
  if (canon(collectLiveState()) !== before) window.dispatchEvent(new Event('tabi:ink'))
}

function markSynced() {
  if (phones >= 2) setStatus({ kind: 'synced', phones, lastSync: lastSyncAt })
  else setStatus({ kind: 'solo', code: activeCode ?? undefined, codeExpiresAt: activeCodeExp ?? undefined })
}

async function refreshPhones() {
  const fid = familyId()
  if (!fid) return
  try {
    const c = await client()
    const { data } = await c.from('family_members').select('user_id').eq('family_id', fid)
    if (data) phones = data.length
  } catch {
    /* next tick will surface reachability */
  }
}

/** The single writer: read → fold theirs in → write mine, version-guarded. */
async function tick() {
  const fid = familyId()
  if (!fid || !inkOn()) return
  try {
    const c = await client()
    if (canon(collectLiveState()) === lastAck) return markSynced() // clean — zero network
    for (let i = 0; i < 3; i++) {
      const { data: row, error } = await c
        .from('family_state')
        .select('state, version')
        .eq('family_id', fid)
        .single()
      if (error) throw error
      applyIncoming(row.state)
      const state = collectLiveState()
      if (canon(state) === lastAck) return markSynced() // theirs covered mine
      const { data: upd, error: uerr } = await c
        .from('family_state')
        .update({ state, version: row.version + 1, updated_by: uid, updated_at: new Date().toISOString() })
        .eq('family_id', fid)
        .eq('version', row.version)
        .select('version')
      if (uerr) throw uerr
      if (upd && upd.length > 0) {
        lastAck = canon(state)
        lastSyncAt = Date.now()
        return markSynced()
      }
      // someone wrote between our read and write — loop folds them in, retries
    }
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

const onWake = () => void tick()
const onVis = () => {
  if (document.visibilityState === 'visible') {
    void refreshPhones().then(() => tick())
  } else {
    void tick() // flush before the phone pockets us
  }
}

async function start() {
  const fid = familyId()
  if (!fid) return setStatus({ kind: 'off' })
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    await refreshPhones()
    if (!channel) {
      channel = c
        .channel(`family:${fid}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'family_state', filter: `family_id=eq.${fid}` },
          (p) => {
            applyIncoming((p.new as { state: unknown }).state)
            lastSyncAt = Date.now()
            markSynced()
          },
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'family_members', filter: `family_id=eq.${fid}` },
          () => {
            activeCode = null // the code just got consumed — it's single-use
            activeCodeExp = null
            void refreshPhones().then(() => markSynced())
          },
        )
        .subscribe()
    }
    if (timer === null) {
      timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') void tick()
      }, 5000)
      window.addEventListener('online', onWake)
      document.addEventListener('visibilitychange', onVis)
    }
    await tick()
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

/* ---- the five public verbs ---- */

/** Boot (App calls once). Fixtures short-circuit everything — no network ever. */
export async function maybeStartInk(): Promise<void> {
  const fx = inkFixture()
  if (fx) return setStatus(fx)
  if (inkOn() && familyId()) await start()
}

/** First phone: create the family, show the code. */
export async function startFamily(): Promise<boolean> {
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    const { data, error } = await c.rpc('create_family')
    if (error) throw error
    const res = data as { family_id: string; code: string }
    localStorage.setItem(K_FAMILY, res.family_id)
    localStorage.setItem(K_ON, 'on')
    activeCode = res.code
    activeCodeExp = Date.now() + 15 * 60_000
    await start() // subscribes + first push fills the empty row
    return true
  } catch {
    setStatus({ kind: 'unreachable' })
    return false
  }
}

/** Any other phone: join with the typed code. False = code wrong/faded. */
export async function joinFamily(code: string): Promise<boolean> {
  setStatus({ kind: 'connecting' })
  try {
    const c = await client()
    const { data, error } = await c.rpc('join_family', { code_in: code })
    if (error) throw error
    const res = data as { ok: boolean; family_id?: string; state?: unknown }
    if (!res.ok || !res.family_id) {
      setStatus({ kind: 'off' })
      return false
    }
    localStorage.setItem(K_FAMILY, res.family_id)
    localStorage.setItem(K_ON, 'on')
    applyIncoming(res.state)
    await start() // folds + pushes this phone's own progress up
    return true
  } catch {
    setStatus({ kind: 'unreachable' })
    return false
  }
}

/** Mint a fresh code for the next phone (the old one may have faded). */
export async function freshCode(): Promise<void> {
  const fid = familyId()
  if (!fid) return
  try {
    const c = await client()
    const { data, error } = await c.rpc('new_join_code', { fid })
    if (error) throw error
    activeCode = (data as { code: string }).code
    activeCodeExp = Date.now() + 15 * 60_000
    markSynced()
  } catch {
    setStatus({ kind: 'unreachable' })
  }
}

/** Re-light a phone that turned itself off (family id remembered). */
export async function turnOnInk(): Promise<void> {
  localStorage.setItem(K_ON, 'on')
  await start()
}

/** Local flip only — the server row stays; turning back on rejoins silently. */
export function turnOffInk(): void {
  localStorage.removeItem(K_ON)
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
  window.removeEventListener('online', onWake)
  document.removeEventListener('visibilitychange', onVis)
  if (channel && sb) void sb.removeChannel(channel)
  channel = null
  activeCode = null
  activeCodeExp = null
  setStatus({ kind: 'off' })
}
```

- [ ] **Step 5: Build and run the suite**

```bash
npm run build && npm run check
```

Expected: **102 passed / 0 failed.** (`tsc -b` green proves the type-only supabase import erases; the chunk checks prove the lazy split.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/liveSync.ts package.json package-lock.json tests/story.mjs
git commit -m 'Engine: Live Family Ink - lazy supabase client, code pairing, 5s fold-and-push loop, realtime bloom (suite 102)'
```

---

### Task 3: The Kit card — Family ink · 家族の墨

**Files:**
- Modify: `src/screens/Kit.tsx` (new `FamilyInk` component; render `<FamilyInk />` immediately before `<FamilySync />` in `Kit()`)
- Modify: `src/styles/screens.css` (append the `.ink-*` block)
- Modify: `tests/story.mjs` (section 17 grows 4 UI checks)

**Interfaces:**
- Consumes (from Task 2): `getInkStatus`, `familyId`, `startFamily`, `joinFamily`, `freshCode`, `turnOnInk`, `turnOffInk`, `type InkStatus`, event `'tabi:ink-status'`.
- Produces: DOM contract for the suite + E2E — `[data-testid="family-ink"]` section, `.ink-code` (the big code), `.ink-status` (the status line), buttons with visible text `Turn on live sync`, `Start our family`, `Join a family`, `Join`, input `placeholder="FUJI-42"`.

- [ ] **Step 1: Write the failing suite checks**

In `tests/story.mjs`, extend section 17 (after the four Task-2 checks, still before `const fails =`):

```js
const ikCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const ikPage = await ikCtx.newPage()
await ikPage.goto(`${BASE}/?ink=solo#kit`)
await ikPage.waitForTimeout(600)
check('family ink card is on the kit shelf', await ikPage.isVisible('[data-testid="family-ink"]'))
check('solo shows the join code big', ((await ikPage.textContent('.ink-code')) ?? '').includes('FUJI-42'))
await ikPage.goto(`${BASE}/?ink=synced#kit`)
await ikPage.waitForTimeout(500)
check('synced counts the phones', ((await ikPage.textContent('.ink-status')) ?? '').includes('2 phones'))
await ikPage.goto(`${BASE}/#kit`)
await ikPage.waitForTimeout(500)
check('ink ships dark — off by default', ((await ikPage.textContent('[data-testid="family-ink"]')) ?? '').includes('Turn on live sync'))
await shot(ikPage, 'family-ink')
await ikCtx.close()
```

- [ ] **Step 2: Run to verify they fail**

```bash
npm run build && npm run check
```

Expected: the 4 new checks FAIL (no card yet). 102 passed / 4 failed of 106.

- [ ] **Step 3: Build the card**

In `src/screens/Kit.tsx` — add to the imports:

```tsx
import { useEffect, useState } from 'react'
import {
  freshCode, familyId, getInkStatus, joinFamily, startFamily, turnOffInk, turnOnInk,
} from '../lib/liveSync'
```

(The file already imports `useState` from `'react'` on line 1 — replace that line with the `useEffect, useState` form.)

In `Kit()`, render the new section right above the share-link card:

```tsx
      <FamilyInk />
      <FamilySync />
```

Add the component (place it directly above the `FamilySync` function, matching the file's `/* ---------- */` section-comment style):

```tsx
/* ---------- live family ink ---------- */

function FamilyInk() {
  const [ink, setInk] = useState(getInkStatus())
  const [joining, setJoining] = useState(false)
  const [codeDraft, setCodeDraft] = useState('')
  const [codeFail, setCodeFail] = useState(false)
  const [, breathe] = useState(0) // re-render so the countdown stays honest

  useEffect(() => {
    const onStatus = () => setInk({ ...getInkStatus() })
    window.addEventListener('tabi:ink-status', onStatus)
    const t = window.setInterval(() => breathe((n) => n + 1), 30_000)
    return () => {
      window.removeEventListener('tabi:ink-status', onStatus)
      window.clearInterval(t)
    }
  }, [])

  const join = async () => {
    setCodeFail(false)
    const ok = await joinFamily(codeDraft.trim())
    if (ok) {
      setJoining(false)
      setCodeDraft('')
    } else if (getInkStatus().kind !== 'unreachable') {
      setCodeFail(true)
    }
  }

  const minsLeft =
    ink.codeExpiresAt != null ? Math.max(0, Math.round((ink.codeExpiresAt - Date.now()) / 60_000)) : null

  return (
    <section className="kit-section" data-testid="family-ink">
      <div className="section-title">
        <h2>Family ink</h2>
        <span className="jp">家族の墨</span>
      </div>
      <div className="card sync-card">
        {ink.kind === 'off' && (
          <>
            <p className="pocket-hint" style={{ marginTop: 0 }}>
              Flip this on and the phones keep each other's ink fresh by themselves, whenever
              they find the sky. Off, the share link below still does everything by hand.
            </p>
            {familyId() ? (
              <button className="show-card-btn pressable" onClick={() => void turnOnInk()}>
                Turn on live sync
              </button>
            ) : joining ? (
              <>
                <div className="pocket-add" style={{ marginTop: 4 }}>
                  <input
                    placeholder="FUJI-42"
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={codeDraft}
                    onChange={(e) => setCodeDraft(e.target.value.toUpperCase())}
                  />
                  <button className="key-save" disabled={!codeDraft.trim()} onClick={() => void join()}>
                    Join
                  </button>
                </div>
                {codeFail && <p className="pocket-hint ink-fail">That code has faded — ask for a fresh one.</p>}
              </>
            ) : (
              <>
                <button className="show-card-btn pressable" onClick={() => void startFamily()}>
                  Turn on live sync — start our family
                </button>
                <button className="show-card-btn pressable ink-quiet" onClick={() => setJoining(true)}>
                  Join a family
                </button>
              </>
            )}
          </>
        )}

        {ink.kind === 'connecting' && <p className="ink-status">Lifting the brush…</p>}

        {ink.kind === 'solo' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              Solo — waiting for family
            </p>
            {ink.code ? (
              <>
                <div className="ink-code">{ink.code}</div>
                <p className="pocket-hint">
                  On the other phone: Kit → Family ink → Join a family, and type this code.
                  {minsLeft != null && ` It fades in about ${minsLeft} min.`}
                </p>
              </>
            ) : (
              <p className="pocket-hint">The last code faded — mint a fresh one below.</p>
            )}
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void freshCode()}>
                New code
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
          </>
        )}

        {ink.kind === 'synced' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              Synced — {ink.phones} phones
              {ink.lastSync ? ` · ${new Date(ink.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
            <p className="pocket-hint">
              Check-offs, loved moments, packing, and treasures now flow between the phones on
              their own. Reservations stay in each phone's pocket, as always.
            </p>
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void freshCode()}>
                Invite another phone
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
            {ink.code && (
              <>
                <div className="ink-code">{ink.code}</div>
                <p className="pocket-hint">
                  Type this on the new phone{minsLeft != null && ` — it fades in about ${minsLeft} min`}.
                </p>
              </>
            )}
          </>
        )}

        {ink.kind === 'unreachable' && (
          <>
            <p className="ink-status" style={{ marginTop: 0 }}>
              The ink can't reach the sky right now — the link below still works.
            </p>
            <div className="quick-refs">
              <button className="chip chip-indigo" onClick={() => void turnOnInk()}>
                Try again
              </button>
              <button className="chip" onClick={turnOffInk}>
                Turn off
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
```

Append to `src/styles/screens.css`:

```css
/* ---------- live family ink (Kit) ---------- */
.ink-code {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-align: center;
  padding: 14px 0 10px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.ink-status {
  font-weight: 600;
  font-size: 15px;
}
.ink-fail {
  color: var(--vermillion, #c73e3a);
}
.ink-quiet {
  opacity: 0.75;
  margin-top: 8px;
}
```

(If `--vermillion` doesn't exist in `global.css`, the `#c73e3a` fallback carries it — don't add a token for one line.)

- [ ] **Step 4: Run the suite**

```bash
npm run build && npm run check
```

Expected: **106 passed / 0 failed.**

- [ ] **Step 5: Look at the real render (PROCESS.md field note 1)**

```bash
SHOT_DIR=docs/screens npm run check
```

Open `docs/screens/family-ink.png` — the solo card at iPhone width: code legible at arm's length, nothing clipped by the tabbar, calm in both the day palette and (spot-check `?clock=00:30`) night.

- [ ] **Step 6: Commit**

```bash
git add src/screens/Kit.tsx src/styles/screens.css tests/story.mjs docs/screens/family-ink.png
git commit -m 'Kit: the Family ink card - start/join by code, solo/synced/unreachable faces (suite 106)'
```

---

### Task 4: Boot + bloom — App wiring

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes (from Task 2): `maybeStartInk()`, event `'tabi:ink'`.
- Produces: on any remote merge that changes local state, every mounted screen re-reads localStorage (keyed remount — one line, all screens, forever).

- [ ] **Step 1: Wire the boot and the bloom**

In `src/App.tsx`: change line 1 and add the engine import:

```tsx
import { Fragment, useEffect, useState } from 'react'
import { maybeStartInk } from './lib/liveSync'
```

Inside `App()` (after the existing `useSolarClock()` line), add:

```tsx
  // live family ink: boot once; when a remote merge lands, remount the screen
  // so every component re-reads localStorage (rare event, additive data)
  const [inkGen, setInkGen] = useState(0)
  useEffect(() => {
    void maybeStartInk()
    const bloom = () => setInkGen((g) => g + 1)
    window.addEventListener('tabi:ink', bloom)
    return () => window.removeEventListener('tabi:ink', bloom)
  }, [])
```

Wrap the five screen conditionals (NOT `InkFilters`, NOT the tabbar) in a keyed fragment:

```tsx
      <InkFilters />
      <Fragment key={inkGen}>
        {tab === 'journey' && <Journey route={route} nav={nav} />}
        {tab === 'discover' && <Discover />}
        {tab === 'treasures' && <Treasures nav={nav} />}
        {tab === 'speak' && <Phrases />}
        {tab === 'kit' && <Kit />}
      </Fragment>
```

- [ ] **Step 2: Full verify**

```bash
npm run build && npm run check
```

Expected: **106 passed / 0 failed** (the `'tabi:ink'` event never fires under fixtures, so nothing existing moves).

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m 'App: boot the ink engine; remote merges remount the screen so progress blooms live'
```

---

### Task 5: Docs — README, ledger, session notes

**Files:**
- Modify: `README.md` (feature list + Current state)
- Modify: `ROADMAP.md` (Part IV ledger row)
- Modify: `SESSION_NOTES.md` (new top entry)

- [ ] **Step 1: README**

In the feature list, next to the existing Family Sync bullet, add (match the surrounding bullet voice):

```markdown
- **Live Family Ink** — flip it on in Kit and the phones keep each other fresh by
  themselves whenever they're online (Supabase realtime, Tokyo). Progress only —
  reservations never leave the phones. The share link below it remains the
  no-server fallback, forever.
```

Update the Current state section to name v4.0.0-pending: live sync built dark (OFF by default), awaiting the owner's dashboard toggle + flip-on.

- [ ] **Step 2: ROADMAP Part IV ledger**

Add a row to the Part IV table, matching its exact column format (read the table header first):
`v4.0.0 · Family Ink (live sync) · built on claude/live-family-sync, pending owner merge — realtime rows on Supabase, folded link stays as floor`.

- [ ] **Step 3: SESSION_NOTES**

New entry at the top, dated 2026-07-12, in the file's established voice: what shipped (backend migration applied to `tabi-family-sync`, engine, Kit card, App bloom, suite 98→106), what's owner-side (enable Anonymous sign-ins → merge → flip on both phones), pointer to spec + plan + DECISIONS #22.

- [ ] **Step 4: Verify + commit**

```bash
npm run build && npm run check
git add README.md ROADMAP.md SESSION_NOTES.md
git commit -m 'Docs: Family Ink - README, ledger row, session notes (v4.0.0 pending merge)'
```

---

### Task 6: Live E2E — two phones against the real sky

**Files:**
- Create: `tests/live-ink.mjs`
- Modify: `package.json` (script `"check:live": "node tests/live-ink.mjs"`)

**Interfaces:**
- Consumes: the deployed DOM contract from Task 3 (`.ink-code`, `.ink-status`, button texts, `placeholder="FUJI-42"`); the real Supabase project from Task 1.
- Produces: proof. This script is run manually (`npm run check:live`) — never wired into `npm run check`.

- [ ] **Step 1 (OWNER GATE — orchestrator asks the user):** enable Anonymous sign-ins

Supabase dashboard → project `tabi-family-sync` → **Authentication → Sign In / Providers → Anonymous sign-ins → ON → Save**. The script probes this first and stops with a plain message if it's still off.

- [ ] **Step 2: Write the script**

Create `tests/live-ink.mjs`:

```js
/**
 * Live Family Ink — real-network E2E against the real Supabase project.
 * NOT part of `npm run check` (the story suite stays offline — DECISIONS #3).
 * Run:  npm run build && npm run check:live
 * Gate: Anonymous sign-ins enabled in the Supabase dashboard.
 * Prints the created family id — the orchestrator deletes it afterwards.
 */
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { existsSync } from 'fs'

const PORT = 4176
const BASE = `http://localhost:${PORT}`
const URL = 'https://utvrwvxlkfbmlswcrxkc.supabase.co'
const KEY = 'sb_publishable_HZzYgmIHjooWVZWtIieUdg_JrA_JUNW'

/* 0. the dashboard gate, with a plain face */
const probe = await fetch(`${URL}/auth/v1/signup`, {
  method: 'POST',
  headers: { apikey: KEY, 'content-type': 'application/json' },
  body: '{}',
})
if (!probe.ok) {
  const body = await probe.json().catch(() => ({}))
  if (body.error_code === 'anonymous_provider_disabled' || /anonymous/i.test(body.msg ?? '')) {
    console.error('GATE: Anonymous sign-ins are still OFF.')
    console.error('Supabase dashboard -> Authentication -> Sign In / Providers -> Anonymous sign-ins -> ON. Then rerun.')
    process.exit(1)
  }
}

const results = []
const check = (name, ok) => {
  results.push(`${ok ? 'PASS' : 'FAIL'} — ${name}`)
  console.log(`${ok ? '✅' : '❌'} ${name}`)
}
const settled = (p) => p.then(() => true, () => false)
/* Probe field: moments — notes/travelers/departure/rate are pinned out of the
 * live payload (non-converging merges; see the spec's SyncPayload paragraph). */
const addMoment = (pg, id, val) =>
  pg.evaluate(([k, v]) => {
    const m = JSON.parse(localStorage.getItem('tabi:moments') ?? '{}')
    m[k] = v
    localStorage.setItem('tabi:moments', JSON.stringify(m))
  }, [id, val])

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore' },
)
await new Promise((r) => setTimeout(r, 1500))

const SYSTEM_CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(SYSTEM_CHROMIUM) ? { executablePath: SYSTEM_CHROMIUM } : {})
const mk = () =>
  browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

let fid = null
try {
  /* Phone A: seeded notes, starts the family */
  const ctxA = await mk()
  const A = await ctxA.newPage()
  await A.addInitScript(() => {
    if (!localStorage.getItem('tabi:moments'))
      localStorage.setItem('tabi:moments', JSON.stringify({ 'e2e-alpha': 'done' }))
  })
  await A.goto(`${BASE}/#kit`)
  await A.waitForTimeout(800)
  await A.click('text=Turn on live sync — start our family')
  const gotCode = await settled(A.waitForSelector('.ink-code', { timeout: 20000 }))
  check('A starts a family and a code appears', gotCode)
  const code = gotCode ? ((await A.textContent('.ink-code')) ?? '').trim() : ''
  check('the code looks like FUJI-42', /^[A-Z]+-\d\d$/.test(code))
  fid = await A.evaluate(() => localStorage.getItem('tabi:family'))
  console.log(`   family (for cleanup): ${fid}`)

  /* Phone B: joins by code, receives A's notes */
  const ctxB = await mk()
  const B = await ctxB.newPage()
  await B.goto(`${BASE}/#kit`)
  await B.waitForTimeout(800)
  await B.click('text=Join a family')
  await B.fill('input[placeholder="FUJI-42"]', code)
  await B.click('text=Join')
  check(
    "B joins and A's moments arrive",
    await settled(
      B.waitForFunction(() => (localStorage.getItem('tabi:moments') ?? '').includes('e2e-alpha'), null, {
        timeout: 20000,
      }),
    ),
  )
  check(
    'A sees two phones',
    await settled(
      A.waitForFunction(() => document.querySelector('.ink-status')?.textContent?.includes('2 phones'), null, {
        timeout: 20000,
      }),
    ),
  )

  /* realtime: B writes, A blooms without touching anything */
  await addMoment(B, 'e2e-beta', 'loved')
  check(
    "A blooms with B's loved moment (realtime)",
    await settled(
      A.waitForFunction(() => (localStorage.getItem('tabi:moments') ?? '').includes('e2e-beta'), null, {
        timeout: 25000,
      }),
    ),
  )

  /* the tunnel: B goes dark, both write, B resurfaces, both converge */
  await ctxB.setOffline(true)
  await addMoment(B, 'e2e-tunnel', 'done')
  await addMoment(A, 'e2e-meanwhile', 'loved')
  await A.waitForTimeout(8000) // A pushes while B is dark
  await ctxB.setOffline(false)
  const converged = (pg) =>
    pg.waitForFunction(
      () => {
        const m = localStorage.getItem('tabi:moments') ?? ''
        return m.includes('e2e-tunnel') && m.includes('e2e-meanwhile')
      },
      null,
      { timeout: 30000 },
    )
  check('the tunnel heals — both phones converge', (await settled(converged(A))) && (await settled(converged(B))))

  /* the line that must never travel: reservations stay off the server */
  await A.evaluate(() =>
    localStorage.setItem('tabi:reservations', JSON.stringify({ d1: [{ id: 'x', label: 'hotel', code: 'PNR-SECRET' }] })),
  )
  await A.waitForTimeout(8000) // a push cycle passes
  check(
    'reservations never reach the other phone',
    await B.evaluate(() => !(localStorage.getItem('tabi:reservations') ?? '').includes('PNR-SECRET')),
  )
} finally {
  await browser.close()
  server.kill()
}

const fails = results.filter((r) => r.startsWith('FAIL')).length
console.log(`\n${results.length - fails}/${results.length} live checks passed`)
if (fid) console.log(`cleanup: delete from families where id = '${fid}';`)
process.exit(fails ? 1 : 0)
```

Add to `package.json` scripts: `"check:live": "node tests/live-ink.mjs"`.

- [ ] **Step 3: Run it**

```bash
npm run build && npm run check:live
```

Expected: **7/7 live checks passed** and a `cleanup:` line. Realtime legs may take a few seconds each — that's the 5-second loop breathing, not a hang.

- [ ] **Step 4 (ORCHESTRATOR): clean up the test family**

Via MCP `execute_sql`: the printed `delete from families where id = '…';` (cascades through members + state). Verify: `select count(*) from families;` → `0`.

- [ ] **Step 5: Commit**

```bash
git add tests/live-ink.mjs package.json
git commit -m 'E2E: live-ink script - pair, bloom, tunnel-heal, PNR-line proof against the real project (manual, never in npm run check)'
```

---

## Ship (owner-side, after all tasks green)

1. Push the branch; owner reviews + merges the PR (never merge yourself).
2. Pages deploys; phones pick it up on next Wi-Fi SW refresh.
3. Owner enables **Anonymous sign-ins** (if not already done for Task 6).
4. Owner flips Kit → Family ink on phone 1 (**Start our family**), phone 2 joins by code.
5. Tag **v4.0.0** + GitHub Release with dist zip (owner's go required — tag push is permission-gated).
