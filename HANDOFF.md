# RouteJ (루트제이) — 개발 인수인계 / 세션 맥락

> 다른 PC·새 Cursor 채팅에서 이어서 작업할 때 참고용.  
> 작성 기준: 2026-06 (로컬 Cursor 대화 요약)

---

## 1. 프로젝트 한 줄 요약

**Expo SDK 52 + Supabase + expo-router** 기반 커플 데이트 코스 공유 앱.

| 항목 | 값 |
|------|-----|
| 앱 이름 | 루트제이 (RouteJ) |
| Expo slug | `route-j` |
| EAS 계정/프로젝트 | `@mike4403/route-j` |
| Supabase ref | `mzqlnhvanubhkixggpvh` |
| Scheme (딥링크) | `routej` |
| Android package | `com.routej.app` |

---

## 2. 지금까지 완료된 기능 (요약)

### 인프라·백엔드
- Supabase migration/seed, Storage, RLS
- Edge Function `search-places` (카카오 장소 검색, 웹 CORS 우회)
- SQL: `009_stop_memo.sql` (`route_stops.memo`), `010_kakao_profile.sql` (카카오 닉네임·avatar)

### 앱 기능
- 피드·검색·프로필·만들기 탭
- 코스 등록/수정 (`/route/create`, `/route/edit/[id]`) — 카카오 장소 검색 필수, lat/lng 필수
- Route Map (WebView + 카카오맵 JS SDK)
- 이메일 가입/로그인, 카카오 OAuth (`lib/kakao-auth.ts`)
- 커플 연결, 우리 루트, 만들기 탭 권한 (`CoupleRequiredModal`)
- Stitch UI 통일, `safeGoBack()` 네비

### 문서
- `docs/KAKAO_LOGIN.md`, `docs/KAKAO_PLACES.md`, `docs/EAS_BUILD.md`, `docs/QA_CHECKLIST.md` 등

---

## 3. APK 실기기 QA에서 겪은 문제 (타임라인)

| 순서 | 증상 | 원인 (추정) | 대응 |
|------|------|-------------|------|
| 1 | ♥·★ 등 기호/아이콘 안 보임 | 커스텀 폰트에 글리프 없음 | `LikeCount`, `StarRating` — Ionicons로 교체 |
| 2 | 로그인·루트 상세 흰 화면 | 화면 진입 시 `kakao.ts` → `WebBrowser` 로드 | `kakao-map-link.ts` / `kakao-auth.ts` 분리, 로그인은 카카오 버튼 시에만 dynamic import |
| 3 | `eas build` 실패 (`expo config` exit 1) | Node v24 + `expo-web-browser` config 플러그인 | `app.config.js` 전환, 플러그인 제거, `intentFilters` 유지 |
| 4 | 스플래시(로고)에서 영원히 멈춤 | 앱 시작 시 `WebBrowser` + 폰트 대기 무한 | 스플래시 4초 타임아웃, `auth-session-core` 분리, OAuth 핸들러 지연 로드 |
| 5 | 온보딩 → 탭 1초 후 사라지고 흰 화면 | `AuthOAuthLinkHandler`가 빈 `auth/callback` URL로 `router.replace('/auth/login')` | `isOAuthReturnUrl()` — code/token/error 있을 때만 처리, 실패 시 네비게이션 안 함 |

---

## 4. 가장 최근에 고친 오류 (상세)

### 4-1. 스플래시 멈춤
- **파일**: `app/_layout.tsx`
- **변경**: `appReady` + 4초 fallback → `SplashScreen.hideAsync()` 강제
- **변경**: 앱 시작 시 `WebBrowser.maybeCompleteAuthSession()` 호출 제거 → 카카오 로그인 직전(`prepareOAuthBrowser`)만

### 4-2. 탭 사라짐 + 흰 화면
- **파일**: `components/AuthOAuthLinkHandler.tsx`, `lib/auth-session-core.ts`
- **변경**: OAuth payload(`code`, `access_token`, `error`) 없는 URL 무시
- **변경**: 처리 실패 시 `router.replace('/auth/login')` **삭제** (탭 스택 유지)
- **변경**: `createSessionFromUrl()` — 무분별 `getSession()` 성공 처리 제거 (`allowExistingSession`은 웹 callback만)

### 4-3. 모듈 분리 (APK 안정화)
| 파일 | 역할 |
|------|------|
| `lib/auth-session-core.ts` | WebBrowser 없음 — 앱 시작·일반 화면에서 import 안전 |
| `lib/auth-session.ts` | `prepareOAuthBrowser` / `finishOAuthBrowser` (카카오 직전만) |
| `lib/kakao-map-link.ts` | 카카오맵 외부 URL만 |
| `lib/kakao-auth.ts` | `signInWithKakao()` |
| `components/DeferredAuthOAuthLinkHandler.tsx` | 첫 화면 후 0.5초 뒤 OAuth 핸들러 로드 |

### 4-4. 기타
- `app/(tabs)/profile.tsx` — `loading` 시 `return null` → 스피너
- `components/RouteMap.tsx` — Android WebView 120ms 지연 마운트
- `app.json` — `expo-web-browser` **config 플러그인 제거** (빌드용), Android `intentFilters` **유지** (OAuth 딥링크)

