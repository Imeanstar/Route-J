import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

/** WebBrowser 없음 — 앱 시작 시 import 해도 APK가 멈추지 않음 */

export function isAuthCallbackUrl(url: string): boolean {
  return /auth\/callback/i.test(url);
}

/** 실제 OAuth 응답(code·token·error)이 있을 때만 처리 — 빈 callback URL로 화면이 바뀌는 APK 버그 방지 */
export function isOAuthReturnUrl(url: string): boolean {
  if (!isAuthCallbackUrl(url)) return false;
  return (
    /[?&#](code|access_token|error)=/i.test(url) ||
    /error_description=/i.test(url) ||
    /#.*access_token=/i.test(url)
  );
}

export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'routej',
    path: 'auth/callback',
  });
}

export type SessionFromUrlResult = {
  error: string | null;
  /** true면 URL에서 OAuth payload를 실제로 처리함 */
  handled: boolean;
};

export async function createSessionFromUrl(
  url: string,
  options?: { allowExistingSession?: boolean },
): Promise<SessionFromUrlResult> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    return { error: decodeURIComponent(errorCode), handled: true };
  }

  const oauthError = params.error_description ?? params.error;
  if (oauthError) {
    return { error: String(oauthError), handled: true };
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    return { error: error?.message ?? null, handled: true };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    return { error: error?.message ?? null, handled: true };
  }

  if (options?.allowExistingSession) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return { error: null, handled: true };
  }

  return {
    error: '로그인 응답을 처리하지 못했습니다. Supabase Redirect URL 설정을 확인해 주세요.',
    handled: false,
  };
}

export function openOAuthUrlOnWeb(oauthUrl: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(oauthUrl);
  }
}
