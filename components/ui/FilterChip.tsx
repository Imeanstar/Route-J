import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, type } from '@/constants/theme';

type Variant = 'filled' | 'outline';

type Props = {
  label: string;
  active?: boolean;
  variant?: Variant;
  onPress: () => void;
};

export function FilterChip({ label, active, variant = 'filled', onPress }: Props) {
  const isFilled = variant === 'filled';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        isFilled
          ? active
            ? styles.filledActive
            : styles.filledIdle
          : active
            ? styles.outlineActive
            : styles.outlineIdle,
      ]}
    >
      <Text
        style={[
          styles.label,
          isFilled
            ? active
              ? styles.labelFilledActive
              : styles.labelFilledIdle
            : active
              ? styles.labelOutlineActive
              : styles.labelOutlineIdle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  filledActive: { backgroundColor: colors.primaryContainer },
  filledIdle: { backgroundColor: colors.surfaceContainer },
  outlineActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
  },
  outlineIdle: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  label: { ...type.chip },
  labelFilledActive: { color: colors.onPrimaryContainer, fontWeight: '700' },
  labelFilledIdle: { color: colors.onSurfaceVariant },
  labelOutlineActive: { color: colors.onSurface, fontWeight: '600' },
  labelOutlineIdle: { color: colors.onSurfaceVariant },
});
