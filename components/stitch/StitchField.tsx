import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, inputFontFamily, radius, spacing, type } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  multiline?: boolean;
};

export function StitchField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={type.labelMd}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.outline}
        style={[styles.input, rest.multiline && styles.multiline, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  input: {
    ...type.body,
    fontFamily: inputFontFamily,
    marginTop: spacing.sm,
    backgroundColor: colors.subtleGray,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
