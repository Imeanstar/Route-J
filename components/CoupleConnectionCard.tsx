import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StitchButton } from '@/components/stitch/StitchButton';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { formatDateKo } from '@/lib/format';
import type { CoupleSummary } from '@/lib/couple';

type Props = {
  summary: CoupleSummary | null;
  loading?: boolean;
  onOurRoutes?: () => void;
};

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function CoupleConnectionCard({ summary, loading, onOurRoutes }: Props) {
  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.card}>
        <Text style={type.bodySm}>연결 정보를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, shadow.card]}>
      <Text style={type.headlineMd}>
        {summary.partnerName}과 연결되었습니다
      </Text>
      <Text style={styles.sub}>
        둘이 만든 데이트 코스를 기록하고, 공개·우리만 보기로 나눌 수 있어요.
      </Text>

      <View style={styles.stats}>
        <StatRow label="연결된 일자" value={formatDateKo(summary.connectedAt)} />
        <StatRow label="우리가 함께한 기록" value={`${summary.routeCount}건`} />
        <StatRow
          label="공개 · 우리만 보기"
          value={`${summary.publicCount}건 · ${summary.coupleOnlyCount}건`}
        />
        <StatRow label="연결 코드" value={summary.inviteCode} />
      </View>

      <Text style={styles.hint}>
        첫 데이트 코스를 올리면 피드에 공개하고, 우리만 보기로 둘만의 기록을 남길 수 있어요.
      </Text>

      {onOurRoutes ? (
        <StitchButton label="우리 루트 보기" onPress={onOurRoutes} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  center: { alignItems: 'center', paddingVertical: spacing.xl },
  sub: { ...type.bodySm, marginTop: spacing.sm, color: colors.onSurfaceVariant },
  stats: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: { ...type.labelMd, color: colors.outline },
  rowValue: { ...type.labelMd, fontWeight: '600', color: colors.onSurface },
  hint: {
    ...type.bodySm,
    marginTop: spacing.md,
    color: colors.outline,
    lineHeight: 20,
  },
  cta: { marginTop: spacing.md },
});