---

## 5. APK 빌드 명령어

### 사전 확인 (로컬)

```powershell
cd C:\Users\USER\Desktop\Cursor\route-j
node -v
npx expo config --json
```

JSON 한 줄이 나오면 config 단계 OK.

### EAS 로그인 (최초 1회)

```powershell
npx eas-cli login
```

### Android preview APK 빌드 (내부 테스트)

```powershell
cd C:\Users\USER\Desktop\Cursor\route-j
npx eas-cli build --profile preview --platform android
```

Git 오류 시 (PowerShell):

```powershell
$env:EAS_NO_VCS = "1"
npx eas-cli build --profile preview --platform android
```

### 빌드 상태 확인

```powershell
npx eas-cli build:list --platform android --limit 5
```

또는 대시보드: https://expo.dev/accounts/mike4403/projects/route-j/builds

완료 후 **APK 다운로드** → 폰 설치.

### 로컬 개발 (Expo Go)

```powershell
npx expo start --clear
```

---

## 6. EAS 환경 변수 (preview)

로컬 `.env`만으로는 APK에 값이 안 들어감. EAS 대시보드 → **Environment variables** → **preview**:

| 변수 | 용도 |
|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase (Sensitive) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (Sensitive) |
| `EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 지도 WebView |
| `EXPO_PUBLIC_KAKAO_REST_API_KEY` | (선택) 네이티브 직접 검색 fallback |

앱 프로필 하단 **서버: mzqlnhvanubhkixggpvh.supabase.co** → env 정상. **미설정** → 재빌드 필요.

등록 확인:

```powershell
npx eas-cli env:list --environment preview
```

---

## 7. 카카오·Supabase 설정 체크 (APK)

자세한 내용: `docs/KAKAO_LOGIN.md`

**Supabase Redirect URLs** (필수):

```
routej://auth/callback
http://localhost:8081/auth/callback
```

**카카오 Redirect URI** (Supabase callback, scheme 아님):

```
https://mzqlnhvanubhkixggpvh.supabase.co/auth/v1/callback
```

---

## 8. APK QA 체크리스트 (우선순위)

1. [ ] 앱 실행 → 스플래시 → **피드(온보딩)** — 탭이 **계속** 보이는지
2. [ ] 프로필 → **로그인하기** — 로그인 폼 표시
3. [ ] 피드 → 루트 카드 → **상세** 진입
4. [ ] 하트·별 **아이콘** 표시
5. [ ] **카카오로 시작하기** (Redirect URL 등록 후)
6. [ ] 장소 검색 (Edge Function)
7. [ ] 만들기 탭 — 비커플 시 `CoupleRequiredModal`

---

## 9. Node.js 버전 참고

| 버전 | 2026년 기준 | 이 프로젝트 |
|------|-------------|-------------|
| v24 | LTS | 로컬 `eas build` 가능 (플러그인 제거·`app.config.js` 반영 후) |
| v22 | LTS | `.nvmrc` 권장값 — 새로 설치 시 이쪽 |
| v20 | EOL | 비권장 |

문제 재발 시: `npx expo config` 실패 → Node 22 설치 검토 (`docs/EAS_BUILD.md`).

---

## 10. Cursor / 다른 PC에서 이어하기

- **이 채팅 맥락**은 이 PC Cursor에 묶여 있음 → 다른 노트북에서는 **자동 이어지지 않음**
- **코드**는 Git push/pull로 공유 (`main` 브랜치, 최근 커밋: `level 4 수정중 / apk error 잡는중` 등)
- 새 채팅 시 이 파일(`docs/HANDOFF.md`)을 @로 첨부하거나 아래 한 줄 요약 붙이기:

> RouteJ APK: 스플래시·OAuth 핸들러·kakao 모듈 분리 수정 완료. preview 빌드 후 탭 유지·로그인·루트 상세 QA 필요.

---

## 11. 다음 작업 후보

- [ ] 최신 수정 반영 **preview APK 재빌드** 후 실기기 QA
- [ ] EAS preview에 카카오 env 미등록 시 등록 후 재빌드
- [ ] 카카오 로그인 APK 검증 (`routej://auth/callback`)
- [ ] Node 24에서 `expo-web-browser` 플러그인 재도입 필요 시 → Node 22 환경에서만 시도
- [ ] 미커밋 변경사항 정리 후 commit (OAuth/스플래시 수정분)

---

## 12. 주요 파일 빠른 참조

| 영역 | 경로 |
|------|------|
| 앱 루트·스플래시 | `app/_layout.tsx` |
| OAuth 딥링크 | `components/AuthOAuthLinkHandler.tsx`, `lib/auth-session-core.ts` |
| 카카오 로그인 | `lib/kakao-auth.ts` |
| 로그인 화면 | `app/auth/login.tsx` |
| 루트 상세 | `app/route/[id].tsx` |
| 지도 | `components/RouteMap.tsx` |
| 빌드 설정 | `app.config.js`, `app.json`, `eas.json` |
| EAS 가이드 | `docs/EAS_BUILD.md` |
