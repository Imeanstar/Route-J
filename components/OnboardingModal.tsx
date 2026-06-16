import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { colors, radius, spacing, type } from '@/constants/theme';
import { ONBOARDING_STEPS, completeOnboarding } from '@/lib/onboarding';
import { trackEvent } from '@/lib/analytics';

type Props = {
  visible: boolean;
  onDone: () => void;
};

function OnboardingContent({
  step,
  setStep,
  onDone,
}: {
  step: number;
  setStep: (fn: (s: number) => number) => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const current = ONBOARDING_STEPS[step];
  const isLast = step >= ONBOARDING_STEPS.length - 1;

  const finish = async () => {
    await completeOnboarding();
    trackEvent('onboarding_complete');
    onDone();
  };

  return (
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
  );
}

export function OnboardingModal({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);

  if (!visible) return null;

  /** Android APK: RN Modal이 전체 화면 흰 창으로 탭을 덮는 경우가 있음 → 네이티브는 오버레이 View */
  if (Platform.OS === 'web') {
    return (
      <Modal visible animationType="slide" transparent>
        <OnboardingContent step={step} setStep={setStep} onDone={onDone} />
      </Modal>
    );
  }

  return (
    <View style={styles.nativeHost} pointerEvents="box-none">
      <OnboardingContent step={step} setStep={setStep} onDone={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
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
