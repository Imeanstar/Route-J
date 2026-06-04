-- 루트제이 초기 스키마 (재실행 안전: enum/테이블/정책 중복 시 스킵)

create extension if not exists "uuid-ossp";

-- ENUM (PostgreSQL은 CREATE TYPE IF NOT EXISTS 미지원 → DO 블록)
do $$ begin
  create type public.couple_status as enum ('pending', 'active');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.route_visibility as enum ('public', 'couple_only', 'deleted');
exception when duplicate_object then null;
end $$;

-- 프로필
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 커플 (1:1)
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code char(6) not null unique,
  user1_id uuid not null references public.profiles (id) on delete cascade,
  user2_id uuid references public.profiles (id) on delete set null,
  status public.couple_status not null default 'pending',
  created_at timestamptz not null default now(),
  connected_at timestamptz,
  constraint couples_different_users check (user1_id is distinct from user2_id)
);

create unique index if not exists couples_user1_active on public.couples (user1_id) where status = 'active';
create unique index if not exists couples_user2_active on public.couples (user2_id) where status = 'active' and user2_id is not null;

-- 지역 · 역 · 테마 (프리셋)
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0
);

create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions (id) on delete cascade,
  name text not null,
  line_name text,
  sort_order int not null default 0,
  unique (region_id, name)
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);

-- 루트
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  title text not null,
  description text not null default '',
  region_id uuid references public.regions (id),
  station_id uuid references public.stations (id),
  visibility public.route_visibility not null default 'public',
  view_count int not null default 0 check (view_count >= 0),
  like_count int not null default 0 check (like_count >= 0),
  popularity_score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.route_themes (
  route_id uuid not null references public.routes (id) on delete cascade,
  theme_id uuid not null references public.themes (id) on delete cascade,
  primary key (route_id, theme_id)
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  sort_order int not null check (sort_order >= 0),
  place_name text not null,
  address text,
  lat double precision,
  lng double precision,
  photo_path text,
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  created_at timestamptz not null default now(),
  unique (route_id, sort_order)
);

create table if not exists public.route_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  route_id uuid not null references public.routes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, route_id)
);

create table if not exists public.route_bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  route_id uuid not null references public.routes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, route_id)
);

create table if not exists public.route_reports (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (route_id, reporter_id)
);

