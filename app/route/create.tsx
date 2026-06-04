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
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StitchChip } from '@/components/stitch/StitchChip';
import { StitchField } from '@/components/stitch/StitchField';
import { StitchHeader, stitchContentTopInset } from '@/components/stitch/StitchHeader';
import { STITCH_CREATE_UPLOAD_PREVIEW } from '@/constants/stitch-assets';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { createRoute, type StopInput } from '@/lib/routes';
import { showMessage } from '@/lib/show-message';
import { supabase } from '@/lib/supabase';
import { pickAndUploadRoutePhoto } from '@/lib/upload-route-photo';
import { routePhotoUrl } from '@/lib/photos';
import type { Region, Station, Theme } from '@/types/database';

type StopForm = StopInput & { id: string };

export default function CreateRouteScreen() {
  const { tier, user, couple } = useAuth();
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
  const [busy, setBusy] = useState(false);
  const contentTop = stitchContentTopInset(insets.top);

  useEffect(() => {
    if (tier !== 'couple') {
      Alert.alert('커플 연결 필요', '루트 작성은 커플 연결 후 가능합니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    }
  }, [tier, router]);

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

  const addStop = () => {
    setStops((prev) => [...prev, { id: String(Date.now()), place_name: '', address: '' }]);
  };

  const removeStop = (id: string) => {
    setStops((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
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
    const validStops = stops.filter((s) => s.place_name.trim());
    if (!validStops.length) {
      Alert.alert('장소를 1개 이상 추가해주세요');
      return;
    }

    setBusy(true);
    const { route, error } = await createRoute({
      coupleId: couple.id,
      userId: user.id,
      title: title.trim(),
      description: description.trim(),
      regionId,
      stationId,
      themeIds,
      visibility,
      stops: validStops.map(({ place_name, address, lat, lng, photo_path, rating }) => ({
        place_name: place_name.trim(),
        address: address?.trim(),
        lat,
        lng,
        photo_path,
        rating,
      })),
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

  return (
    <View style={styles.root}>
      <View style={styles.headerFixed}>
        <StitchHeader
          variant="back"
          title="새로운 데이트 코스 등록"
          onBack={() => router.back()}
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
        <Pressable
          style={[styles.uploadBox, photoUploading && { opacity: 0.6 }]}
          onPress={pickCoverPhoto}
          disabled={photoUploading}
          accessibilityRole="button"
          accessibilityLabel="대표 이미지 업로드"
        >
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.uploadPreviewFilled} />
          ) : (
            <Image source={{ uri: STITCH_CREATE_UPLOAD_PREVIEW }} style={styles.uploadPreview} />
          )}
          <View style={[styles.uploadOverlay, coverUri && styles.uploadOverlayDim]}>
            <MaterialIcons name="add-photo-alternate" size={40} color={colors.outline} />
            <Text style={[type.labelMd, { color: colors.outline }]}>
              {photoUploading ? '업로드 중…' : '이미지 업로드 (권장 16:9)'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={type.labelMd}>지역 선택</Text>
            <View style={[styles.chipWrap, { marginTop: 8 }]}>
              {regions.map((r) => (
                <StitchChip
                  key={r.id}
                  label={r.name}
                  active={regionId === r.id}
                  onPress={() => {
                    setRegionId(regionId === r.id ? undefined : r.id);
                    setStationId(undefined);
                  }}
                />
              ))}
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
            <MaterialIcons name="add-circle" size={22} color={colors.primary} />
            <Text style={[type.labelMd, { color: colors.primary }]}>장소 추가</Text>
          </Pressable>
        </View>

        <View style={styles.stopsList}>
          {stops.map((stop, index) => (
            <View key={stop.id} style={[styles.stopCard, shadow.soft]}>
              <View style={styles.stopNum}>
                <Text style={styles.stopNumText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stopTitleRow}>
                  <TextInput
                    style={[styles.stopInput, { flex: 1 }]}
                    placeholder="장소 이름"
                    placeholderTextColor={colors.outline}
                    value={stop.place_name}
                    onChangeText={(v) => updateStop(stop.id, { place_name: v })}
                  />
                  <Pressable onPress={() => removeStop(stop.id)}>
                    <MaterialIcons name="delete-outline" size={22} color={colors.outline} />
                  </Pressable>
                </View>
                <TextInput
                  style={styles.stopInput}
                  placeholder="주소 (선택)"
                  placeholderTextColor={colors.outline}
                  value={stop.address ?? ''}
                  onChangeText={(v) => updateStop(stop.id, { address: v })}
                />
                <Pressable
                  style={styles.photoBtn}
                  onPress={() => pickStopPhoto(stop.id)}
                  disabled={photoUploading}
                >
                  <MaterialIcons name="photo-camera" size={18} color={colors.primary} />
                  <Text style={type.labelSm}>
                    {stop.photo_path ? '사진 변경' : '사진'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
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
            {busy ? '저장 중…' : '코스 공개하기'}
          </Text>
        </Pressable>
        <Text style={[type.bodySm, styles.footerNote]}>
          작성하신 코스는 RouteJ 사용자들에게 공개됩니다.
        </Text>
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
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  uploadBox: {
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
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
  stopTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stopInput: {
    ...type.body,
    backgroundColor: colors.subtleGray,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
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
});
