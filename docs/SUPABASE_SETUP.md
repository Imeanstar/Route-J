# Supabase 프로덕션 설정

## 0. 개발 DB를 처음부터 비우기 (선택)

테이블·enum이 꼬였거나 Auth/Storage까지 깨끗이 지우려면:

1. (선택) Storage 비우기: `node scripts/wipe-storage.mjs` — `.env`에 `SUPABASE_SERVICE_ROLE_KEY` 필요. 또는 Dashboard → Storage → `route-photos` 삭제.
2. **`supabase/scripts/wipe_all.sql`** 을 SQL Editor에서 실행 → 성공 후 아래 1번부터 다시 적용.

> SQL로 `storage.objects`를 `DELETE`하면 `42501 Direct deletion from storage tables is not allowed` 가 납니다. 정상 동작입니다.

> `auth`, `graphql`, `extensions` 스키마는 Supabase 플랫폼용이라 **삭제할 수 없습니다**. Dashboard에 보이는 것은 정상이며, wipe 스크립트는 **RouteJ 데이터(public)·가입자·route-photos** 만 지웁니다.

## 1. SQL 적용 순서

Dashboard → SQL Editor에서 아래 파일을 **순서대로** 실행합니다.

### `already exists` 오류가 날 때

`type "couple_status" already exists` 등은 **이미 001을 일부 실행한 상태**에서 같은 파일을 다시 돌렸을 때 납니다.

1. **권장**: 저장소의 최신 `001_initial.sql`을 다시 실행합니다 (enum·테이블·정책이 재실행 안전하게 수정됨).
2. **또는** 스키마가 이미 거의 다 있으면 001은 건너뛰고, `002_rpc.sql`부터 이어서 실행합니다.
3. **완전 초기화**가 필요하면 (개발 DB만): Dashboard에서 public 스키마 객체를 삭제한 뒤 001부터 다시 실행 — **프로덕션 데이터가 있으면 하지 마세요.**

적용 여부 확인:

```sql
select typname from pg_type t
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and typname in ('couple_status', 'route_visibility');

select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('profiles', 'couples', 'routes');
```

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_rpc.sql`
3. `supabase/migrations/003_storage.sql`
4. `supabase/migrations/004_storage_policies.sql`
5. `supabase/migrations/005_subscriptions_partners.sql`
6. `supabase/migrations/006_report_notify.sql`
7. `supabase/migrations/007_auth_profile_fix.sql` — 이메일 가입·프로필 트리거
8. `supabase/migrations/008_search_expand.sql` — 검색(지역·역·장소·테마 포함)
9. `supabase/seed.sql` — 지역·테마·역 메타
10. (권장) `supabase/seed_demo_routes.sql` — 공개 루트 20건

## 2. Storage

- 버킷 `route-photos` (public read, authenticated upload)
- `004_storage_policies.sql` 적용 후 업로드 테스트

## 3. 시드 계정 (데모 루트)

`seed_demo_routes.sql` 전제:

- `seed1@routej.local` / `seed2@routej.local` 가입 후 커플 **active**
- 또는 동일 커플 ID로 수동 연결

## 4. Auth (이메일 가입·로그인)

### Dashboard 설정 (필수)

1. **Authentication → Providers → Email** → **Enable Email** 켜기
2. **개발·테스트용 권장**: **Confirm email** 끄기  
   - 켜져 있으면 가입 후 **메일 링크 클릭 전까지 로그인 불가** (`Email not confirmed`)
   - 실제 메일이 안 오면 스팸함·Supabase **Authentication → Users**에서 사용자 **Confirm** 수동 처리
3. (선택) **Authentication → URL Configuration** — Site URL은 `http://localhost:8081` 등 개발 URL 가능

### SQL (가입 시 `Database error saving new user`)

프로필 트리거·권한 보강:

```text
supabase/migrations/007_auth_profile_fix.sql
```

SQL Editor에서 실행 후 앱에서 다시 가입.

### 확인

```sql
-- 트리거 존재 여부
select tgname from pg_trigger
where tgname = 'on_auth_user_created';

-- 최근 가입자
select id, email, email_confirmed_at, created_at
from auth.users
order by created_at desc
limit 5;
```

### 앱에서 테스트 순서

1. 프로필 → **이메일로 가입하기** (실제 받을 수 있는 메일 권장, `@routej.local` 은 인증 메일이 안 올 수 있음)
2. Confirm email **OFF**면 가입 직후 자동 로그인 → **커플 연결** → 루트 작성 → 사진 업로드
3. Confirm email **ON**이면 메일 확인 후 로그인

- (Phase 1) Kakao Provider: Redirect URL에 `routej://auth/callback` 및 Expo 개발 URL 추가

## 5. 앱 환경변수

`.env.example` 복사 → `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon public)
```

**주의:** 브라우저 주소창의 `https://supabase.com/dashboard/project/xxxx` 는 **넣으면 안 됩니다.**  
Dashboard → **Project Settings → API** → **Project URL** (`https://xxxx.supabase.co`) 과 **anon public** 키를 복사하세요.

검증:

```bash
node scripts/verify-supabase.mjs
```

## 6. 스모크 테스트

```bash
node scripts/verify-supabase.mjs
```

## 7. 신고 알림 (선택)

`route_reports` INSERT → Database Webhook → 이메일(Resend/SendGrid) 또는 주 1회 수동 검토 (`docs/OPS_RUNBOOK.md`).
