-- 텍스트 검색: 제목·설명 + 지역·역·테마·장소명·주소
-- 예) "강남" → 서울 강남권, 강남역, 강남 인근 장소가 포함된 루트

create or replace function public.get_public_routes_popular(
  p_limit int default 10,
  p_region_id uuid default null,
  p_station_id uuid default null,
  p_theme_id uuid default null,
  p_search text default null
)
returns setof public.routes
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from routes r
  left join route_themes rt on rt.route_id = r.id and p_theme_id is not null
  where r.visibility = 'public'
    and r.deleted_at is null
    and (p_region_id is null or r.region_id = p_region_id)
    and (p_station_id is null or r.station_id = p_station_id)
    and (p_theme_id is null or rt.theme_id = p_theme_id)
    and (
      p_search is null
      or btrim(p_search) = ''
      or r.title ilike '%' || p_search || '%'
      or r.description ilike '%' || p_search || '%'
      or r.region_id in (
        select reg.id from regions reg where reg.name ilike '%' || p_search || '%'
      )
      or r.station_id in (
        select st.id
        from stations st
        where st.name ilike '%' || p_search || '%'
           or coalesce(st.line_name, '') ilike '%' || p_search || '%'
      )
      or r.station_id in (
        select st.id
        from stations st
        join regions reg on reg.id = st.region_id
        where reg.name ilike '%' || p_search || '%'
      )
      or exists (
        select 1
        from route_themes rt2
        join themes th on th.id = rt2.theme_id
        where rt2.route_id = r.id
          and th.name ilike '%' || p_search || '%'
      )
      or exists (
        select 1
        from route_stops rs
        where rs.route_id = r.id
          and (
            rs.place_name ilike '%' || p_search || '%'
            or coalesce(rs.address, '') ilike '%' || p_search || '%'
          )
      )
    )
  group by r.id
  order by r.popularity_score desc, r.created_at desc
  limit greatest(p_limit, 1);
$$;

grant execute on function public.get_public_routes_popular to anon, authenticated;
