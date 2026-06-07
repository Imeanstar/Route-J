import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import {
  createSessionFromUrl,
  finishOAuthBrowser,
  getAuthRedirectUri,
  openOAuthUrlOnWeb,
  prepareOAuthBrowser,
} from '@/lib/auth-session';

/** Supabase Dashboard → Auth → Kakao + Redirect URL 설정 필요 (docs/KAKAO_LOGIN.md) */
export async function signInWithKakao(): Promise<{ error: string | null; cancelled?: boolean }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase가 설정되지 않았습니다.' };
  }

  trackEvent('kakao_login_attempt');
  const redirectTo = getAuthRedirectUri();

  if (__DEV__) {
    console.log('[Kakao OAuth] redirectTo:', redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: 'OAuth URL을 받지 못했습니다.' };

  if (Platform.OS === 'web') {
    openOAuthUrlOnWeb(data.url);
    return { error: null };
  }

  await prepareOAuthBrowser();

  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      showInRecents: true,
      ...(Platform.OS === 'android' ? { createTask: false } : {}),
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { error: null, cancelled: true };
    }

    if (result.type !== 'success' || !result.url) {
      return {
        error:
          '카카오 로그인이 완료되지 않았습니다. Supabase Redirect URLs에 routej://auth/callback 이 있는지 확인해 주세요.',
      };
    }

    const session = await createSessionFromUrl(result.url);
    return { error: session.error };
  } finally {
    await finishOAuthBrowser();
  }
}

/** 개발·설정용 — Supabase Redirect URLs에 등록할 값 */
export function kakaoOAuthRedirectUri(): string {
  return getAuthRedirectUri();
}
