import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StitchFeedCard } from '@/components/stitch/StitchFeedCard';
import { StitchHeader, stitchContentTopInset } from '@/components/stitch/StitchHeader';
import { GUEST_HOME_TOP } from '@/constants/app';
import { useAuth } from '@/lib/auth';
import { fetchPopularRoutes } from '@/lib/routes';
import {
  STITCH_RECENT_SEARCH,
  STITCH_REGION_IMAGES,
  STITCH_SEONGSU_CARD,
} from '@/constants/stitch-assets';
import { PartnerBenefitRow } from '@/components/PartnerBenefitRow';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { fetchPartnerBenefits, type PartnerBenefit } from '@/lib/partners';
import { usePlus } from '@/lib/plus';
import { EAS_SUPABASE_SETUP_HINT, isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Region, Route, Theme } from '@/types/database';

const THEME_ICONS: { icon: AppIconName; color: string; bg: string }[] = [
  { icon: 'cafe', color: colors.primary, bg: `${colors.primaryContainer}4D` },
  { icon: 'restaurant', color: colors.secondary, bg: `${colors.secondaryContainer}4D` },
  { icon: 'park', color: colors.onSurfaceVariant, bg: colors.surfaceContainerHigh },
  { icon: 'museum', color: colors.tertiary, bg: colors.tertiaryContainer },
];

