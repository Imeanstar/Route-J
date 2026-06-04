import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/constants/theme';
import { StitchLogo } from './StitchLogo';

type FeedProps = {
  variant: 'feed';
  onSearch?: () => void;
  onNotifications?: () => void;
};

/** 탭 화면(검색·프로필 등) — 로고만, 햄버거 없음 */
type BrandProps = {
  variant: 'brand';
};

type BackProps = {
  variant: 'back';
  title: string;
  onBack: () => void;
  onMore?: () => void;
};

export type StitchHeaderProps = FeedProps | BrandProps | BackProps;

export function StitchHeader(props: StitchHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {props.variant === 'feed' && (
          <>
            <View style={styles.brand}>
              <StitchLogo size={32} />
              <Text style={styles.brandText}>RouteJ</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.iconBtn} onPress={props.onSearch}>
                <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={props.onNotifications}>
                <MaterialIcons name="notifications-none" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </>
        )}
        {props.variant === 'brand' && (
          <View style={styles.brand}>
            <StitchLogo size={32} />
            <Text style={styles.brandText}>RouteJ</Text>
          </View>
        )}
        {props.variant === 'back' && (
          <>
            <Pressable
              style={styles.iconBtn}
              onPress={props.onBack}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
              hitSlop={12}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </Pressable>
            <Text
              style={[styles.backTitle, props.title.length < 24 && styles.backTitlePrimary]}
              numberOfLines={1}
            >
              {props.title}
            </Text>
            {props.onMore ? (
              <Pressable
                style={styles.iconBtn}
                onPress={props.onMore}
                accessibilityRole="button"
                accessibilityLabel="더보기"
                hitSlop={12}
              >
                <MaterialIcons name="more-vert" size={24} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={styles.spacer} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

export function stitchHeaderHeight(insetsTop: number) {
  return insetsTop + 64;
}

/** 상단 바와 스크롤 본문 사이 여백 */
export const stitchHeaderContentGap = spacing.lg;

/** 고정 헤더 아래 콘텐츠 시작 위치 (paddingTop / marginTop) */
export function stitchContentTopInset(insetsTop: number) {
  return stitchHeaderHeight(insetsTop) + stitchHeaderContentGap;
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandText: { ...type.brand },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8 },
  backTitle: {
    flex: 1,
    textAlign: 'center',
    ...type.headlineSm,
    color: colors.onSurfaceVariant,
    marginHorizontal: 8,
  },
  backTitlePrimary: {
    color: colors.primary,
    fontWeight: '700',
  },
  spacer: { width: 40 },
});
