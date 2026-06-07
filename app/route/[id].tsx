import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppIcon } from '@/components/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StitchHeader, stitchHeaderHeight } from '@/components/stitch/StitchHeader';
import { RouteMap } from '@/components/RouteMap';
import { STITCH_DETAIL_HERO, STITCH_STOP_IMAGES } from '@/constants/stitch-assets';
import { VISIBILITY_LABELS } from '@/constants/app';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import {
  fetchRouteById,
  fetchRouteStops,
  incrementView,
  reportRoute,
  toggleBookmark,
  toggleLike,
  updateRouteVisibility,
} from '@/lib/routes';
import { kakaoMapRouteUrl } from '@/lib/kakao';
import { safeGoBack } from '@/lib/navigation';
import { fetchPartnerBenefits, type PartnerBenefit } from '@/lib/partners';
import { routePhotoUrl } from '@/lib/photos';
import { usePlus } from '@/lib/plus';
import { shareRoute } from '@/lib/share';
import { showConfirm, showMessage } from '@/lib/show-message';
import { supabase } from '@/lib/supabase';
import type { Route, RouteStop } from '@/types/database';

function stopImage(index: number, photoPath: string | null) {
  return routePhotoUrl(photoPath) ?? STITCH_STOP_IMAGES[index % STITCH_STOP_IMAGES.length];
}

