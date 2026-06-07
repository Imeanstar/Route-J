import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, type } from '@/constants/theme';
import {
  loadKakaoMapsSdk,
  readKakaoJavascriptKey,
  renderKakaoRouteMap,
  stopsWithCoords,
} from '@/lib/kakao-map';

type Props = {
  stops: { place_name: string; lat: number | null; lng: number | null }[];
  height?: number;
  onPress?: () => void;
};

function RouteMapFallback({ message, height }: { message: string; height: number }) {
  return (
    <View style={[styles.fallback, { height }]}>
      <Text style={styles.fallbackText}>{message}</Text>
    </View>
  );
}

export function RouteMap({ stops, height = 240, onPress }: Props) {
  const mapped = useMemo(() => stopsWithCoords(stops), [stops]);
  const appKey = readKakaoJavascriptKey();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!appKey || mapped.length === 0 || !hostRef.current) return;

    let cancelled = false;
    setMapError(null);

    loadKakaoMapsSdk(appKey)
      .then(() => {
        if (cancelled || !hostRef.current) return;
        renderKakaoRouteMap(hostRef.current, mapped);
      })
      .catch(() => {
        if (!cancelled) {
          setMapError('카카오맵을 불러오지 못했어요. 개발자 콘솔에서 카카오맵 ON·웹 도메인 등록을 확인해 주세요.');
        }
      });

    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [appKey, mapped]);

  if (!appKey) {
    return (
      <RouteMapFallback
        height={height}
        message="지도를 표시하려면 .env에 EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY를 설정해 주세요."
      />
    );
  }

  if (mapped.length === 0) {
    return (
      <RouteMapFallback
        height={height}
        message="좌표가 있는 장소가 없어요. 루트 등록 시 장소 검색으로 추가하면 지도에 코스가 표시됩니다."
      />
    );
  }

  if (mapError) {
    return <RouteMapFallback height={height} message={mapError} />;
  }

  const mapHost = (
    // @ts-expect-error RN Web — div host for Kakao Map SDK
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: radius.lg,
        overflow: 'hidden',
      }}
    />
  );

  if (onPress) {
    return (
      <Pressable style={[styles.box, { height }]} onPress={onPress}>
        {mapHost}
      </Pressable>
    );
  }

  return <View style={[styles.box, { height }]}>{mapHost}</View>;
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.subtleGray,
  },
  fallback: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.subtleGray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fallbackText: { ...type.bodySm, color: colors.outline, textAlign: 'center' },
});
