# 루트제이 (Route J)

커플이 데이트 루트(동선)를 공유하는 모바일 앱 — **Expo (React Native)** + **Supabase**.

## MVP 기능

- **비회원**: 인기 공개 루트 미리보기 (홈 10개 · 필터 시 카테고리당 3개)
- **회원**: 전체 공개 루트 열람 · 좋아요 · 찜
- **커플 회원** (6자리 코드 1:1): 루트 작성 · 공개/우리만 보기 전환 · 상대도 수정 가능
- 장소당 사진 0~1 · 별점 1~5 (둘 다 선택)
- 인기 점수: `(좋아요 × 5) + 조회`
- 신고 버튼
- 카카오 로그인(OAuth) · 카카오맵 링크 · 루트 공유
- RouteJ Plus · 제휴 할인 (DB + 앱 UI, IAP는 RevenueCat 연동 시)

## EAS 내부 테스트 빌드

Git 미설치·오류 시: **`docs/EAS_BUILD.md`** (`EAS_NO_VCS=1` 포함).

## 시작하기

### 1. Node.js

[https://nodejs.org](https://nodejs.org) LTS 설치 후 터미널에서 `node -v`, `npm -v` 확인.

### 2. 의존성

```bash
cd route-j
npm install
```

`assets/`에 Expo 아이콘 PNG 추가 (없으면 `assets/README.md` 참고).

### 3. Supabase

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL·시드: **`docs/SUPABASE_SETUP.md`** (001~006, `seed.sql`, `seed_demo_routes.sql`)
3. **Storage**: `004_storage_policies.sql` 적용 시 `route-photos` 자동 설정
4. **Authentication**: Email 활성화
5. Settings → API에서 URL · `anon` key 복사

`.env` 생성:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. 앱 실행 (웹 · iOS · Android 공통 코드)

```bash
npm install
npx expo install
npx expo start --clear
```

- **웹**: 터미널에서 `w` 또는 http://localhost:8081
- **폰**: Expo Go로 QR 스캔

`Web Bundling failed` / `@opentelemetry/api` 오류가 나오면 Metro 캐시를 비우고 다시 시작하세요 (`--clear`). 프로젝트에 스텁(`metro.config.js`)이 포함되어 있습니다.

## 프로젝트 구조

```
app/           # expo-router 화면
components/    # UI
lib/           # Supabase, auth, routes, couple
constants/     # 인기 가중치, 게스트 제한
supabase/      # migrations, seed
docs/          # SUPABASE_SETUP, QA, OPS, GROWTH
types/         # TypeScript 타입
```

## 스토어 빌드 (EAS)

```bash
npm i -g eas-cli
eas login
eas build --profile preview --platform all
```

`eas.json` · 번들 ID `com.routej.app` · QA: `docs/QA_CHECKLIST.md` · 운영: `docs/OPS_RUNBOOK.md`

## 2차 예정

- RevenueCat IAP · Apple/Google 로그인
- 초대 딥링크 · 관리자 신고 대시보드

## 라이선스

Private — 포트폴리오용
