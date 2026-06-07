import type { Router } from 'expo-router';
import type { UserTier } from '@/types/database';

export const HOME_HREF = '/(tabs)/explore' as const;

/** 커플만 등록 화면 — 그 외는 만들기 탭(모달)으로 */
export function openRouteCreate(router: Router, tier: UserTier): boolean {
  if (tier === 'couple') {
    router.push('/route/create');
    return true;
  }
  router.push('/(tabs)/create');
  return false;
}

export function canCreateRoute(tier: UserTier): boolean {
  return tier === 'couple';
}

/** 이전 화면으로 — 히스토리 없으면(강력 새로고침 등) 홈(피드)으로 */
export function safeGoBack(
  router: Router,
  fallbackHref: typeof HOME_HREF | '/(tabs)/profile' = HOME_HREF,
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}

export type OurRoutesFrom = 'profile' | 'couple';

export const OUR_ROUTES_PATH = '/our/routes' as const;

export function openOurRoutes(router: Router, from: OurRoutesFrom) {
  router.push({ pathname: OUR_ROUTES_PATH, params: { from } });
}

/** 우리 루트는 탭이 아니라 스택 화면 — back() 쓰면 피드로 갈 수 있어서 from 기준으로만 이동 */
export function leaveOurRoutes(router: Router, from?: string) {
  if (from === 'couple') {
    router.replace('/couple/connect');
    return;
  }
  router.replace('/(tabs)/profile');
}
