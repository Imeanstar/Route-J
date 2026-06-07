import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { colors, spacing, type } from '@/constants/theme';
import { createSessionFromUrl } from '@/lib/auth-session-core';
import { supabase } from '@/lib/supabase';

/** OAuth(카카오 등) 리다이렉트 — 토큰·code를 세션으로 교환 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let callbackUrl = '';
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          callbackUrl = window.location.href;
        } else {
          callbackUrl = (await Linking.getInitialURL()) ?? '';
        }

        if (callbackUrl) {
          const { error: sessionError } = await createSessionFromUrl(callbackUrl, {
            allowExistingSession: true,
          });
          if (sessionError) {
            setError(sessionError);
            return;
          }
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setError('로그인 응답을 받지 못했습니다. 다시 시도해 주세요.');
            return;
          }
        }

        try {
          const WebBrowser = await import('expo-web-browser');
          await WebBrowser.dismissBrowser();
        } catch {
          /* ignore */
        }

        router.replace('/(tabs)/profile');
      } catch (e) {
        setError(e instanceof Error ? e.message : '로그인 처리 실패');
      }
    })();
  }, [router]);

  if (error) {
    return (
      <View style={styles.wrap}>
        <Text style={[type.labelMd, styles.errorTitle]}>로그인 실패</Text>
        <Text style={[type.bodySm, styles.errorMsg]}>{error}</Text>
        <StitchButton label="로그인 화면으로" onPress={() => router.replace('/auth/login')} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={type.bodySm}>로그인 처리 중…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: spacing.gutter,
  },
  errorTitle: { color: colors.error },
  errorMsg: { textAlign: 'center', color: colors.outline, marginBottom: spacing.md },
});
