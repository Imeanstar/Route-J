import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, type } from '@/constants/theme';

type Props = {
  label: string;
  active?: boolean;
  variant?: 'filled' | 'outline';
  onPress?: () => void;
};

export function StitchChip({ label, active, variant = 'filled', onPress }: Props) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        outline && styles.chipOutline,
        active && (outline ? styles.chipOutlineActive : styles.chipActive),
        !active && !outline && styles.chipIdle,
      ]}
    >
      <Text
        style={[
          type.chip,
          outline ? styles.textOutline : styles.textFilled,
          active && (outline ? styles.textOutlineActive : styles.textActive),
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function StitchFilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text style={[type.labelMd, styles.rowLabel]}>{label}</Text>
      <View style={styles.rowChips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginRight: 8,
    marginBottom: 8,
  },
  chipIdle: { backgroundColor: colors.surfaceContainer },
  chipActive: { backgroundColor: colors.primaryContainer },
  chipOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipOutlineActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryContainer,
  },
  textFilled: { color: colors.onSurfaceVariant },
  textActive: { color: colors.onPrimaryContainer },
  textOutline: { color: colors.onSurfaceVariant },
  textOutlineActive: { color: colors.onSurface },
  row: { marginBottom: 16 },
  rowLabel: { marginBottom: 8, paddingHorizontal: 4 },
  rowChips: { flexDirection: 'row', flexWrap: 'wrap' },
});
