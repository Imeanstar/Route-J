import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { StarRatingInput } from '@/components/StarRating';
import { PlaceSearchSheet } from '@/components/PlaceSearchSheet';
import type { KakaoPlace } from '@/lib/kakao-places';
import { StitchChip } from '@/components/stitch/StitchChip';
import { StitchField } from '@/components/stitch/StitchField';
import { StitchHeader, stitchContentTopInset } from '@/components/stitch/StitchHeader';
import { STITCH_CREATE_UPLOAD_PREVIEW } from '@/constants/stitch-assets';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { canCreateRoute, safeGoBack } from '@/lib/navigation';
import {
  createRoute,
  fetchRouteById,
  fetchRouteStops,
  fetchRouteThemeIds,
  updateRoute,
  type StopInput,
} from '@/lib/routes';
import { showMessage } from '@/lib/show-message';
import { supabase } from '@/lib/supabase';
import { pickAndUploadRoutePhoto } from '@/lib/upload-route-photo';
import { routePhotoUrl } from '@/lib/photos';
import type { Region, Station, Theme } from '@/types/database';

type StopForm = StopInput & { id: string };

function newEmptyStop(): StopForm {
  return { id: String(Date.now()), place_name: '', address: '' };
}

function stopHasPlace(s: StopForm): boolean {
  return Boolean(s.place_name.trim() && s.lat != null && s.lng != null);
}

/** 채워진 슬롯 + 맨 끝 빈 슬롯 최대 1개. 중간에 빈 2·3·4번 슬롯이 쌓이지 않게 */
function normalizeStops(list: StopForm[]): StopForm[] {
  const filled = list.filter(stopHasPlace);
  const empties = list.filter((s) => !stopHasPlace(s));

  if (filled.length === 0) {
    return empties.length ? [{ ...empties[0] }] : [newEmptyStop()];
  }

  if (empties.length) {
    return [...filled, { ...empties[empties.length - 1] }];
  }

  return filled;
}

type EditorProps = { routeId?: string };

