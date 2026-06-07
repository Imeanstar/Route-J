# 카카오 장소 검색 (루트 등록)

인스타 장소 태그처럼 **카카오 로컬 API**로 가게·장소를 검색해 `place_name`, `address`, `lat`, `lng`를 채웁니다.

> **기존 카카오맵 링크** (`lib/kakao.ts`의 `kakaoMapPlaceUrl`)는 공식 Map SDK가 아니라  
> `https://map.kakao.com/link/search/...` **웹 URL**입니다. Phase 1 로드맵에서 상세 화면「지도 열기」용으로 넣어 둔 것이며, 사용자가 따로 준 API가 아닙니다.

## 1. 카카오 개발자 앱

1. [developers.kakao.com](https://developers.kakao.com) → **내 애플리케이션** 선택
2. **앱 키 → REST API 키** 복사 (자바스크립트 키·네이티브 키 아님)
3. **제품 설정**에서 아래 API **상태 ON** (403의 가장 흔한 원인)
   - **카카오맵** → 활성화 설정 **ON**
   - 또는 **로컬(Local)** API 사용 허용 **ON**  
   (콘솔 UI에 따라 「OPEN_MAP_AND_LOCAL」/ 「로컬」 메뉴명으로 표시됨)
4. (권장) 플랫폼에 Android 패키지 `com.routej.app`, iOS 번들 ID 등록

## 2. Supabase Edge Function (권장 · APK용)

REST 키는 앱에 넣지 않고 서버에만 둡니다.

```bash
cd route-j
npx supabase login
npx supabase link --project-ref mzqlnhvanubhkixggpvh
npx supabase secrets set KAKAO_REST_API_KEY=여기에_REST_API_키
npx supabase functions deploy search-places
```

> **secret 설정 후**에도 검색이 안 되면 `search-places`를 **한 번 더 deploy**하세요.  
> `supabase/config.toml`에 `verify_jwt = false`가 있어 로그인 없이 웹에서도 호출됩니다.  
> 여전히 실패하면 앱 화면에 **실제 서버 오류 문구**가 표시됩니다 (예: 카카오 API 403, secret 미설정).

앱은 `supabase.functions.invoke('search-places', { body: { query: '성수 카페' } })` 로 호출합니다.

## 3. 로컬 개발 (선택)

Edge Function 없이 빠르게 테스트:

```env
EXPO_PUBLIC_KAKAO_REST_API_KEY=카카오_REST_API_키
```

`npx expo start --clear` 후 루트 등록 → **장소 검색**.

## 4. 앱에서 쓰는 방법

1. **새 데이트 코스 등록** → 코스 경로 → **장소 검색**
2. 2글자 이상 입력 → 결과 탭 → 이름·주소·좌표 자동 입력
3. 주소·이름은 여전히 직접 수정 가능

## 5. Route Map (상세 화면)

- `EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY` — 카카오맵 JS SDK (웹·앱 WebView)
- 개발자 콘솔: **카카오맵 ON**, 웹 테스트 시 `http://localhost:8081` 도메인 등록
- 스탑 `lat/lng`가 있으면 마커 + 직선 코스 polyline 표시

## 6. API 한도

카카오 로컬 API는 일일 호출 한도가 있습니다. 트래픽이 늘면 캐시·debounce(앱에 350ms 적용됨)를 유지하세요.
