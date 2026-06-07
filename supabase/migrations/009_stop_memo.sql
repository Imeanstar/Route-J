-- 장소별 한줄 메모 (등록 화면)
alter table public.route_stops
  add column if not exists memo text;
