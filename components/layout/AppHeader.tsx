import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/components/AppIcon';
import { BrandLogo } from '@/components/BrandLogo';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

type Props = {
  showLogin?: boolean;
  showFeedActions?: boolean;
};

export function AppHeader({ showLogin = true, showFeedActions }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tier } = useAuth();

  let right: ReactNode = null;
  if (showFeedActions) {
    right = (
      <View style={styles.actions}>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/(tabs)/search')}>
          <AppIcon name="search" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <AppIcon name="notifications" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
    );
  } else if (showLogin && tier === 'guest') {
    right = (
      <Pressable
        style={({ pressed }) => [styles.loginBtn, pressed && styles.pressed]}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.loginText}>로그인</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <BrandLogo size={32} />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.85)' : colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minHeight: 40,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9 },
  loginText: { ...type.chip, color: colors.onPrimary, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
