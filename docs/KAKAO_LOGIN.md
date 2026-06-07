# 카카오 로그인 (Supabase Auth)

Expo 앱 ↔ Supabase ↔ 카카오 3곳 설정이 **모두** 맞아야 합니다.  
한 곳만 빠져도 403·redirect mismatch·토큰 없음으로 며칠 헤맬 수 있어요.

## 체크리스트 (순서대로)

### 1. 카카오 개발자 콘솔

[developers.kakao.com](https://developers.kakao.com) → 앱 선택

1. **제품 설정 → 카카오 로그인 → 활성화 ON**
2. **Redirect URI** 등록 (카카오 → Supabase로 돌아가는 주소, **앱 scheme 아님**)
   ```
   https://mzqlnhvanubhkixggpvh.supabase.co/auth/v1/callback
   ```
   (`mzqlnhvanubhkixggpvh` = 본인 프로젝트 ref)
3. **카카오 로그인 → 보안 → Client Secret** → **코드 활성화 ON** → Secret 복사
4. **동의항목**: 닉네임·프로필 사진(선택) 최소 설정
5. **플랫폼**
   - Android: 패키지 `com.routej.app`
   - iOS: 번들 `com.routej.app`
   - Web: `http://localhost:8081` (개발용)

### 2. Supabase Dashboard

**Authentication → Providers → Kakao**

| 필드 | 값 |
|------|-----|
| Enable | ON |
| Client ID | 카카오 **REST API 키** |
| Client Secret | 카카오 **Client Secret** (위 1-3) |

**Authentication → URL Configuration → Redirect URLs**

`routej://auth/callback` 이 **없으면** APK에서 카카오 로그인 후 **흰 화면·뒤로가기 불가**가 날 수 있습니다. 아래를 **모두** 추가 (개발·APK·웹):

```
routej://auth/callback
http://localhost:8081/auth/callback
```

Expo Go 개발 시 터미널/브라우저 콘솔에 찍히는 값도 추가:

```
[Kakao OAuth] redirectTo: exp://192.168.x.x:8081/--/auth/callback
```

→ Supabase에 **그 문자열 그대로** 한 줄 추가 (IP 바뀌면 다시 추가)

**Site URL** (웹 OAuth): `http://localhost:8081` (개발)

### 3. DB (카카오 닉네임·프로필)

```bash
# SQL Editor 또는
supabase/migrations/010_kakao_profile.sql
```

### 4. 앱에서 테스트

```bash
npx expo start --clear
```

1. 로그인 → **카카오로 시작하기**
2. 개발 모드: Metro 로그에서 `redirectTo` 확인 → Supabase에 없으면 추가
3. **웹**: 카카오 로그인 후 `/auth/callback` 으로 돌아오면 성공
4. **Expo Go / APK**: 인앱 브라우저 닫힌 뒤 프로필 tier `member` 확인

---

## 자주 막히는 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| `redirect_uri mismatch` | 카카오 Redirect URI ≠ Supabase callback URL | 카카오에 `https://REF.supabase.co/auth/v1/callback` |
| 로그인 후 토큰 없음 | Supabase Redirect URLs에 `routej://` 또는 `exp://` 누락 | 콘솔 `redirectTo` 복사해 추가 |
| Provider 401/403 | Client Secret 미설정·비활성 | 카카오에서 Secret 활성화 후 Supabase에 입력 |
| `Database error saving new user` | profiles 트리거/RLS | `007_auth_profile_fix.sql`, `010_kakao_profile.sql` 적용 |
| 웹만 안 됨 | Site URL / localhost 미등록 | Supabase Site URL + Kakao Web 도메인 |

---

## 코드 구조

| 파일 | 역할 |
|------|------|
| `lib/auth-session.ts` | redirect URI, `WebBrowser` OAuth, 세션 교환 |
| `lib/kakao.ts` | `signInWithKakao()` |
| `app/auth/callback.tsx` | 웹·딥링크 콜백 처리 |
| `app.json` `scheme` | `routej` (APK 딥링크) |

앱에 카카오 **REST 키를 넣을 필요 없음** — Supabase Provider에만 넣습니다.
