import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, touch, type } from '@/constants/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touch.minHeight,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: { opacity: 0.9 },
  label: { ...type.meta, fontSize: 14, color: colors.inkSoft },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
});
