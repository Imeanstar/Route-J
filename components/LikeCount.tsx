import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { AppIcon } from '@/components/AppIcon';
import { colors, type } from '@/constants/theme';

type Props = {
  count: number;
  color?: string;
  textStyle?: TextStyle;
  iconSize?: number;
};

/** 커스텀 폰트에서 ♥ 글리프가 비는 APK 대비 — Ionicons 하트 사용 */
export function LikeCount({ count, color = '#fff', textStyle, iconSize = 12 }: Props) {
  return (
    <View style={styles.row}>
      <AppIcon name="heart" size={iconSize} color={color} filled />
      <Text style={[type.labelSm, styles.count, { color }, textStyle]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { color: colors.onSurface },
});
