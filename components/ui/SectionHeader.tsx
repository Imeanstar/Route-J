import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={type.sectionLabel}>{title}</Text>
      {subtitle ? <Text style={[type.meta, styles.sub]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sub: { color: colors.inkFaint },
});