function benefitForStop(benefits: PartnerBenefit[], placeName: string) {
  return benefits.find(
    (b) =>
      b.venue_name &&
      (placeName.includes(b.venue_name.slice(0, 4)) ||
        b.venue_name.includes(placeName.slice(0, 4))),
  );
}

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tier, user, couple } = useAuth();
  const { redeemBenefit } = usePlus();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [benefits, setBenefits] = useState<PartnerBenefit[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const headerH = stitchHeaderHeight(insets.top);

  const isCoupleMember =
    tier === 'couple' && couple && route && route.couple_id === couple.id;

  const load = useCallback(async () => {
    if (!id) return;
    const { route: r } = await fetchRouteById(id);
    setRoute(r);
    if (r?.visibility === 'public') await incrementView(id);
    const { stops: s } = await fetchRouteStops(id);
    setStops(s);

    if (user) {
      const [lk, bm] = await Promise.all([
        supabase.from('route_likes').select('route_id').eq('route_id', id).eq('user_id', user.id).maybeSingle(),
        supabase.from('route_bookmarks').select('route_id').eq('route_id', id).eq('user_id', user.id).maybeSingle(),
      ]);
      setLiked(!!lk.data);
      setBookmarked(!!bm.data);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchPartnerBenefits().then(({ benefits: b }) => setBenefits(b));
  }, []);

  const heroUri =
    routePhotoUrl(stops[0]?.photo_path) ?? STITCH_DETAIL_HERO;

  const openKakaoMap = () => {
    const url = kakaoMapRouteUrl(stops);
    Linking.openURL(url).catch(() => Alert.alert('지도', '카카오맵을 열 수 없습니다.'));
  };

  const onShare = async () => {
    if (!route) return;
    await shareRoute(route.id, route.title);
  };

  const startRoute = () => {
    if (stops.length === 0) {
      Alert.alert('스탑 없음', '이 루트에 장소가 없습니다.');
      return;
    }
    openKakaoMap();
  };

  const openManageMenu = () => {
    if (!isCoupleMember) return;
    setManageOpen(true);
  };

  const onLike = async () => {
    if (!user) {
      showMessage('로그인 필요', '좋아요는 회원만 가능해요.');
      return;
    }
    await toggleLike(id!, user.id, liked);
    setLiked(!liked);
    load();
  };

  const onBookmark = async () => {
    if (!user) {
      showMessage('로그인 필요', '찜은 회원만 가능해요.');
      return;
    }
    await toggleBookmark(id!, user.id, bookmarked);
    setBookmarked(!bookmarked);
  };

  const onReport = () => {
    if (!user) {
      Alert.alert('로그인 필요');
      return;
    }
    Alert.prompt('신고', '사유를 입력해주세요', async (reason) => {
      if (!reason?.trim()) return;
      const { error } = await reportRoute(id!, user.id, reason.trim());
      if (error) Alert.alert('신고 실패', error.message ?? '다시 시도해 주세요');
      else Alert.alert('접수됨', '신고가 접수되었습니다.');
    });
  };

  const setVisibility = (visibility: 'public' | 'couple_only' | 'deleted') => {
    if (!isCoupleMember) return;
    setManageOpen(false);
    const label = VISIBILITY_LABELS[visibility];
    showConfirm('변경 확인', `${label}(으)로 변경할까요?`, async () => {
      await updateRouteVisibility(id!, visibility);
      if (visibility === 'deleted') safeGoBack(router);
      else load();
    });
  };

  if (!route) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={type.bodySm}>불러오는 중…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.headerFixed, { height: headerH }]} pointerEvents="box-none">
        <StitchHeader
          variant="back"
          title={route.title}
          onBack={() => safeGoBack(router)}
          onMore={isCoupleMember ? openManageMenu : undefined}
        />
      </View>

      <Modal visible={manageOpen} transparent animationType="fade" onRequestClose={() => setManageOpen(false)}>
        <View style={styles.menuBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setManageOpen(false)} />
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <Text style={[type.headlineSm, styles.menuTitle]}>우리 루트 관리</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setManageOpen(false);
                router.push(`/route/edit/${id}`);
              }}
            >
              <Text style={type.labelMd}>수정</Text>
            </Pressable>
            {route.visibility === 'public' ? (
              <Pressable style={styles.menuItem} onPress={() => setVisibility('couple_only')}>
                <Text style={type.labelMd}>우리만 보기</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.menuItem} onPress={() => setVisibility('public')}>
                <Text style={type.labelMd}>공개로 변경</Text>
              </Pressable>
            )}
            <Pressable style={styles.menuItem} onPress={() => setVisibility('deleted')}>
              <Text style={[type.labelMd, { color: colors.danger }]}>삭제</Text>
            </Pressable>
            <Pressable style={styles.menuCancel} onPress={() => setManageOpen(false)}>
              <Text style={type.labelMd}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={[styles.scroll, { marginTop: headerH }]}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View style={styles.heroWrap}>
          <Image source={{ uri: heroUri }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={[styles.content, { marginTop: -48 }]}>
          <View style={[styles.infoCard, shadow.card]}>
            <View style={styles.infoTop}>
              <View style={{ flex: 1 }}>
                <Text style={[type.headlineMd, { color: colors.primary }]}>{route.title}</Text>
                <View style={styles.locRow}>
                  <AppIcon name="location" size={18} color={colors.onSurfaceVariant} />
                  <Text style={type.labelMd}>{VISIBILITY_LABELS[route.visibility]}</Text>
                </View>
              </View>
              <View style={styles.stopsBadge}>
                <Text style={[type.labelSm, { color: colors.onSecondaryContainer }]}>
                  {stops.length} Stops
                </Text>
              </View>
            </View>
            {route.description ? (
              <Text style={[type.body, { marginTop: spacing.sm }]}>{route.description}</Text>
            ) : null}
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <AppIcon name="person" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={type.labelMd}>RouteJ Couple</Text>
                <Text style={[type.labelSm, { color: colors.outline }]}>
                  ♥ {route.like_count} · 조회 {route.view_count}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mapSection}>
            <View style={styles.mapHead}>
              <Text style={[type.headlineSm, { color: colors.primary }]}>Route Map</Text>
              <Pressable onPress={openKakaoMap}>
                <Text style={[type.labelMd, { color: colors.primary }]}>Open Kakao Map</Text>
              </Pressable>
            </View>
            <RouteMap stops={stops} height={240} onPress={openKakaoMap} />
          </View>

          <Text style={[type.headlineSm, { color: colors.primary, marginBottom: spacing.md }]}>
            Walking Stops
          </Text>
          {stops.map((stop, i) => {
            const perk = benefitForStop(benefits, stop.place_name);
            return (
            <View key={stop.id} style={styles.timelineRow}>
              <View style={styles.timelineCol}>
                <View style={styles.timelineDot}>
                  <Text style={styles.dotNum}>{i + 1}</Text>
                </View>
                {i < stops.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[styles.stopCard, shadow.soft]}>
                <Image
                  source={{ uri: stopImage(i, stop.photo_path) }}
                  style={styles.stopThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={type.labelMd}>{stop.place_name}</Text>
                  {stop.rating != null && (
                    <Text style={{ color: colors.warning, marginTop: 4, fontSize: 13 }}>
                      {'★'.repeat(stop.rating)}{'☆'.repeat(5 - stop.rating)} ({stop.rating})
                    </Text>
                  )}
                  {stop.memo ? (
                    <Text style={[type.bodySm, { marginTop: 4, color: colors.onSurfaceVariant }]} numberOfLines={3}>
                      {stop.memo}
                    </Text>
                  ) : null}
                  {perk ? (
                    <Pressable
                      style={styles.plusPerk}
                      onPress={() => redeemBenefit(perk.id, perk.coupon_code)}
                    >
                      <Text style={styles.plusPerkText}>
                        Plus · {perk.discount_label}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.footerAction} onPress={onLike}>
          <AppIcon
            name="heart"
            size={24}
            filled={liked}
            color={liked ? colors.error : colors.outline}
          />
          <Text style={type.labelSm}>{route.like_count}</Text>
        </Pressable>
        <Pressable style={styles.footerAction} onPress={onShare}>
          <AppIcon name="share" size={24} color={colors.outline} />
          <Text style={type.labelSm}>Share</Text>
        </Pressable>
        <Pressable style={styles.footerAction} onPress={onBookmark}>
          <AppIcon name="bookmark" size={24} filled={bookmarked} color={colors.outline} />
          <Text style={type.labelSm}>Save</Text>
        </Pressable>
        <Pressable style={styles.startBtn} onPress={startRoute}>
          <Text style={[type.button, { color: colors.onPrimary }]}>Start Route</Text>
        </Pressable>
      </View>
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
    elevation: 50,
  },
  scroll: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  content: { paddingHorizontal: spacing.gutter, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primaryContainer}55`,
  },
  infoTop: { flexDirection: 'row', alignItems: 'flex-start' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stopsBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}55`,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSection: { marginTop: spacing.lg },
  mapHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  timelineRow: { flexDirection: 'row', marginBottom: spacing.md },
  timelineCol: { width: 28, alignItems: 'center' },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNum: { color: '#fff', fontSize: 10, fontWeight: '700' },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.secondaryContainer,
    marginTop: 4,
    minHeight: 48,
  },
  stopCard: {
    flex: 1,
    marginLeft: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primaryContainer}33`,
  },
  stopThumb: { width: 80, height: 80, borderRadius: radius.md },
  plusPerk: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  plusPerkText: { ...type.labelSm, color: colors.onSecondaryContainer, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.md,
  },
  footerAction: { alignItems: 'center', gap: 4, minWidth: 48 },
  startBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  menuTitle: { marginBottom: spacing.sm, textAlign: 'center' },
  menuItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  menuCancel: {
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});
