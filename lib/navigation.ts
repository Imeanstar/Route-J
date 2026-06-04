import type { Router } from 'expo-router';

/** 스택에 이전 화면이 없으면 fallback으로 복귀 */
export function safeGoBack(
  router: Router,
  fallbackHref: '/(tabs)/explore' | '/(tabs)/profile' = '/(tabs)/explore',
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
