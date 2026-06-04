-- 서울·수도권 MVP 시드 (Supabase SQL Editor에서 migration 후 실행)

insert into public.regions (name, sort_order) values
  ('서울 강남권', 1),
  ('서울 홍대·마포', 2),
  ('서울 성수·건대', 3),
  ('경기 수도권', 4)
on conflict (name) do nothing;

insert into public.stations (region_id, name, line_name, sort_order)
select r.id, v.name, v.line_name, v.sort_order
from public.regions r
cross join (values
  ('강남권', '강남역', '2호선', 1),
  ('강남권', '신사역', '3호선', 2),
  ('강남권', '압구정역', '3호선', 3),
  ('서울 홍대·마포', '홍대입구역', '2호선', 1),
  ('서울 홍대·마포', '합정역', '2호선', 2),
  ('서울 홍대·마포', '망원역', '6호선', 3),
  ('서울 성수·건대', '성수역', '2호선', 1),
  ('서울 성수·건대', '건대입구역', '2호선', 2),
  ('서울 성수·건대', '뚝섬역', '2호선', 3),
  ('경기 수도권', '판교역', '신분당선', 1),
  ('경기 수도권', '수원역', '1호선', 2),
  ('경기 수도권', '일산역', '3호선', 3)
) as v(region_name, name, line_name, sort_order)
where r.name = case v.region_name
  when '강남권' then '서울 강남권'
  when '서울 홍대·마포' then '서울 홍대·마포'
  when '서울 성수·건대' then '서울 성수·건대'
  else '경기 수도권'
end
on conflict do nothing;

insert into public.themes (name, slug, sort_order) values
  ('카페 투어', 'cafe', 1),
  ('야경', 'night-view', 2),
  ('실내 데이트', 'indoor', 3),
  ('맛집', 'food', 4),
  ('산책·공원', 'walk', 5),
  ('전시·문화', 'culture', 6)
on conflict (slug) do nothing;
