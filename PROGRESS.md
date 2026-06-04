# 루트제이 (Route J) — 진행 현황

> 최종 갱신: 2026-06-04  
> 앱 표시명: **루트제이** · 프로젝트 slug: `route-j`  
> 의미: MBTI J가 짜는 루트 / **루트를 제의**한다 (이중 의미)

---

## 1. 프로젝트 개요

커플(데이트)을 위한 **데이트 동선(루트) 공유 앱**.  
공개 피드에서 다른 사람의 코스를 탐색하고, 커플 연결 후 자신들의 루트를 등록·관리한다.

**개발 방향**

- **웹·iOS·Android 동일 코드베이스** (Expo + React Native + react-native-web)
- 개발 시 웹으로 빠르게 확인하고, Expo Go 등으로 앱에서도 동일 흐름 검증
- MVP 1차 완료 전까지는 주로 웹에서 작업하되, **웹 전용 분기 코드는 최소화**

---

## 2. 기술 스택

| 영역 | 선택 |
|------|------|
| 프론트 | Expo SDK ~52, expo-router, TypeScript |
| 백엔드 | Supabase (Auth, Postgres, Storage, RLS) |
| UI | React Native 컴포넌트 (웹 = react-native-web) |
| 지도 | 카카오맵 — **2차** (상세 화면 플레이스홀더만 존재) |
| 로그인 MVP | 이메일·비밀번호 |
| 로그인 2차 | 카카오, Apple, Google, SMS |

---

## 3. 확정된 기획 (MVP 1차)

### 3.1 회원 상태·권한

| 상태 | 조건 | 열람 | 좋아요·찜 | 루트 작성 |
|------|------|------|-----------|-----------|
| **비회원** | 미로그인 | 인기 샘플만 | ✗ | ✗ |
| **회원** | 로그인, 커플 미연결 | 공개 루트 전체 | ✓ | ✗ |
| **커플 회원** | 1:1 연결 완료 | 공개 + 우리 탭 | ✓ | ✓ |

**비회원 미리보기 (둘 다 적용)**

- 홈(탐색): 인기 상위 **10개** (`GUEST_HOME_TOP`)
- 지역·역·테마 필터 시: 카테고리당 상위 **3개** (`GUEST_PER_CATEGORY_TOP`)

**인기 점수 (확정 5:1)**

```
인기 점수 = (좋아요 × 5) + (조회 × 1)
```

- 상수: `POPULARITY_LIKE_WEIGHT = 5`, `POPULARITY_VIEW_WEIGHT = 1`
- 추후 데이터 보고 조정 가능

### 3.2 루트

| 항목 | 내용 |
|------|------|
| 필드 | 제목, 소개, **순서 있는 장소 목록** |
| 메타 | 지역·지하철역(프리셋 목록), 테마 태그(프리셋, 선택) |
| 장소당 | 사진 0~1, 별점 1~5 — **둘 다 선택** |
| 공개 상태 | 공개 / 우리만 보기 / 삭제 (작성·상세에서 전환) |
| 수정 | 우리만 보기 포함, **연결된 상대도 수정 가능** |

### 3.3 커플

- **6자리 초대 코드** (1:1 고정) — MVP 포함
- 초대 **딥링크** — 2차
- 연인 전용: 비공개 루트 반응, 위시리스트, 우리 지도 등 — **2차**

### 3.4 탐색·탭

- **탐색**: 공개 피드, 지역·역·테마 필터, 검색
- **우리**: 커플이 만든 루트 전체 (공개+우리만). 미연결 시 연결 안내
- **프로필**: 로그인·커플 연결·설정
- **「내 루트」 탭 없음** — 우리 탭에서 통합 관리

### 3.5 운영

- MVP: **신고 버튼** + 본인 글 삭제
- 관리자·신고 처리 대시보드 — 2차

### 3.6 지역 데이터

- MVP: **서울·수도권 주요 역** (`seed.sql`)
- 이후 전국 확장 예정

---

## 4. 구현 완료 항목

### 4.1 프로젝트 구조

```
route-j/
├── app/                    # expo-router 화면
│   ├── (tabs)/             # 탐색, 우리, 프로필
│   ├── auth/               # 로그인, 회원가입
│   ├── couple/             # 6자리 코드 연결
│   ├── route/              # 상세, 작성
│   ├── _layout.tsx
│   └── +html.tsx           # 웹 HTML/높이
├── components/             # RouteCard, Banner, Button 등
├── constants/              # 앱명, 인기 가중치, 테마 색
├── lib/                    # supabase, auth, routes, couple, auth-storage
├── types/
├── supabase/
│   ├── migrations/         # 001 스키마, 002 RPC, 003 storage 안내
│   └── seed.sql
├── metro.config.js         # OpenTelemetry 스텁
├── lib/stubs/opentelemetry-api.js
├── PROJECT_BRIEF.md        # 기획 요약
├── README.md               # 실행 가이드
└── PROGRESS.md             # 본 문서
```

### 4.2 Supabase (DB·RLS·RPC)

- **테이블**: `profiles`, `couples`, `regions`, `stations`, `themes`, `routes`, `route_stops`, `route_themes`, `route_likes`, `route_bookmarks`, `route_reports`
- **RLS**: 공개 루트 열람, 커플만 우리만 보기·CRUD, 좋아요·찜·신고
- **RPC**: `get_public_routes_popular`, `get_couple_routes`, `create_couple_invite`, `join_couple_with_code`, `get_my_couple`, `increment_route_view`
- **트리거**: 좋아요 변경 시 `like_count`·`popularity_score` 갱신
- **시드**: 지역 4종, 역 12개, 테마 6개

