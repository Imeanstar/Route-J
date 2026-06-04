import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, touch, type } from '@/constants/theme';

export function GuestBanner() {
  const router = useRouter();
  return (
    <GradientSurface style={styles.hero}>
      <View style={styles.kicker}>
        <Ionicons name="sparkles" size={13} color={colors.primaryInk} />
        <Text style={styles.kickerText}>오늘은 어디로 갈까요?</Text>
      </View>

      <Text style={[type.hero, styles.headline]}>
        둘만의 <Text style={styles.accentWord}>데이트 코스</Text>,{'\n'}한 줄로 저장하고 공유해요.
      </Text>

      <Text style={styles.sub}>
        지역·역·테마로 찾아보고, 마음에 드는 동선은 나중에 우리 루트로 남길 수 있어요.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그인하고 전체 루트 보기"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() => router.push('/auth/login')}
      >
        <Ionicons name="heart" size={16} color="#FFFFFF" />
        <Text style={styles.ctaText}>로그인하고 전체 루트 보기</Text>
      </Pressable>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  kickerText: { ...type.meta, fontSize: 14, color: colors.ink, fontWeight: '600' },
  headline: { marginBottom: spacing.md },
  accentWord: { color: colors.primary },
  sub: {
    ...type.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.inkSoft,
    marginBottom: spacing.lg,
    maxWidth: 400,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    minHeight: touch.minHeight,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  ctaPressed: { backgroundColor: colors.primaryPress, opacity: 0.95 },
  ctaText: { ...type.button, fontSize: 15, color: '#FFFFFF' },
});
