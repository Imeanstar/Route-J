import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VISIBILITY_LABELS } from '@/constants/app';
import { colors, spacing, touch, type } from '@/constants/theme';
import type { Route } from '@/types/database';

type Props = {
  route: Route;
  onPress: () => void;
  showVisibility?: boolean;
  isLast?: boolean;
};

/** 카드-in-카드 지양: 리스트 행 + 하단 구분선 */
export function RouteCard({ route, onPress, showVisibility, isLast }: Props) {
  const isPrivate = route.visibility === 'couple_only';

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.main}>
        {showVisibility && isPrivate && (
          <Text style={styles.privateTag}>{VISIBILITY_LABELS[route.visibility]}</Text>
        )}
        <Text style={[type.h2, styles.title]} numberOfLines={2}>
          {route.title}
        </Text>
        {route.description ? (
          <Text style={[type.bodySoft, styles.desc]} numberOfLines={2}>
            {route.description}
          </Text>
        ) : null}
        <Text style={type.meta}>
          좋아요 {route.like_count} · 조회 {route.view_count}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touch.minHeight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pressed: { opacity: 0.88 },
  main: { flex: 1, paddingRight: spacing.sm },
  privateTag: {
    ...type.meta,
    color: colors.primaryInk,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: { marginBottom: spacing.xs },
  desc: { marginBottom: spacing.xs },
  chevron: {
    fontSize: 22,
    color: colors.inkFaint,
    fontWeight: '300',
    paddingHorizontal: spacing.xs,
  },
});
