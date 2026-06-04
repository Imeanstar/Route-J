import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StitchChip } from '@/components/stitch/StitchChip';
import { StitchFab } from '@/components/stitch/StitchFab';
import { StitchFeedCard } from '@/components/stitch/StitchFeedCard';
import { StitchHeader, stitchContentTopInset } from '@/components/stitch/StitchHeader';
import { EmptyRoutes } from '@/components/EmptyRoutes';
import { OnboardingModal } from '@/components/OnboardingModal';
import { GUEST_HOME_TOP } from '@/constants/app';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';
import { isOnboardingDone } from '@/lib/onboarding';
import { fetchPopularRoutes } from '@/lib/routes';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Region, Route, Station, Theme } from '@/types/database';

export default function ExploreScreen() {
  const { tier, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ regionId?: string; themeId?: string; search?: string }>();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [regionId, setRegionId] = useState<string | undefined>(params.regionId);
  const [stationId, setStationId] = useState<string>();
  const [themeId, setThemeId] = useState<string | undefined>(params.themeId);
  const [search, setSearch] = useState(params.search ?? '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const contentTop = stitchContentTopInset(insets.top);

  useEffect(() => {
    (async () => {
      trackEvent('app_open');
      const done = await isOnboardingDone();
      setShowOnboarding(!done);
    })();
  }, []);

  useEffect(() => {
    if (params.regionId !== undefined) setRegionId(params.regionId);
    if (params.themeId !== undefined) setThemeId(params.themeId);
    if (params.search !== undefined) setSearch(params.search ?? '');
  }, [params.regionId, params.themeId, params.search]);

  const loadMeta = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const [r, s, t] = await Promise.all([
      supabase.from('regions').select('*').order('sort_order'),
      supabase.from('stations').select('*').order('sort_order'),
      supabase.from('themes').select('*').order('sort_order'),
    ]);
    if (r.data) setRegions(r.data as Region[]);
    if (s.data) setStations(s.data as Station[]);
    if (t.data) setThemes(t.data as Theme[]);
  }, []);

  const loadRoutes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError('Supabase 연결이 필요해요. .env 설정 후 앱을 다시 시작해주세요.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoadError(null);
    const guestTier = tier === 'guest' ? 'guest' : 'member';
    const effectiveTier = tier === 'couple' ? 'member' : guestTier;
    const hasCategoryFilter = Boolean(regionId || stationId || themeId);
    const { routes: list, error } = await fetchPopularRoutes(
      effectiveTier,
      { regionId, stationId, themeId, search: search || undefined },
      tier === 'guest' && hasCategoryFilter ? { categoryPreview: true } : undefined,
    );
    if (error) setLoadError(error);
    else setRoutes(list);
    setLoading(false);
    setRefreshing(false);
  }, [tier, regionId, stationId, themeId, search]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    setLoading(true);
    loadRoutes();
  }, [loadRoutes]);

  return (
    <View style={styles.root}>
      <View style={styles.headerFixed}>
        <StitchHeader
          variant="feed"
          onSearch={() => router.push('/(tabs)/search')}
          onNotifications={() => {}}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: contentTop, paddingBottom: 100 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRoutes();
            }}
          />
        }
      >
        {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

        <View style={styles.filterBlock}>
          <Text style={[type.labelMd, styles.filterLabel]}>Region</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            <StitchChip
              label="All"
              active={!regionId && !stationId}
              onPress={() => {
                setRegionId(undefined);
                setStationId(undefined);
              }}
            />
            {regions.map((r) => (
              <StitchChip
                key={r.id}
                label={r.name}
                active={regionId === r.id && !stationId}
                onPress={() => {
                  setRegionId(r.id);
                  setStationId(undefined);
                }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterBlock}>
          <Text style={[type.labelMd, styles.filterLabel]}>Theme</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            <StitchChip
              label="전체"
              variant="outline"
              active={!themeId}
              onPress={() => setThemeId(undefined)}
            />
            {themes.map((t) => (
              <StitchChip
                key={t.id}
                label={t.name}
                variant="outline"
                active={themeId === t.id}
                onPress={() => setThemeId(themeId === t.id ? undefined : t.id)}
              />
            ))}
          </ScrollView>
        </View>

        {search ? (
          <Text style={styles.searchHint}>
            검색: <Text style={{ fontWeight: '700' }}>{search}</Text>
            {tier === 'guest' ? ` · 미리보기 ${GUEST_HOME_TOP}개` : ''}
          </Text>
        ) : null}

        {loading || authLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        ) : routes.length === 0 ? (
          <EmptyRoutes
            tier={tier}
            onPrimary={() => {
              if (tier === 'couple') router.push('/route/create');
              else if (tier === 'member') router.push('/couple/connect');
              else router.push('/auth/login');
            }}
          />
        ) : (
          <View style={styles.feedGrid}>
            {routes.map((item) => (
              <View key={item.id} style={styles.feedCol}>
                <StitchFeedCard
                  route={item}
                  onPress={() => router.push(`/route/${item.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {tier === 'couple' && (
        <StitchFab bottom={88 + insets.bottom} onPress={() => router.push('/route/create')} />
      )}

      <OnboardingModal visible={showOnboarding} onDone={() => setShowOnboarding(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.gutter, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  filterBlock: { marginBottom: spacing.md },
  filterLabel: { marginBottom: 8, paddingHorizontal: 4 },
  searchHint: { ...type.bodySm, marginBottom: spacing.md },
  feedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  feedCol: {
    width: Platform.OS === 'web' ? '50%' : '100%',
    paddingHorizontal: 6,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
  },
  error: { ...type.bodySm, color: colors.error, marginBottom: spacing.sm },
  spinner: { marginVertical: spacing.xl },
  chipScroll: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
});
