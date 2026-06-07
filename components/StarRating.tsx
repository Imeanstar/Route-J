import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { AppIcon } from '@/components/AppIcon';
import { colors, type } from '@/constants/theme';

type DisplayProps = {
  rating: number;
  size?: number;
  showValue?: boolean;
  style?: TextStyle;
};

/** 읽기 전용 별점 — ★/☆ 유니코드 대신 아이콘 */
export function StarRatingDisplay({ rating, size = 14, showValue, style }: DisplayProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <AppIcon
          key={n}
          name="star"
          size={size}
          color={n <= rating ? colors.warning : colors.outlineVariant}
          filled={n <= rating}
        />
      ))}
      {showValue ? <Text style={[styles.value, style]}>({rating})</Text> : null}
    </View>
  );
}

type InputProps = {
  value?: number;
  onChange: (n: number | undefined) => void;
  hint?: string;
};

/** 코스 등록 별점 입력 */
export function StarRatingInput({ value, onChange, hint = '별점 (선택)' }: InputProps) {
  return (
    <View style={styles.inputRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(value === n ? undefined : n)} hitSlop={6}>
          <AppIcon
            name="star"
            size={22}
            color={(value ?? 0) >= n ? colors.warning : colors.outlineVariant}
            filled={(value ?? 0) >= n}
          />
        </Pressable>
      ))}
      <Text style={styles.hint}>{value ? `${value}점` : hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { marginLeft: 4, color: colors.warning, fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  hint: { ...type.bodySm, marginLeft: 8, color: colors.outline },
});
