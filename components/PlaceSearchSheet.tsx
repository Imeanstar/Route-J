import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { colors, radius, spacing, type } from '@/constants/theme';
import { searchKakaoPlaces, type KakaoPlace } from '@/lib/kakao-places';

type Props = {
  visible: boolean;
  stopIndex: number;
  onClose: () => void;
  onSelect: (place: KakaoPlace) => void;
};

export function PlaceSearchSheet({ visible, stopIndex, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (text: string) => {
    const q = text.trim();
    if (q.length < 2) {
      setPlaces([]);
      setError(null);
      return;
    }
    setLoading(true);
    const { places: list, error: err } = await searchKakaoPlaces(q);
    setPlaces(list);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setPlaces([]);
      setError(null);
      return;
    }
    const timer = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, visible, runSearch]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={type.headlineSm}>장소 검색 · {stopIndex + 1}번</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <AppIcon name="delete" size={22} color={colors.outline} />
            </Pressable>
          </View>
          <Text style={[type.bodySm, styles.hint]}>
            카카오맵 데이터에서 가게·장소를 찾아요. 선택하면 이름·주소·좌표가 채워집니다.
          </Text>
          <View style={styles.searchRow}>
            <AppIcon name="search" size={20} color={colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="예: 성수 카페 ○○, 강남역 ○○식당"
              placeholderTextColor={colors.outlineVariant}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : query.trim().length < 2 ? (
            <Text style={styles.empty}>2글자 이상 입력해 주세요.</Text>
          ) : places.length === 0 ? (
            <Text style={styles.empty}>검색 결과가 없어요.</Text>
          ) : (
            <FlatList
              data={places}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={type.labelMd}>{item.place_name}</Text>
                  <Text style={[type.bodySm, styles.addr]} numberOfLines={2}>
                    {item.address}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    maxHeight: '78%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hint: { color: colors.outline, marginBottom: spacing.md },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtleGray,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, ...type.body, paddingVertical: 0 },
  list: { marginTop: spacing.sm },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  addr: { marginTop: 4, color: colors.outline },
  empty: { ...type.bodySm, color: colors.outline, marginTop: spacing.lg, textAlign: 'center' },
  error: { ...type.bodySm, color: colors.error, marginTop: spacing.lg },
});
