# RouteJ E2E QA 체크리스트

Supabase migration·seed·Storage 적용 후 아래를 순서대로 확인합니다.

## 환경

- [ ] `.env`에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] SQL: `001` → `006` (`docs/SUPABASE_SETUP.md` 참고)
- [ ] `seed.sql` + (권장) `seed_demo_routes.sql` — 공개 루트 15건+
- [ ] Plus·제휴: `005` 적용 후 검색 탭 제휴 목록 노출

## 시나리오

- [ ] 회원가입 → 로그인
- [ ] 커플 코드: 계정 A 생성 코드 → 계정 B 입력 → active
- [ ] 공개 루트 등록 → 피드(탐색) 노출
- [ ] 우리만 보기 → 비회원·타 커플 피드 비노출
- [ ] 비로그인: 홈 10개·필터 시 카테고리당 3개만
- [ ] 좋아요·찜·신고
- [ ] 루트 상세 조회수 증가
- [ ] 사진 업로드 → Storage URL 상세 표시
- [ ] Expo Go / 웹 동일 플로우

## 자동 점검 (선택)

```bash
node scripts/verify-supabase.mjs
```
