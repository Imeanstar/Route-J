import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GradientSurface } from '@/components/ui/GradientSurface';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, touch, type } from '@/constants/theme';

export function CoupleConnectBanner() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <GradientSurface style={styles.box}>
        <View style={styles.kicker}>
          <Ionicons name="heart" size={13} color={colors.primaryInk} />
          <Text style={styles.kickerText}>커플 연결 후 작성 가능</Text>
        </View>
        <Text style={[type.titleSerif, styles.title]}>첫 데이트 루트를{'\n'}함께 올려볼까요?</Text>
        <Text style={styles.sub}>6자리 코드로 1:1 연결하면 우리만 보는 루트도 만들 수 있어요.</Text>
      </GradientSurface>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="커플 연결 화면으로 이동"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() => router.push('/couple/connect')}
      >
        <Text style={styles.ctaText}>커플 연결하러 가기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  box: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  kickerText: { ...type.meta, fontSize: 14, color: colors.primaryInk, fontWeight: '600' },
  title: { marginBottom: spacing.sm },
  sub: { ...type.bodySoft, color: colors.inkSoft },
  cta: {
    minHeight: touch.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  ctaPressed: { backgroundColor: colors.primaryPress, opacity: 0.95 },
  ctaText: { ...type.button, fontSize: 15, color: '#FFFFFF' },
});
