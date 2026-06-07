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

/** 좌표가 있는 스탑으로 카카오맵 도보 길찾기(2곳 이상) 또는 장소 보기 */
export function kakaoMapRouteUrl(
  stops: { place_name: string; lat?: number | null; lng?: number | null; address?: string | null }[],
) {
  const withCoords = stops.filter(
    (s): s is typeof s & { lat: number; lng: number } =>
      s.lat != null && s.lng != null && !Number.isNaN(s.lat) && !Number.isNaN(s.lng),
  );

  if (withCoords.length >= 2) {
    const parts = withCoords.flatMap((s) => [
      encodeURIComponent(s.place_name),
      s.lng,
      s.lat,
    ]);
    return `https://map.kakao.com/link/roadWalk/${parts.join(',')}`;
  }

  const first = withCoords[0] ?? stops[0];
  if (!first) return kakaoMapSearchUrl('서울');
  return kakaoMapPlaceUrl(first.place_name, first.address ?? undefined);
}
