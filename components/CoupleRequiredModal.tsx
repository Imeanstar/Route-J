import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StitchButton } from '@/components/stitch/StitchButton';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';

type Props = {
  visible: boolean;
  message: string;
  question: string;
  confirmLabel?: string;
  backLabel?: string;
  onConfirm: () => void;
  onBack: () => void;
};

/** 코스 등록·커플 전용 기능 안내 — Stitch 톤 중앙 모달 */
export function CoupleRequiredModal({
  visible,
  message,
  question,
  confirmLabel = '이동',
  backLabel = '뒤로가기',
  onConfirm,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onBack}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBack} />
        <View style={[styles.card, shadow.card, { marginBottom: insets.bottom }]}>
          <Text style={[type.headlineSm, styles.message]}>{message}</Text>
          <Text style={[type.body, styles.question]}>{question}</Text>
          <View style={styles.actions}>
            <StitchButton label={confirmLabel} onPress={onConfirm} style={styles.btn} />
            <StitchButton label={backLabel} variant="ghost" onPress={onBack} style={styles.btn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}55`,
  },
  message: {
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  question: {
    marginTop: spacing.md,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  btn: { width: '100%' },
});
