-- =============================================================================
-- RouteJ — 개발 DB 전체 초기화 (되돌릴 수 없음)
-- =============================================================================
-- Supabase SQL Editor에서 **한 번에** 실행하세요.
--
-- 지우는 것:
--   · public 스키마 전체 (테이블·enum·함수·RLS·RouteJ 데이터)
--   · storage: route-photos RLS 정책만 (파일·버킷은 SQL로 삭제 불가 → 아래 참고)
--   · auth: 우리가 만든 트리거 + (기본) 모든 가입 사용자
--
-- Storage 파일/버킷 삭제 (이 스크립트 실행 전 또는 후):
--   node scripts/wipe-storage.mjs   (.env 에 SUPABASE_SERVICE_ROLE_KEY)
--   또는 Dashboard → Storage → route-photos → Empty / Delete bucket
--
-- 지우지 않는 것 (Supabase가 관리 — Dashboard에 보여도 정상):
--   · auth / storage / extensions / graphql / realtime / vault 스키마 자체
--   · uuid-ossp 등 플랫폼 extension
--
-- 이후: migrations 001 → 006 + seed.sql (+ seed_demo_routes.sql) 순서로 다시 실행
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1) Auth: RouteJ가 추가한 트리거·함수
-- -----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

-- public 스키마를 지우기 전에 호출되던 함수 (남아 있을 수 있음)
drop function if exists public.handle_new_user() cascade;

-- -----------------------------------------------------------------------------
-- 2) Storage: route-photos 정책만 제거
--    ※ storage.objects / storage.buckets 는 SQL DELETE 금지 (protect_delete)
--    ※ 파일 삭제: node scripts/wipe-storage.mjs 또는 Dashboard
-- -----------------------------------------------------------------------------
drop policy if exists "route_photos_public_read" on storage.objects;
drop policy if exists "route_photos_auth_insert" on storage.objects;
drop policy if exists "route_photos_auth_update" on storage.objects;
drop policy if exists "route_photos_auth_delete" on storage.objects;

-- -----------------------------------------------------------------------------
-- 3) public 스키마 통째 삭제 후 재생성 (RouteJ + 마이그레이션 005 등 전부 제거)
-- -----------------------------------------------------------------------------
drop schema if exists public cascade;

create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4) Auth 가입자 전부 삭제 (Authentication 목록 비움)
--     public만 비우고 로그인 계정은 유지하려면 이 블록 전체를 주석 처리하세요.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'refresh_tokens') then
    delete from auth.refresh_tokens;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'sessions') then
    delete from auth.sessions;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'identities') then
    delete from auth.identities;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    delete from auth.users;
  end if;
end $$;

commit;

-- 완료 확인 (결과가 0건이면 public 초기화 성공)
select count(*) as public_tables
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE';

select count(*) as auth_users from auth.users;

select count(*) as route_photos_objects
from storage.objects
where bucket_id = 'route-photos';
