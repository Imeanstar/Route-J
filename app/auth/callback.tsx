import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, type } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

/** OAuth(카카오 등) 리다이렉트 처리 */
export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.getSession();
      } finally {
        router.replace('/(tabs)/explore');
      }
    })();
  }, [router]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={type.bodySm}>로그인 처리 중…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