export default function SearchScreen() {
  const router = useRouter();
  const { tier } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Route[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [benefits, setBenefits] = useState<PartnerBenefit[]>([]);
  const { isPlus, redeemBenefit } = usePlus();
  const contentTop = stitchContentTopInset(insets.top);

  const loadMeta = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const [r, t] = await Promise.all([
      supabase.from('regions').select('*').order('sort_order'),
      supabase.from('themes').select('*').order('sort_order'),
    ]);
    if (r.data) setRegions(r.data as Region[]);
    if (t.data) setThemes(t.data as Theme[]);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    fetchPartnerBenefits('성수').then(({ benefits: b }) => setBenefits(b.slice(0, 5)));
  }, []);

  /** 지역·테마 칩 → 피드에서 필터 탐색 */
  const goExplore = (params: Record<string, string>) => {
    router.push({ pathname: '/(tabs)/explore', params });
  };

  const runTextSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      Keyboard.dismiss();
      setSubmittedQuery(q);
      if (!isSupabaseConfigured) {
        setSearchError(EAS_SUPABASE_SETUP_HINT);
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      setSearchError(null);
      const guestTier = tier === 'guest' ? 'guest' : 'member';
      const effectiveTier = tier === 'couple' ? 'member' : guestTier;
      const { routes: list, error } = await fetchPopularRoutes(effectiveTier, { search: q });
      setSearchResults(list);
      setSearchError(error ?? null);
      setSearchLoading(false);
    },
    [tier],
  );

  const onSearchSubmit = () => runTextSearch(search);

  return (
    <View style={styles.root}>
      <View style={styles.headerFixed}>
        <StitchHeader variant="brand" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentTop, paddingBottom: 100 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchBox}>
          <AppIcon name="search" size={22} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="지역이나 테마를 검색하세요"
            placeholderTextColor={colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            blurOnSubmit
          />
          <AppIcon name="mic" size={22} color={colors.outline} />
        </View>

        {submittedQuery ? (
          <View style={styles.resultsBlock}>
            <Text style={type.headlineSm}>
              「{submittedQuery}」 검색 결과
              {tier === 'guest' ? ` · 상위 ${GUEST_HOME_TOP}개` : ''}
            </Text>
            {searchLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
            ) : searchError ? (
              <Text style={[type.bodySm, styles.searchError]}>{searchError}</Text>
            ) : searchResults.length === 0 ? (
              <Text style={[type.bodySm, styles.searchEmpty]}>검색 결과가 없어요.</Text>
            ) : (
              <View style={styles.resultsGrid}>
                {searchResults.map((item) => (
                  <View key={item.id} style={styles.resultsCol}>
                    <StitchFeedCard
                      route={item}
                      onPress={() => router.push(`/route/${item.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
            {!searchLoading && searchResults.length > 0 ? (
              <Pressable onPress={() => goExplore({ search: submittedQuery })}>
                <Text style={[type.labelMd, styles.moreLink]}>피드 탭에서 이어서 보기</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={type.headlineSm}>최근 검색어</Text>
          <Pressable>
            <Text style={[type.labelMd, { color: colors.outline }]}>모두 지우기</Text>
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {STITCH_RECENT_SEARCH.map((tag) => (
            <Pressable
              key={tag}
              style={styles.recentChip}
              onPress={() => {
                const q = tag.replace('#', '');
                setSearch(q);
                runTextSearch(q);
              }}
            >
              <Text style={type.labelMd}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[type.headlineSm, styles.sectionTitle]}>지역별 탐색</Text>
        <View style={styles.regionGrid}>
          {regions.slice(0, 3).map((r) => (
            <Pressable
              key={r.id}
              style={styles.regionCard}
              onPress={() => goExplore({ regionId: r.id })}
            >
              <Image
                source={{ uri: STITCH_REGION_IMAGES[r.name] ?? STITCH_REGION_IMAGES['서울'] }}
                style={styles.regionImage}
              />
              <View style={styles.regionOverlay}>
                <Text style={styles.regionLabel}>{r.name}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.regionMore} onPress={() => router.push('/(tabs)/explore')}>
            <AppIcon name="add-location" size={36} color={colors.onSecondaryContainer} />
            <Text style={[type.labelMd, { color: colors.onSecondaryContainer }]}>전체보기</Text>
          </Pressable>
        </View>

        <View style={styles.hotHead}>
          <AppIcon name="star" size={22} color={colors.primary} />
          <Text style={type.headlineSm}>이번 주 인기 지역: 성수동</Text>
        </View>
        <Pressable style={styles.hotCard} onPress={() => goExplore({ search: '성수' })}>
          <Image source={{ uri: STITCH_SEONGSU_CARD }} style={styles.hotImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.hotGradient}
          >
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>HOT PLACE</Text>
            </View>
            <Text style={styles.hotTitle}>성수동 팝업 투어</Text>
            <Text style={styles.hotSub}>요즘 가장 핫한 성수동 코스 12개</Text>
          </LinearGradient>
        </Pressable>

        {benefits.length > 0 && (
          <>
            <Text style={[type.headlineSm, styles.sectionTitle]}>RouteJ Plus 제휴</Text>
            <Text style={[type.bodySm, { marginBottom: spacing.sm, color: colors.outline }]}>
              성수·연남 파일럿 매장 할인 (구독 후 사용)
            </Text>
            {benefits.map((b) => (
              <PartnerBenefitRow
                key={b.id}
                benefit={b}
                isPlus={isPlus}
                onRedeem={(row) => redeemBenefit(row.id, row.coupon_code)}
              />
            ))}
          </>
        )}

        <Text style={[type.headlineSm, styles.sectionTitle]}>테마별 추천</Text>
        <View style={styles.themeGrid}>
          {themes.slice(0, 4).map((t, i) => {
            const meta = THEME_ICONS[i] ?? THEME_ICONS[0];
            return (
              <Pressable
                key={t.id}
                style={styles.themeItem}
                onPress={() => goExplore({ themeId: t.id })}
              >
                <View style={[styles.themeIcon, { backgroundColor: meta.bg }]}>
                  <AppIcon name={meta.icon} size={28} color={meta.color} />
                </View>
                <Text style={type.labelMd}>{t.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerFixed: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtleGray,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    ...type.body,
    marginLeft: 8,
    paddingVertical: 0,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  recentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}55`,
  },
  sectionTitle: { marginBottom: spacing.md },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  regionCard: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  regionImage: { width: '100%', height: '100%' },
  regionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  regionLabel: { ...type.labelMd, color: '#fff', fontWeight: '700' },
  regionMore: {
    width: '47%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hotHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  hotCard: {
    height: 192,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  hotImage: { width: '100%', height: '100%' },
  hotGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  hotBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  hotBadgeText: { color: colors.onPrimary, fontSize: 10, fontWeight: '700' },
  hotTitle: { ...type.headlineSm, color: '#fff', fontSize: 22, marginBottom: 4 },
  hotSub: { ...type.bodySm, color: 'rgba(255,255,255,0.8)' },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  themeItem: { alignItems: 'center', gap: 8, width: '22%' },
  themeIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsBlock: { marginBottom: spacing.lg },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: spacing.md,
  },
  resultsCol: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    paddingHorizontal: 6,
    marginBottom: spacing.md,
  },
  searchError: { color: colors.error, marginTop: spacing.md },
  searchEmpty: { color: colors.outline, marginTop: spacing.md },
  moreLink: { color: colors.primary, marginTop: spacing.md, textAlign: 'center' },
});
