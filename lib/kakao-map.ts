import Constants from 'expo-constants';

export type RouteMapStop = {
  place_name: string;
  lat: number;
  lng: number;
};

export const ROUTE_MAP_POLYLINE_COLOR = '#D94680';
export const ROUTE_MAP_MARKER_COLOR = '#6c5a5c';

export function readKakaoJavascriptKey(): string {
  const fromBundle = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  if (fromBundle?.trim()) return fromBundle.trim();
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return (extra?.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? '').trim();
}

export function stopsWithCoords(
  stops: { place_name: string; lat: number | null; lng: number | null }[],
): RouteMapStop[] {
  return stops
    .filter(
      (s): s is { place_name: string; lat: number; lng: number } =>
        s.lat != null &&
        s.lng != null &&
        !Number.isNaN(s.lat) &&
        !Number.isNaN(s.lng),
    )
    .map((s) => ({ place_name: s.place_name, lat: s.lat, lng: s.lng }));
}

function initRouteMapOnDocument(stops: RouteMapStop[]): void {
  const kakao = window.kakao;
  if (!kakao?.maps || stops.length === 0) return;

  const el = document.getElementById('map');
  if (!el) return;

  const center = new kakao.maps.LatLng(stops[0].lat, stops[0].lng);
  const map = new kakao.maps.Map(el, { center, level: 5 });
  const bounds = new kakao.maps.LatLngBounds();
  const path: unknown[] = [];

  stops.forEach((s, i) => {
    const pos = new kakao.maps.LatLng(s.lat, s.lng);
    bounds.extend(pos);
    path.push(pos);
    const content = `<div class="marker-label">${i + 1}</div>`;
    new kakao.maps.CustomOverlay({
      position: pos,
      content,
      yAnchor: 1.1,
    }).setMap(map);
  });

  if (stops.length > 1) {
    new kakao.maps.Polyline({
      path,
      strokeWeight: 4,
      strokeColor: ROUTE_MAP_POLYLINE_COLOR,
      strokeOpacity: 0.88,
      strokeStyle: 'solid',
    }).setMap(map);
    map.setBounds(bounds, 40, 40, 40, 40);
  } else {
    map.setCenter(center);
    map.setLevel(3);
  }
}

function mapInitScript(stopsJson: string): string {
  return `
    var STOPS = ${stopsJson};
    if (!STOPS.length) return;
    var center = new kakao.maps.LatLng(STOPS[0].lat, STOPS[0].lng);
    var map = new kakao.maps.Map(document.getElementById('map'), { center: center, level: 5 });
    var bounds = new kakao.maps.LatLngBounds();
    var path = [];
    STOPS.forEach(function(s, i) {
      var pos = new kakao.maps.LatLng(s.lat, s.lng);
      bounds.extend(pos);
      path.push(pos);
      new kakao.maps.CustomOverlay({
        position: pos,
        content: '<div class="marker-label">' + (i + 1) + '</div>',
        yAnchor: 1.1,
      }).setMap(map);
    });
    if (STOPS.length > 1) {
      new kakao.maps.Polyline({
        path: path,
        strokeWeight: 4,
        strokeColor: '${ROUTE_MAP_POLYLINE_COLOR}',
        strokeOpacity: 0.88,
        strokeStyle: 'solid',
      }).setMap(map);
      map.setBounds(bounds, 40, 40, 40, 40);
    } else {
      map.setCenter(center);
      map.setLevel(3);
    }
  `;
}

export function buildKakaoMapHtml(stops: RouteMapStop[], appKey: string): string {
  const stopsJson = JSON.stringify(stops).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .marker-label {
      display: flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 13px;
      background: ${ROUTE_MAP_MARKER_COLOR}; color: #fff;
      font: bold 11px -apple-system, sans-serif;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,.22);
    }
  </style>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    kakao.maps.load(function() {
      ${mapInitScript(stopsJson)}
    });
  </script>
</body>
</html>`;
}

type KakaoMapsSdk = {
  maps: {
    load: (cb: () => void) => void;
    LatLng: new (lat: number, lng: number) => unknown;
    LatLngBounds: new () => { extend: (pos: unknown) => void };
    Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => {
      setBounds: (b: unknown, p1: number, p2: number, p3: number, p4: number) => void;
      setCenter: (c: unknown) => void;
      setLevel: (n: number) => void;
    };
    CustomOverlay: new (opts: { position: unknown; content: string; yAnchor: number }) => {
      setMap: (map: unknown) => void;
    };
    Polyline: new (opts: {
      path: unknown[];
      strokeWeight: number;
      strokeColor: string;
      strokeOpacity: number;
      strokeStyle: string;
    }) => { setMap: (map: unknown) => void };
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapsSdk;
  }
}

let sdkPromise: Promise<void> | null = null;

export function loadKakaoMapsSdk(appKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window unavailable'));
  }
  if (window.kakao?.maps) {
    return new Promise((resolve) => window.kakao!.maps.load(resolve));
  }
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao?.maps.load(() => resolve());
      };
      script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

export function renderKakaoRouteMap(container: HTMLElement, stops: RouteMapStop[]): void {
  if (stops.length === 0) return;
  container.innerHTML = '<div id="map" style="width:100%;height:100%"></div>';
  if (!document.getElementById('kakao-map-marker-style')) {
    const style = document.createElement('style');
    style.id = 'kakao-map-marker-style';
    style.textContent = `
      .marker-label {
        display:flex;align-items:center;justify-content:center;
        width:26px;height:26px;border-radius:13px;
        background:${ROUTE_MAP_MARKER_COLOR};color:#fff;
        font:bold 11px -apple-system,sans-serif;
        border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22);
      }
    `;
    document.head.appendChild(style);
  }
  window.kakao?.maps.load(() => initRouteMapOnDocument(stops));
}
