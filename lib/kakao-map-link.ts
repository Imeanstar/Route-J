/** 카카오맵 외부 링크 — WebBrowser·OAuth 의존 없음 (APK 화면 멈춤 방지) */

export function kakaoMapSearchUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://map.kakao.com/?q=${q}`;
}

export function kakaoMapPlaceUrl(placeName: string, address?: string) {
  const q = encodeURIComponent(address ? `${placeName} ${address}` : placeName);
  return `https://map.kakao.com/link/search/${q}`;
}

/** 좌표가 있는 스탑으로 카카오맵 도보 길찾기(2곳 이상) 또는 장소 보기 */
export function kakaoMapRouteUrl(
  stops: { place_name: string; lat?: number | null; lng?: number | null; address?: string | null }[],
) {
  const withCoords = stops.filter(
    (s): s is typeof s & { lat: number; lng: number } =>
      s.lat != null && s.lng != null && !Number.isNaN(s.lat) && !Number.isNaN(s.lng),
  );

  if (withCoords.length >= 2) {
    const parts = withCoords.flatMap((s) => [
      encodeURIComponent(s.place_name),
      s.lng,
      s.lat,
    ]);
    return `https://map.kakao.com/link/roadWalk/${parts.join(',')}`;
  }

  const first = withCoords[0] ?? stops[0];
  if (!first) return kakaoMapSearchUrl('서울');
  return kakaoMapPlaceUrl(first.place_name, first.address ?? undefined);
}
