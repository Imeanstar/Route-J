import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { REVENUECAT_ENABLED } from '@/lib/revenuecat';

export function usePlus() {
  const { couple, tier } = useAuth();
  const [isPlus, setIsPlus] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || tier !== 'couple') {
      setIsPlus(false);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc('get_my_plus_status');
    if (!error) setIsPlus(!!data);
    setLoading(false);
  }, [tier]);

  useEffect(() => {
    refresh();
  }, [refresh, couple?.id]);

  const openPlusInfo = useCallback(() => {
    trackEvent('plus_info_open');
    const payNote = REVENUECAT_ENABLED
      ? '앱 스토어에서 구독을 시작할 수 있습니다.'
      : '스토어 IAP(RevenueCat) 연동 전에는 운영자가 수동으로 Plus를 부여할 수 있습니다.';
    Alert.alert(
      'RouteJ Plus',
      `제휴 매장 할인 쿠폰, 카카오맵 경로·공유 등이 포함됩니다.\n\n${payNote}\n문의: support@routej.app`,
      [{ text: '확인' }],
    );
  }, []);

  const redeemBenefit = useCallback(
    async (benefitId: string, couponCode?: string | null) => {
      if (!isPlus) {
        openPlusInfo();
        return { error: 'Plus 구독이 필요합니다.' };
      }
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) return { error: '로그인이 필요합니다.' };

      const { error } = await supabase.from('benefit_redemptions').insert({
        benefit_id: benefitId,
        user_id: uid,
      });

      if (error) return { error: error.message };

      trackEvent('benefit_redeem', { benefitId });
      Alert.alert(
        '쿠폰',
        couponCode ? `매장에서 코드를 보여주세요: ${couponCode}` : '매장 직원에게 RouteJ Plus임을 알려주세요.',
      );
      return { error: null };
    },
    [isPlus, openPlusInfo],
  );

  return { isPlus, loading, refresh, openPlusInfo, redeemBenefit };
}

/** RevenueCat 연동 시 이 함수에서 구매 복원 */
export async function syncPlusFromPurchase(_customerInfo: unknown) {
  if (Platform.OS === 'web') return;
  trackEvent('plus_purchase_sync');
}
