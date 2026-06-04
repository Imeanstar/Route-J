-- RouteJ Plus · 제휴 (Phase 2)

create type public.subscription_plan as enum ('plus_monthly', 'plus_yearly');
create type public.subscription_status as enum ('active', 'canceled', 'expired', 'trialing');

create table public.couple_subscriptions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  plan public.subscription_plan not null default 'plus_monthly',
  status public.subscription_status not null default 'active',
  provider text not null default 'manual',
  external_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id)
);

create table public.partner_venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region_name text not null default '서울 성수·건대',
  category text not null default 'cafe',
  address text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.partner_benefits (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.partner_venues (id) on delete cascade,
  title text not null,
  description text not null default '',
  coupon_code text,
  plus_only boolean not null default true,
  discount_label text not null default '10% 할인',
  valid_until date,
  created_at timestamptz not null default now()
);

create table public.benefit_redemptions (
  id uuid primary key default gen_random_uuid(),
  benefit_id uuid not null references public.partner_benefits (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (benefit_id, user_id)
);

alter table public.couple_subscriptions enable row level security;
alter table public.partner_venues enable row level security;
alter table public.partner_benefits enable row level security;
alter table public.benefit_redemptions enable row level security;

create or replace function public.couple_has_plus(p_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.couple_subscriptions s
    where s.couple_id = p_couple_id
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

create or replace function public.get_my_plus_status()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
begin
  select c.id into v_couple_id
  from public.couples c
  where c.status = 'active'
    and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  limit 1;
  if v_couple_id is null then
    return false;
  end if;
  return public.couple_has_plus(v_couple_id);
end;
$$;

grant execute on function public.get_my_plus_status() to authenticated;
grant execute on function public.couple_has_plus(uuid) to authenticated;

-- RLS
create policy "couple_subscriptions_select_own"
  on public.couple_subscriptions for select
  to authenticated
  using (
    couple_id in (
      select id from public.couples
      where status = 'active' and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

create policy "partner_venues_select_all"
  on public.partner_venues for select
  using (is_active = true);

create policy "partner_benefits_select_all"
  on public.partner_benefits for select
  using (true);

create policy "redemptions_insert_own"
  on public.benefit_redemptions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "redemptions_select_own"
  on public.benefit_redemptions for select
  to authenticated
  using (user_id = auth.uid());

-- 파일럿 제휴 시드
insert into public.partner_venues (name, region_name, category, address, sort_order) values
  ('오브제 카페 성수', '서울 성수·건대', 'cafe', '서울 성동구 성수동', 1),
  ('연남 브런치 하우스', '서울 홍대·마포', 'food', '서울 마포구 연남동', 2),
  ('한남 뷰 레스토랑', '서울 강남권', 'food', '서울 용산구 한남동', 3),
  ('성수 팝업 갤러리 카페', '서울 성수·건대', 'culture', '서울 성동구 성수동', 4),
  ('망원 한강 피크닉 키트샵', '서울 홍대·마포', 'cafe', '서울 마포구 망원동', 5)
on conflict do nothing;

insert into public.partner_benefits (venue_id, title, description, coupon_code, discount_label)
select v.id, v.name || ' Plus 혜택', 'RouteJ Plus 구독 커플 전용', 'ROUTEJ10', '주중 10% 할인'
from public.partner_venues v
where not exists (
  select 1 from public.partner_benefits b where b.venue_id = v.id
);

-- 운영·지표 (Phase 3)
create table public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index app_events_name_created on public.app_events (event_name, created_at desc);

alter table public.app_events enable row level security;

create policy "app_events_insert_auth"
  on public.app_events for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "app_events_insert_anon"
  on public.app_events for insert
  to anon
  with check (user_id is null);