export function RouteEditorScreen({ routeId }: EditorProps) {
  const isEdit = Boolean(routeId);
  const { tier, user, couple, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'couple_only'>('public');
  const [regionId, setRegionId] = useState<string>();
  const [stationId, setStationId] = useState<string>();
  const [themeIds, setThemeIds] = useState<string[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [stops, setStops] = useState<StopForm[]>([{ id: '1', place_name: '', address: '' }]);
  const [coverPreviewUri, setCoverPreviewUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [placeSearchStopId, setPlaceSearchStopId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const contentTop = stitchContentTopInset(insets.top);

  useEffect(() => {
    if (authLoading || isEdit) return;
    if (!canCreateRoute(tier)) {
      router.replace('/(tabs)/create');
    }
  }, [authLoading, tier, router, isEdit]);

  useEffect(() => {
    if (!isEdit) setStops((prev) => normalizeStops(prev));
  }, [isEdit]);

  useEffect(() => {
    if (!routeId || !couple) return;
    (async () => {
      setLoadingEdit(true);
      const [{ route }, { stops: existingStops }, { themeIds: existingThemes }] = await Promise.all([
        fetchRouteById(routeId),
        fetchRouteStops(routeId),
        fetchRouteThemeIds(routeId),
      ]);

      if (!route || route.couple_id !== couple.id) {
        Alert.alert('수정 불가', '우리 커플이 만든 루트만 수정할 수 있어요.', [
          { text: '확인', onPress: () => safeGoBack(router) },
        ]);
        setLoadingEdit(false);
        return;
      }

      setTitle(route.title);
      setDescription(route.description ?? '');
      setVisibility(route.visibility === 'couple_only' ? 'couple_only' : 'public');
      setRegionId(route.region_id ?? undefined);
      setStationId(route.station_id ?? undefined);
      setThemeIds(existingThemes);
      setStops(
        existingStops.map((s) => ({
          id: s.id,
          place_name: s.place_name,
          address: s.address ?? '',
          lat: s.lat ?? undefined,
          lng: s.lng ?? undefined,
          photo_path: s.photo_path ?? undefined,
          rating: s.rating ?? undefined,
          memo: s.memo ?? undefined,
        })),
      );
      const firstPhoto = existingStops[0]?.photo_path;
      setCoverPreviewUri(firstPhoto ? (routePhotoUrl(firstPhoto) ?? null) : null);
      setLoadingEdit(false);
    })();
  }, [routeId, couple, router]);

  useEffect(() => {
    (async () => {
      const [r, s, t] = await Promise.all([
        supabase.from('regions').select('*').order('sort_order'),
        supabase.from('stations').select('*').order('sort_order'),
        supabase.from('themes').select('*').order('sort_order'),
      ]);
      if (r.data) setRegions(r.data as Region[]);
      if (s.data) setStations(s.data as Station[]);
      if (t.data) setThemes(t.data as Theme[]);
    })();
  }, []);

  const syncCoverFromStops = (list: StopForm[]) => {
    const first = list.find(stopHasPlace);
    setCoverPreviewUri(first ? (routePhotoUrl(first.photo_path) ?? null) : null);
  };

  const addStop = () => {
    setStops((prev) => {
      const list = normalizeStops(prev);
      const draft = list.find((s) => !stopHasPlace(s));
      if (draft) {
        setPlaceSearchStopId(draft.id);
        return list;
      }
      const next = newEmptyStop();
      setPlaceSearchStopId(next.id);
      return [...list, next];
    });
  };

  const removeStop = (id: string) => {
    setStops((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target) return prev;

      if (!stopHasPlace(target)) {
        const filled = prev.filter(stopHasPlace);
        if (filled.length === 0) {
          return [{ id: target.id, place_name: '', address: '' }];
        }
        const next = normalizeStops(prev.filter((s) => s.id !== id));
        syncCoverFromStops(next);
        return next;
      }

      const next = normalizeStops(prev.filter((s) => s.id !== id));
      syncCoverFromStops(next);
      return next;
    });
  };

  const updateStop = (id: string, patch: Partial<StopForm>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const uploadPhoto = async (onDone: (path: string, previewUri: string) => void) => {
    if (!couple || !user) {
      showMessage('로그인 필요', '커플 연결 후 사진을 올릴 수 있어요.');
      return;
    }
    setPhotoUploading(true);
    const result = await pickAndUploadRoutePhoto(couple.id);
    setPhotoUploading(false);
    if (result) onDone(result.path, result.previewUri);
  };

  const pickCoverPhoto = () =>
    uploadPhoto((path, previewUri) => {
      setCoverPreviewUri(previewUri);
      setStops((prev) =>
        prev.length ? prev.map((s, i) => (i === 0 ? { ...s, photo_path: path } : s)) : prev,
      );
    });

  const pickStopPhoto = (stopId: string) =>
    uploadPhoto((path, previewUri) => {
      updateStop(stopId, { photo_path: path });
      const firstId = stops[0]?.id;
      if (stopId === firstId) setCoverPreviewUri(previewUri);
    });

  const onSubmit = async () => {
    if (!user || !couple) return;
    if (!title.trim()) {
      Alert.alert('제목을 입력해주세요');
      return;
    }
    const validStops = stops.filter(stopHasPlace);
    if (!validStops.length) {
      Alert.alert('장소를 1개 이상 추가해주세요', '장소 검색으로 코스 경로를 설정해 주세요.');
      return;
    }

    const stopPayload = validStops.map(({ place_name, address, lat, lng, photo_path, rating, memo }) => ({
      place_name: place_name.trim(),
      address: address?.trim(),
      lat,
      lng,
      photo_path,
      rating,
      memo: memo?.trim(),
    }));

    setBusy(true);
    if (isEdit && routeId) {
      const { route, error } = await updateRoute({
        routeId,
        title: title.trim(),
        description: description.trim(),
        regionId,
        stationId,
        themeIds,
        visibility,
        stops: stopPayload,
      });
      setBusy(false);
      if (error) Alert.alert('저장 실패', error);
      else {
        Alert.alert('수정 완료', '코스가 업데이트되었습니다.');
        router.replace(`/route/${route!.id}`);
      }
      return;
    }

    const { route, error } = await createRoute({
      coupleId: couple.id,
      userId: user.id,
      title: title.trim(),
      description: description.trim(),
      regionId,
      stationId,
      themeIds,
      visibility,
      stops: stopPayload,
    });
    setBusy(false);

    if (error) Alert.alert('저장 실패', error);
    else {
      Alert.alert('등록 완료', '코스가 저장되었습니다.');
      router.replace(`/route/${route!.id}`);
    }
  };

  const filteredStations = regionId ? stations.filter((s) => s.region_id === regionId) : [];
  const coverUri = coverPreviewUri ?? routePhotoUrl(stops[0]?.photo_path);
  const displayStops = normalizeStops(stops);
  const placeSearchIndex = placeSearchStopId
    ? Math.max(0, displayStops.findIndex((s) => s.id === placeSearchStopId))
    : 0;

  const applyPlace = (stopId: string, place: KakaoPlace) => {
    setStops((prev) =>
      normalizeStops(
        prev.map((s) =>
          s.id === stopId
            ? {
                ...s,
                place_name: place.place_name,
                address: place.address,
                lat: place.lat,
                lng: place.lng,
              }
            : s,
        ),
      ),
    );
  };

  if (authLoading || loadingEdit || (!isEdit && !canCreateRoute(tier))) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={type.bodySm}>불러오는 중…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PlaceSearchSheet
        visible={placeSearchStopId !== null}
        stopIndex={placeSearchIndex}
        onClose={() => setPlaceSearchStopId(null)}
        onSelect={(place) => {
          if (placeSearchStopId) applyPlace(placeSearchStopId, place);
        }}
      />
      <View style={styles.headerFixed} pointerEvents="box-none">
        <StitchHeader
          variant="back"
          title={isEdit ? '데이트 코스 수정' : '새로운 데이트 코스 등록'}
          onBack={() => safeGoBack(router)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentTop, paddingBottom: 48 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <StitchField
          label="제목 및 설명"
          placeholder="코스 이름을 입력해 주세요 (예: 성수동 햇살 가득 산책)"
          value={title}
          onChangeText={setTitle}
        />
        <StitchField
          placeholder="이 코스의 매력 포인트를 설명해 주세요."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={type.labelMd}>대표 이미지</Text>
        <View style={styles.uploadOuter}>
          <Pressable
            style={[styles.uploadBox, photoUploading && { opacity: 0.6 }]}
            onPress={pickCoverPhoto}
            disabled={photoUploading}
            accessibilityRole="button"
            accessibilityLabel="대표 이미지 업로드"
          >
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.uploadPreviewFilled} resizeMode="cover" />
            ) : (
              <Image
                source={{ uri: STITCH_CREATE_UPLOAD_PREVIEW }}
                style={styles.uploadPreview}
                resizeMode="cover"
              />
            )}
            <View style={[styles.uploadOverlay, coverUri && styles.uploadOverlayDim]}>
              <AppIcon name="image-add" size={40} color={colors.outline} />
              <Text style={[type.labelMd, styles.uploadLabel]}>
                {photoUploading ? '업로드 중…' : '탭하여 사진 추가'}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={type.labelMd}>지역 선택</Text>
            <View style={[styles.chipWrap, { marginTop: 8 }]}>
              {regions.length === 0 ? (
                <Text style={type.bodySm}>지역 목록을 불러오는 중…</Text>
              ) : (
                regions.map((r) => (
                  <StitchChip
                    key={r.id}
                    label={r.name}
                    active={regionId === r.id}
                    onPress={() => {
                      setRegionId(regionId === r.id ? undefined : r.id);
                      setStationId(undefined);
                    }}
                  />
                ))
              )}
            </View>
          </View>
        </View>

        {filteredStations.length > 0 && (
          <View style={styles.chipWrap}>
            {filteredStations.map((s) => (
              <StitchChip
                key={s.id}
                label={s.line_name ? `${s.name} · ${s.line_name}` : s.name}
                active={stationId === s.id}
                onPress={() => setStationId(stationId === s.id ? undefined : s.id)}
              />
            ))}
          </View>
        )}

        <Text style={[type.labelMd, styles.sectionGap]}>테마 선택</Text>
        <View style={styles.chipWrap}>
          {themes.length === 0 ? (
            <Text style={type.bodySm}>테마 목록을 불러오는 중…</Text>
          ) : null}
          {themes.map((t) => {
            const on = themeIds.includes(t.id);
            return (
              <StitchChip
                key={t.id}
                label={`# ${t.name}`}
                variant="outline"
                active={on}
                onPress={() =>
                  setThemeIds(on ? themeIds.filter((x) => x !== t.id) : [...themeIds, t.id])
                }
              />
            );
          })}
        </View>

        <View style={styles.stopsHeader}>
          <Text style={type.labelMd}>코스 경로 설정</Text>
          <Pressable style={styles.addLink} onPress={addStop}>
            <AppIcon name="add" size={22} color={colors.primary} />
            <Text style={[type.labelMd, { color: colors.primary }]}>장소 추가</Text>
          </Pressable>
        </View>

        <View style={styles.stopsList}>
          {displayStops.map((stop, index) => {
            const hasPlace = stopHasPlace(stop);
            const thumbUri = routePhotoUrl(stop.photo_path);
            return (
              <View key={stop.id} style={[styles.stopCard, shadow.soft]}>
                <View style={styles.stopNum}>
                  <Text style={styles.stopNumText}>{index + 1}</Text>
                </View>
                <View style={styles.stopBody}>
                  <View style={styles.stopTopRow}>
                    <Pressable
                      style={styles.placePick}
                      onPress={() => setPlaceSearchStopId(stop.id)}
                    >
                      <Text
                        style={hasPlace ? styles.placeName : styles.placePlaceholder}
                        numberOfLines={2}
                      >
                        {hasPlace ? stop.place_name : '탭하여 장소 추가'}
                      </Text>
                      <AppIcon name="search" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => removeStop(stop.id)}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel={hasPlace ? '장소 삭제' : '슬롯 닫기'}
                    >
                      <AppIcon name="delete" size={22} color={colors.outline} />
                    </Pressable>
                  </View>
                  {hasPlace ? (
                    <View style={styles.stopExtras}>
                      <Pressable
                        style={styles.extraPhotoBtn}
                        onPress={() => pickStopPhoto(stop.id)}
                        disabled={photoUploading}
                      >
                        {thumbUri ? (
                          <Image source={{ uri: thumbUri }} style={styles.extraThumb} />
                        ) : (
                          <View style={styles.extraThumbEmpty}>
                            <AppIcon name="camera" size={18} color={colors.primary} />
                          </View>
                        )}
                        <Text style={styles.extraBtnLabel}>
                          {thumbUri ? '사진 변경' : '사진 추가'}
                        </Text>
                      </Pressable>
                      <View style={styles.extraRating}>
                        <Text style={styles.extraLabel}>별점 주기</Text>
                        <StarRatingInput
                          value={stop.rating}
                          onChange={(rating) => updateStop(stop.id, { rating })}
                        />
                      </View>
                      <TextInput
                        style={styles.memoInput}
                        placeholder="이 장소 한줄 평 (선택)"
                        placeholderTextColor={colors.outline}
                        value={stop.memo ?? ''}
                        onChangeText={(v) => updateStop(stop.id, { memo: v })}
                        multiline
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
          <StitchChip
            label="공개"
            active={visibility === 'public'}
            onPress={() => setVisibility('public')}
          />
          <StitchChip
            label="우리만 보기"
            active={visibility === 'couple_only'}
            onPress={() => setVisibility('couple_only')}
          />
        </View>

        <Pressable
          style={[styles.submit, busy && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={[type.button, { color: colors.onSurface, fontSize: 18 }]}>
            {busy ? '저장 중…' : isEdit ? '변경사항 저장' : '코스 공개하기'}
          </Text>
        </Pressable>
        {!isEdit ? (
          <Text style={[type.bodySm, styles.footerNote]}>
            작성하신 코스는 RouteJ 사용자들에게 공개됩니다.
          </Text>
        ) : null}
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
    width: '100%',
  },
  uploadOuter: {
    width: '100%',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  uploadLabel: { color: colors.outline, textAlign: 'center' },
  uploadPreview: { width: '100%', height: '100%', opacity: 0.15 },
  uploadPreviewFilled: { width: '100%', height: '100%' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  uploadOverlayDim: { backgroundColor: 'rgba(0,0,0,0.35)' },
  metaGrid: { marginBottom: spacing.md },
  metaCol: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionGap: { marginTop: spacing.lg, marginBottom: spacing.sm },
  stopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  addLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopsList: { gap: spacing.md },
  stopCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}22`,
  },
  stopNum: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumText: { fontWeight: '700', color: colors.onPrimaryContainer, fontSize: 18 },
  stopBody: { flex: 1, minWidth: 0 },
  stopTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placePick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.subtleGray,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 0,
  },
  placeName: { ...type.labelMd, flex: 1, color: colors.onSurface },
  placePlaceholder: { ...type.bodySm, flex: 1, color: colors.outline },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopExtras: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  extraPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
  },
  extraThumb: { width: 40, height: 40, borderRadius: radius.sm },
  extraThumbEmpty: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBtnLabel: { ...type.labelSm, color: colors.primary },
  extraRating: { gap: 4 },
  extraLabel: { ...type.labelSm, color: colors.outline },
  memoInput: {
    ...type.bodySm,
    backgroundColor: colors.subtleGray,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryContainer,
    paddingVertical: 20,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  footerNote: { textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default function CreateRouteScreen() {
  return <RouteEditorScreen />;
}
