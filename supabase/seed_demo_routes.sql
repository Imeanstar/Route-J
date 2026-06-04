-- 데모 공개 루트 20건 (피드 시드)
-- 사전 준비: Auth에 시드 계정 1개 + 커플 active 상태
--   계정 A: seed1@routej.local / seed2@routej.local (비밀번호: RouteJSeed2026!)
--   A에서 커플 코드 생성 → B가 입력 후 active
--   SQL Editor에서 아래 DO 블록 실행 (seed1 기준으로 루트 작성)

do $$
declare
  v_user uuid;
  v_user2 uuid;
  v_couple uuid;
  v_region_seongsu uuid;
  v_region_hongdae uuid;
  v_region_gangnam uuid;
  v_region_gyeonggi uuid;
  v_station_seongsu uuid;
  v_theme_cafe uuid;
  v_theme_food uuid;
  v_theme_walk uuid;
  v_theme_night uuid;
  v_route uuid;
  r record;
begin
  select id into v_user from auth.users where email = 'seed1@routej.local' limit 1;
  select id into v_user2 from auth.users where email = 'seed2@routej.local' limit 1;
  if v_user is null or v_user2 is null then
    raise notice 'seed1@routej.local, seed2@routej.local 계정을 먼저 만드세요.';
    return;
  end if;

  insert into public.profiles (id, display_name)
  values
    (v_user, 'RouteJ 시드1'),
    (v_user2, 'RouteJ 시드2')
  on conflict (id) do update set display_name = excluded.display_name;

  select id into v_couple from public.couples
  where status = 'active'
    and (
      (user1_id = v_user and user2_id = v_user2)
      or (user1_id = v_user2 and user2_id = v_user)
    )
  limit 1;

  if v_couple is null then
    raise notice 'seed1·seed2 커플 연결(active) 후 다시 실행하세요.';
    return;
  end if;

  select id into v_region_seongsu from public.regions where name = '서울 성수·건대';
  select id into v_region_hongdae from public.regions where name = '서울 홍대·마포';
  select id into v_region_gangnam from public.regions where name = '서울 강남권';
  select id into v_region_gyeonggi from public.regions where name = '경기 수도권';
  select id into v_station_seongsu from public.stations where name = '성수역' limit 1;
  select id into v_theme_cafe from public.themes where slug = 'cafe';
  select id into v_theme_food from public.themes where slug = 'food';
  select id into v_theme_walk from public.themes where slug = 'walk';
  select id into v_theme_night from public.themes where slug = 'night-view';

  for r in
    select * from (values
      ('성수동 따뜻한 겨울 카페 산책', '성수 골목 카페와 한강 뷰를 잇는 2시간 코스.', v_region_seongsu, v_station_seongsu, v_theme_cafe, 42, 18),
      ('연남동 브런치 & 서점 데이트', '느긋한 브런치 후 독립 서점 탐방.', v_region_hongdae, null, v_theme_food, 35, 12),
      ('한남동 야경 드라이브 코스', '남산 뷰와 한강 야경 포인트.', v_region_gangnam, null, v_theme_night, 58, 22),
      ('홍대 골목 맛집 투어', '분위기 맛집 3곳을 도보로 연결.', v_region_hongdae, null, v_theme_food, 51, 15),
      ('건대입구 캠퍼스 감성 산책', '캠퍼스와 카페 거리 산책.', v_region_seongsu, null, v_theme_walk, 28, 9),
      ('강남역 실내 데이트', '전시·쇼핑·디저트를 한 번에.', v_region_gangnam, null, v_theme_cafe, 64, 25),
      ('망원 한강 공원 피크닉', '피크닉 매트와 테이크아웃 커피.', v_region_hongdae, null, v_theme_walk, 33, 11),
      ('판교 카페 & 산책로', '신도시 카페와 호수공원.', v_region_gyeonggi, null, v_theme_cafe, 21, 7),
      ('압구정 골목 갤러리 투어', '작은 갤러리와 디저트.', v_region_gangnam, null, v_theme_walk, 19, 6),
      ('뚝섬 한강 자전거 & 카페', '자전거 대여 후 카페 휴식.', v_region_seongsu, null, v_theme_walk, 47, 14),
      ('합정 골목 카페 홉', '개성 카페 4곳 홉.', v_region_hongdae, null, v_theme_cafe, 39, 13),
      ('신사 가로수길 산책', '가로수길 쇼핑과 브런치.', v_region_gangnam, null, v_theme_food, 55, 20),
      ('성수 팝업 & 사진 스팟', '팝업스토어와 포토존.', v_region_seongsu, v_station_seongsu, v_theme_walk, 72, 28),
      ('수원 화성 야간 산책', '화성 야경과 맛집.', v_region_gyeonggi, null, v_theme_night, 26, 8),
      ('일산 호수공원 데이트', '호수 산책과 보트.', v_region_gyeonggi, null, v_theme_walk, 18, 5),
      ('건대 맛집 & 보드게임 카페', '저녁 식사 후 보드게임.', v_region_seongsu, null, v_theme_food, 31, 10),
      ('홍대 버스킹 & 야시장', '거리 공연과 야시장 간식.', v_region_hongdae, null, v_theme_night, 44, 16),
      ('강남 디저트 투어', '디저트 전문점 3곳.', v_region_gangnam, null, v_theme_cafe, 37, 12),
      ('성수 브런치 & 플리마켓', '주말 플리마켓과 브런치.', v_region_seongsu, v_station_seongsu, v_theme_food, 61, 24),
      ('연남동 감성 카페 & 와인', '저녁 와인바와 산책.', v_region_hongdae, null, v_theme_night, 29, 9)
    ) as t(title, description, region_id, station_id, theme_id, views, likes)
  loop
    if exists (select 1 from public.routes where couple_id = v_couple and title = r.title) then
      continue;
    end if;

    insert into public.routes (
      couple_id, created_by, title, description,
      region_id, station_id, visibility,
      view_count, like_count, popularity_score
    ) values (
      v_couple, v_user, r.title, r.description,
      r.region_id, r.station_id, 'public',
      r.views, r.likes, (r.likes * 5 + r.views)
    ) returning id into v_route;

    insert into public.route_themes (route_id, theme_id) values (v_route, r.theme_id);

    insert into public.route_stops (route_id, sort_order, place_name, address, rating) values
      (v_route, 0, r.title || ' 1지점', '서울', 5),
      (v_route, 1, r.title || ' 2지점', '서울', 4),
      (v_route, 2, r.title || ' 3지점', '서울', 5);
  end loop;

  raise notice '시드 루트 삽입 완료 (couple %).', v_couple;
end $$;
