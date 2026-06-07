import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { createSessionFromUrl, isOAuthReturnUrl } from '@/lib/auth-session-core';

/**
 * 카카오 로그인 후 앱으로 돌아올 때만 동작.
 * 잘못된 callback URL로 router.replace 하면 탭이 사라지고 흰 화면이 됨 → payload 있을 때만 처리.
 */
export function AuthOAuthLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (!isOAuthReturnUrl(url)) return;

      const { error, handled } = await createSessionFromUrl(url);
      if (!handled || error) return;

      try {
        const WebBrowser = await import('expo-web-browser');
        await WebBrowser.dismissBrowser();
      } catch {
        /* ignore */
      }

      router.replace('/(tabs)/explore');
    };

    Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });

    const sub = Linking.addEventListener('url', (event) => {
      void handleUrl(event.url);
    });

    return () => sub.remove();
  }, [router]);

  return null;
}
