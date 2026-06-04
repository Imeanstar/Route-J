import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { APP_NAME } from '@/constants/app';
import { colors, radius, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export function HeaderBrand() {
  return (
    <View style={styles.brandRow}>
      <View style={styles.mark}>
        <Ionicons name="navigate" size={15} color="#FFFFFF" />
      </View>
      <Text style={type.brand}>{APP_NAME}</Text>
    </View>
  );
}

export function HeaderLogin() {
  const { tier } = useAuth();
  const router = useRouter();
  if (tier !== 'guest') return null;
  return (
    <Pressable
      style={({ pressed }) => [styles.loginBtn, pressed && styles.loginPressed]}
      onPress={() => router.push('/auth/login')}
    >
      <Text style={styles.loginText}>로그인</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mark: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    marginRight: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  loginPressed: { backgroundColor: colors.primaryPress },
  loginText: { ...type.meta, color: '#FFFFFF', fontWeight: '700' },
});
