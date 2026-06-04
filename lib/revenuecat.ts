/**
 * RevenueCat 연동 스텁 — App Store / Play 구독 연동 시 패키지 설치 후 구현.
 * @see https://www.revenuecat.com/docs/getting-started/installation/reactnative
 */
import { Platform } from 'react-native';
import { trackEvent } from '@/lib/analytics';

export const REVENUECAT_ENABLED = Boolean(
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY && Platform.OS !== 'web',
);

export async function initRevenueCat(_userId?: string) {
  if (!REVENUECAT_ENABLED) return;
  trackEvent('plus_purchase_sync');
}

export async function purchasePlusMonthly() {
  return { error: 'RevenueCat API 키 설정 후 스토어 구독이 활성화됩니다.' };
}
