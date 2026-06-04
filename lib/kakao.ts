import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

/** Supabase Dashboard → Auth → Kakao 활성화 후 동작 */
export async function signInWithKakao(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase가 설정되지 않았습니다.' };
  }
  trackEvent('kakao_login_attempt');
  const redirectTo = Linking.createURL('/auth/callback');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });
  return { error: error?.message ?? null };
}

/** 카카오맵 장소 검색 URL (앱 딥링크 대체) */
export function kakaoMapSearchUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://map.kakao.com/?q=${q}`;
}

export function kakaoMapPlaceUrl(placeName: string, address?: string) {
  const q = encodeURIComponent(address ? `${placeName} ${address}` : placeName);
  return `https://map.kakao.com/link/search/${q}`;
}
