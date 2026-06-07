import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export {
  createSessionFromUrl,
  getAuthRedirectUri,
  isAuthCallbackUrl,
  openOAuthUrlOnWeb,
} from '@/lib/auth-session-core';

/** 카카오 로그인 직전에만 호출 — 앱 시작 시 호출하면 Android APK 스플래시에서 멈출 수 있음 */
export async function prepareOAuthBrowser(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    WebBrowser.maybeCompleteAuthSession();
    await WebBrowser.dismissBrowser();
    await WebBrowser.warmUpAsync();
  } catch {
    /* ignore */
  }
}

export async function finishOAuthBrowser(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await WebBrowser.coolDownAsync();
  } catch {
    /* ignore */
  }
}