### 4.3 앱 화면·기능

| 화면 | 기능 |
|------|------|
| 탐색 | 비회원/회원 배너, 검색, 지역·역·테마 칩, 인기 루트 목록 |
| 우리 | 커플 루트 목록, + 새 루트 |
| 프로필 | tier 표시, 로그인/가입/연결/로그아웃 |
| 로그인·가입 | Supabase Email Auth |
| 커플 연결 | 코드 생성·입력 |
| 루트 작성 | 제목·소개·장소·공개범위·지역·역·테마·별점·사진(업로드 시 Storage) |
| 루트 상세 | 조회수 증가, 좋아요·찜·신고, 커플 시 공개/우리만/삭제 |

### 4.4 웹·크로스플랫폼 대응

- `lib/auth-storage.ts`: 웹 = localStorage, 네이티브 = AsyncStorage, SSR 시 `window` 미접근
- `app/+html.tsx`: 웹 `html/body` 높이 100%
- 탭 `sceneStyle: { flex: 1 }`, 목록 **ScrollView** (웹 FlatList 높이 0 이슈 회피)
- `metro.config.js` + OpenTelemetry **스텁** (Supabase 웹 번들)
- `expo-font` + Ionicons 폰트 로드 (`_layout.tsx`)

---

## 5. 환경 설정·실행 (완료된 로컬 작업)

사용자 환경에서 해결·확인된 사항:

- Node.js 설치 (`v20.16.0` 등)
- PowerShell 실행 정책 → `npm` 사용 (`RemoteSigned` 또는 `npm.cmd`)
- `npm install`, `npx expo start --clear`
- 웹 번들: `@opentelemetry/api`, `expo-font` 이슈 해결 후 **화면 정상 표시 확인**

**실행 명령**

```bash
cd route-j
npm install
npx expo install    # Expo 호환 버전 맞춤
npx expo start --clear
# w: 웹 | QR: Expo Go
```

**환경 변수** (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 6. 미완료·2차 백로그

### 6.1 인프라·연동 (사용자/대시보드 작업)

- [ ] Supabase migration·seed 실행 여부 전원 확인
- [ ] Storage 버킷 `route-photos` + 업로드 RLS
- [ ] Email Auth Confirm email 정책 (개발 OFF / 출시 ON)
- [ ] 샘플 공개 루트 데이터 (선택)

### 6.2 기능

- [ ] 카카오맵 (장소·동선 표시)
- [ ] 카카오 로그인
- [ ] Apple / Google / SMS 로그인
- [ ] 초대 딥링크
- [ ] 사진 업로드 안정화 (Storage 연동·표시 URL)
- [ ] 관리자 신고 처리
- [ ] 연인 전용: 댓글·하트, 위시리스트, 우리 지도
- [ ] 지역·역 데이터 전국 확장

### 6.3 QA 체크리스트 (권장)

- [ ] 회원가입 → 로그인
- [ ] 커플 코드 2계정 연결
- [ ] 공개 루트 등록 → 탐색 노출
- [ ] 우리만 보기 → 비커플·비회원 비노출
- [ ] 비로그인 시 샘플만 노출
- [ ] 좋아요·찜·신고
- [ ] Expo Go에서 동일 플로우

---

## 7. 트러블슈팅 기록

| 증상 | 원인 | 조치 |
|------|------|------|
| `npx`/`npm` 인식 안 됨 | Node 미설치·PATH | Node LTS 설치, Cursor 재시작 |
| `npm.ps1` 로드 불가 | PowerShell 실행 정책 | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 또는 `npm.cmd` |
| `expo-splash-screen` 플러그인 | 패키지 누락 | `package.json`에 추가 후 `npm install` |
| `window is not defined` | 웹 SSR + AsyncStorage | `auth-storage.ts` 분기 |
| `Unable to resolve @opentelemetry/api` | Supabase 선택 의존성 | `metro.config.js` 스텁 |
| `Unable to resolve expo-font` | vector-icons 의존성 | `expo-font` 설치 + `_layout` 폰트 로드 |
| 화면 본문 비음 | 위 번들 실패 또는 FlatList 높이 | 번들 수정 + ScrollView 레이아웃 |

---

## 8. 핵심 상수·파일 참고

| 상수 / 파일 | 위치 |
|-------------|------|
| `GUEST_HOME_TOP = 10` | `constants/app.ts` |
| `GUEST_PER_CATEGORY_TOP = 3` | `constants/app.ts` |
| 인기 5:1 | `constants/app.ts`, DB 트리거/RPC |
| Supabase 클라이언트 | `lib/supabase.ts` |
| Auth·tier | `lib/auth.tsx` |
| 기획 한 줄 요약 | `PROJECT_BRIEF.md` |
| 설치·실행 | `README.md` |

---

## 9. 다음 권장 작업 순서

1. **Supabase** migration + seed + Storage 버킷 확인  
2. **테스트 계정 2개**로 커플 연결 → **공개 루트 1건** 등록 E2E  
3. **사진 업로드** (Storage) 또는 **카카오맵** 중 우선순위 선택  
4. Expo Go로 **앱 동작** 재확인  

---

## 10. 변경 이력 (요약)

| 일자 | 내용 |
|------|------|
| 2026-06-04 | 기획 확정 (루트제이, 권한 3단계, 5:1 인기, 커플 코드) |
| 2026-06-04 | Expo + Supabase 스캐폴딩, 탭·화면·RLS 구현 |
| 2026-06-04 | 웹 번들·레이아웃 이슈 수정, 웹 화면 표시 확인 |

---

*기획 상세는 `PROJECT_BRIEF.md`, 실행 방법은 `README.md`를 참고하세요.*
