import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/AppIcon';
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
                <AppIcon name="search" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={props.onNotifications}>
                <AppIcon name="notifications" size={24} color={colors.onSurfaceVariant} />
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
          <View style={styles.backRow}>
            <Pressable
              style={styles.sideBtn}
              onPress={props.onBack}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
              hitSlop={12}
            >
              <AppIcon name="back" size={24} color={colors.primary} />
            </Pressable>
            <Text
              style={[
                styles.backTitle,
                props.title.length < 24 && styles.backTitlePrimary,
              ]}
              numberOfLines={1}
            >
              {props.title}
            </Text>
            {props.onMore ? (
              <Pressable
                style={styles.sideBtn}
                onPress={props.onMore}
                accessibilityRole="button"
                accessibilityLabel="더보기"
                hitSlop={12}
              >
                <AppIcon name="more" size={24} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={styles.sideBtn} />
            )}
          </View>
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

/**
 * Pull-to-refresh 스피너가 상태바·고정 헤더 뒤가 아니라 헤더 바로 아래에서 보이도록.
 * @param scrollBelowHeader ScrollView에 marginTop(헤더 높이)이 있으면 true
 */
export function stitchRefreshProgressOffset(insetsTop: number, scrollBelowHeader = false) {
  if (scrollBelowHeader) return stitchHeaderContentGap;
  return stitchContentTopInset(insetsTop);
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
  backRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitle: {
    flex: 1,
    textAlign: 'center',
    ...type.headlineSm,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 4,
  },
  backTitlePrimary: {
    color: colors.primary,
    fontWeight: '700',
  },
});
