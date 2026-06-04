import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import type { PartnerBenefit } from '@/lib/partners';

type Props = {
  benefit: PartnerBenefit;
  isPlus: boolean;
  onRedeem: (benefit: PartnerBenefit) => void;
};

export function PartnerBenefitRow({ benefit, isPlus, onRedeem }: Props) {
  return (
    <Pressable
      style={[styles.row, shadow.soft]}
      onPress={() => onRedeem(benefit)}
      disabled={benefit.plus_only && !isPlus}
    >
      <View style={styles.icon}>
        <MaterialIcons name="local-offer" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.labelMd}>{benefit.venue_name ?? benefit.title}</Text>
        <Text style={type.bodySm} numberOfLines={2}>
          {benefit.discount_label} · {benefit.description}
        </Text>
        {benefit.region_name ? (
          <Text style={styles.region}>{benefit.region_name}</Text>
        ) : null}
      </View>
      {benefit.plus_only ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Plus</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  region: { ...type.labelSm, color: colors.outline, marginTop: 4 },
  badge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { ...type.labelSm, color: colors.onSecondaryContainer, fontWeight: '700' },
});
