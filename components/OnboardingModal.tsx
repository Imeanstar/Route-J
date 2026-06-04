import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { colors, radius, spacing, type } from '@/constants/theme';
import { ONBOARDING_STEPS, completeOnboarding } from '@/lib/onboarding';
import { trackEvent } from '@/lib/analytics';

type Props = {
  visible: boolean;
  onDone: () => void;
};

export function OnboardingModal({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const current = ONBOARDING_STEPS[step];
  const isLast = step >= ONBOARDING_STEPS.length - 1;

  const finish = async () => {
    await completeOnboarding();
    trackEvent('onboarding_complete');
    onDone();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={type.headlineMd}>{current.title}</Text>
          <Text style={[type.body, styles.body]}>{current.body}</Text>
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          {isLast ? (
            <>
              <StitchButton label="피드 둘러보기" onPress={finish} />
              <StitchButton
                label="로그인하기"
                variant="secondary"
                onPress={async () => {
                  await finish();
                  router.push('/auth/login');
                }}
              />
            </>
          ) : (
            <StitchButton label="다음" onPress={() => setStep((s) => s + 1)} />
          )}
          <Pressable onPress={finish} style={styles.skip}>
            <Text style={type.labelMd}>건너뛰기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,27,43,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  body: { color: colors.onSurfaceVariant },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.outlineVariant },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  skip: { alignSelf: 'center', padding: spacing.sm },
});
