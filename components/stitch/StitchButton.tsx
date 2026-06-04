import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radius, shadow, type } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function StitchButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && { opacity: 0.92 },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          type.button,
          variant === 'primary' && { color: colors.onSurface },
          variant === 'secondary' && { color: colors.onSurface },
          variant === 'ghost' && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: colors.primaryContainer,
    ...shadow.card,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
});
