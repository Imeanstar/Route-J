import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, type } from '@/constants/theme';
import {
  buildKakaoMapHtml,
  readKakaoJavascriptKey,
  stopsWithCoords,
  type RouteMapStop,
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
  const html = useMemo(
    () => (appKey && mapped.length > 0 ? buildKakaoMapHtml(mapped, appKey) : null),
    [appKey, mapped],
  );

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

  const content = (
    <WebView
      source={{ html: html! }}
      style={styles.webview}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      setBuiltInZoomControls={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );

  if (onPress) {
    return (
      <Pressable style={[styles.box, { height }]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.box, { height }]}>{content}</View>;
}

export type { RouteMapStop };

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.subtleGray,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
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
