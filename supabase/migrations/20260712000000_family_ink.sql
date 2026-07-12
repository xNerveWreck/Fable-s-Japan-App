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