-- 인기 점수 갱신 (좋아요 5 : 조회 1)
create or replace function public.recalc_route_popularity(p_route_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_likes int;
  v_views int;
begin
  select like_count, view_count into v_likes, v_views from routes where id = p_route_id;
  update routes
  set popularity_score = (coalesce(v_likes, 0) * 5) + coalesce(v_views, 0),
      updated_at = now()
  where id = p_route_id;
end;
$$;

create or replace function public.on_route_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update routes set like_count = like_count + 1 where id = new.route_id;
    perform public.recalc_route_popularity(new.route_id);
  elsif tg_op = 'DELETE' then
    update routes set like_count = greatest(like_count - 1, 0) where id = old.route_id;
    perform public.recalc_route_popularity(old.route_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists route_likes_after_change on public.route_likes;
create trigger route_likes_after_change
after insert or delete on public.route_likes
for each row execute function public.on_route_like_change();

create or replace function public.increment_route_view(p_route_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update routes
  set view_count = view_count + 1,
      popularity_score = (like_count * 5) + (view_count + 1)
  where id = p_route_id and visibility = 'public' and deleted_at is null;
end;
$$;

-- 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 6자리 코드 생성
create or replace function public.generate_invite_code()
returns char(6)
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result::char(6);
end;
$$;

create or replace function public.create_couple_invite()
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing public.couples;
  new_row public.couples;
  code char(6);
  attempts int := 0;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  select * into existing from couples
  where status = 'active' and (user1_id = uid or user2_id = uid)
  limit 1;
  if found then raise exception 'Already in an active couple'; end if;

  select * into existing from couples
  where status = 'pending' and user1_id = uid
  limit 1;
  if found then return existing; end if;

  loop
    code := public.generate_invite_code();
    begin
      insert into couples (invite_code, user1_id, status)
      values (code, uid, 'pending')
      returning * into new_row;
      return new_row;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 20 then raise exception 'Could not generate code'; end if;
    end;
  end loop;
end;
$$;

create or replace function public.join_couple_with_code(p_code text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.couples;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  if exists (
    select 1 from couples where status = 'active' and (user1_id = uid or user2_id = uid)
  ) then
    raise exception 'Already in an active couple';
  end if;

  select * into row from couples
  where invite_code = upper(trim(p_code)) and status = 'pending'
  for update;

  if not found then raise exception 'Invalid or expired code'; end if;
  if row.user1_id = uid then raise exception 'Cannot join your own invite'; end if;

  update couples
  set user2_id = uid, status = 'active', connected_at = now()
  where id = row.id
  returning * into row;

  return row;
end;
$$;

create or replace function public.get_my_couple()
returns public.couples
language sql
security definer
stable
set search_path = public
as $$
  select c.* from couples c
  where c.status = 'active'
    and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  limit 1;
$$;

create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from couples c
    where c.id = p_couple_id and c.status = 'active'
      and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.regions enable row level security;
alter table public.stations enable row level security;
alter table public.themes enable row level security;
alter table public.routes enable row level security;
alter table public.route_themes enable row level security;
alter table public.route_stops enable row level security;
alter table public.route_likes enable row level security;
alter table public.route_bookmarks enable row level security;
alter table public.route_reports enable row level security;

drop policy if exists "profiles read all" on public.profiles;
create policy "profiles read all" on public.profiles for select using (true);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "regions read" on public.regions;
create policy "regions read" on public.regions for select using (true);
drop policy if exists "stations read" on public.stations;
create policy "stations read" on public.stations for select using (true);
drop policy if exists "themes read" on public.themes;
create policy "themes read" on public.themes for select using (true);

drop policy if exists "couples read own" on public.couples;
create policy "couples read own" on public.couples for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

drop policy if exists "routes read public" on public.routes;
create policy "routes read public" on public.routes for select
  using (
    visibility = 'public'
    and deleted_at is null
  );

drop policy if exists "routes read couple only" on public.routes;
create policy "routes read couple only" on public.routes for select
  using (
    visibility = 'couple_only'
    and deleted_at is null
    and public.is_couple_member(couple_id)
  );

drop policy if exists "routes insert couple" on public.routes;
create policy "routes insert couple" on public.routes for insert
  with check (
    public.is_couple_member(couple_id)
    and created_by = auth.uid()
  );

drop policy if exists "routes update couple members" on public.routes;
create policy "routes update couple members" on public.routes for update
  using (public.is_couple_member(couple_id) and visibility <> 'deleted')
  with check (public.is_couple_member(couple_id));

drop policy if exists "route_themes all couple routes" on public.route_themes;
create policy "route_themes all couple routes" on public.route_themes for all
  using (
    exists (
      select 1 from routes r
      where r.id = route_id and public.is_couple_member(r.couple_id)
    )
  );

drop policy if exists "route_stops all couple routes" on public.route_stops;
create policy "route_stops all couple routes" on public.route_stops for all
  using (
    exists (
      select 1 from routes r
      where r.id = route_id and public.is_couple_member(r.couple_id)
    )
  );

drop policy if exists "likes auth" on public.route_likes;
create policy "likes auth" on public.route_likes for all using (auth.uid() = user_id);
drop policy if exists "bookmarks auth" on public.route_bookmarks;
create policy "bookmarks auth" on public.route_bookmarks for all using (auth.uid() = user_id);
drop policy if exists "reports insert auth" on public.route_reports;
create policy "reports insert auth" on public.route_reports for insert with check (auth.uid() = reporter_id);

-- Storage bucket (photos) — Supabase 대시보드에서 'route-photos' 버킷 생성 후 실행
-- insert storage policies separately in dashboard
