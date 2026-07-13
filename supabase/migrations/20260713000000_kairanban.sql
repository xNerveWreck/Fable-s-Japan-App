-- 回覧板 Kairanban — the family journal feed: each phone's day-entry published
-- to the family, writable ONLY by the phone that owns it; hearts owned by the
-- reactor. Plus the join-attempt throttle from the 2026-07-13 security sweep.
-- Spec: docs/superpowers/specs/2026-07-13-kairanban-family-feed-design.md

create table journal_posts (
  family_id uuid not null references families(id) on delete cascade,
  device_uid uuid not null,
  day_id int not null,
  author_id text,
  body text not null default '',
  photos jsonb not null default '[]',
  extra_photos int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (family_id, device_uid, day_id)
);

create table journal_hearts (
  family_id uuid not null references families(id) on delete cascade,
  post_device uuid not null,
  post_day int not null,
  device_uid uuid not null,
  traveler_id text,
  created_at timestamptz not null default now(),
  primary key (family_id, post_device, post_day, device_uid)
);

alter table journal_posts enable row level security;
alter table journal_hearts enable row level security;

-- everyone in the family reads every page…
create policy posts_read on journal_posts for select
  using (is_family_member(family_id));
create policy hearts_read on journal_hearts for select
  using (is_family_member(family_id));

-- …but a page is writable only by the phone that owns it (no delete policy at
-- all: pages of the trip diary are keepsakes — the author can publish it empty)
create policy posts_insert on journal_posts for insert
  with check (is_family_member(family_id) and device_uid = auth.uid());
create policy posts_update on journal_posts for update
  using (is_family_member(family_id) and device_uid = auth.uid())
  with check (device_uid = auth.uid());

-- a heart belongs to the reactor: place it, take it back, never someone else's
create policy hearts_insert on journal_hearts for insert
  with check (is_family_member(family_id) and device_uid = auth.uid());
create policy hearts_delete on journal_hearts for delete
  using (device_uid = auth.uid());

-- realtime doorbells (clients refetch on any event — payloads are ignored,
-- so photo-heavy rows never hit broadcast size limits)
alter publication supabase_realtime add table journal_posts;
alter publication supabase_realtime add table journal_hearts;

-- ---- security sweep finding #1 (2026-07-13): throttle join_family ----
-- The 6,400-code pairing space was unthrottled; with kid photos now on the
-- server, brute-forcing a live 15-minute window must not be free.

create table join_attempts (
  uid uuid primary key,
  window_start timestamptz not null default now(),
  tries int not null default 0
);
alter table join_attempts enable row level security;
-- zero policies: reachable only inside the definer functions.

create or replace function join_family(code_in text) returns json
language plpgsql security definer set search_path = public as $$
declare fam record; att record;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;

  -- at most 10 tries per rolling hour per anonymous identity
  select * into att from join_attempts where uid = auth.uid();
  if found and att.window_start > now() - interval '1 hour' then
    if att.tries >= 10 then
      return json_build_object('ok', false, 'throttled', true);
    end if;
    update join_attempts set tries = tries + 1 where uid = auth.uid();
  else
    insert into join_attempts (uid, window_start, tries) values (auth.uid(), now(), 1)
      on conflict (uid) do update set window_start = now(), tries = 1;
  end if;

  select * into fam from families
    where join_code = upper(trim(code_in)) and join_code_expires_at > now();
  if not found then
    return json_build_object('ok', false);
  end if;
  insert into family_members (family_id, user_id) values (fam.id, auth.uid())
    on conflict do nothing;
  -- single-use: the code fades the moment it works
  update families set join_code = null, join_code_expires_at = null where id = fam.id;
  -- a successful pairing clears the slate
  delete from join_attempts where uid = auth.uid();
  return json_build_object(
    'ok', true,
    'family_id', fam.id,
    'state', (select state from family_state where family_id = fam.id)
  );
end $$;

-- lock the callable surface to exactly the intended verbs.
-- (functions default EXECUTE to PUBLIC — revoke there too, or anon inherits it
-- right back; and is_family_member needs an explicit grant because RLS policy
-- expressions run it as the QUERYING role, definer or not)
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function is_family_member(uuid) to anon, authenticated;
grant execute on function create_family() to anon, authenticated;
grant execute on function new_join_code(uuid) to anon, authenticated;
grant execute on function join_family(text) to anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
