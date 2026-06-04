import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, spacing, type } from '@/constants/theme';
import type { UserTier } from '@/types/database';

type Props = {
  tier: UserTier;
  onPrimary: () => void;
};

const COPY: Record<
  UserTier,
  { title: string; sub: string; label: string }
> = {
  guest: {
    title: '아직 등록된 루트가 없어요',
    sub: '로그인하면 더 많은 데이트 코스를 볼 수 있어요.',
    label: '로그인하고 시작하기',
  },
  member: {
    title: '아직 등록된 루트가 없어요',
    sub: '커플을 연결하면 나만의 루트를 만들고 공유할 수 있어요.',
    label: '커플 연결하기',
  },
  couple: {
    title: '아직 등록된 루트가 없어요',
    sub: '첫 데이트 코스를 올리면 다른 커플도 참고할 수 있어요.',
    label: '첫 루트 올리기',
  },
};

/** 빈 상태: tier별 다음 행동 */
export function EmptyRoutes({ tier, onPrimary }: Props) {
  const copy = COPY[tier];
  return (
    <View style={styles.wrap}>
      <Text style={[type.titleSerif, styles.title]}>{copy.title}</Text>
      <Text style={[type.bodySoft, styles.sub]}>{copy.sub}</Text>
      <Button label={copy.label} size="sm" onPress={onPrimary} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: spacing.sm,
  },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  sub: { textAlign: 'center', marginBottom: spacing.lg, maxWidth: 280 },
  btn: { paddingHorizontal: spacing.xl },
});
