import Constants from 'expo-constants';
import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function readKakaoRestKey(): string {
  const fromBundle = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  if (fromBundle?.trim()) return fromBundle.trim();
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return (extra?.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '').trim();
}

export type KakaoPlace = {
  id: string;
  place_name: string;
  address: string;
  road_address?: string;
  lat: number;
  lng: number;
};

function mapDocuments(docs: unknown[]): KakaoPlace[] {
  return docs
    .map((raw) => {
      const doc = raw as {
        id?: string;
        place_name?: string;
        address_name?: string;
        road_address_name?: string;
        x?: string;
        y?: string;
        address?: string;
        road_address?: string;
        lat?: number;
        lng?: number;
      };
      const lat = doc.lat ?? (doc.y ? parseFloat(doc.y) : NaN);
      const lng = doc.lng ?? (doc.x ? parseFloat(doc.x) : NaN);
      if (!doc.place_name || Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return {
        id: String(doc.id ?? `${doc.place_name}-${lat}`),
        place_name: doc.place_name,
        address: doc.address ?? doc.road_address_name ?? doc.address_name ?? '',
        road_address: doc.road_address ?? doc.road_address_name,
        lat,
        lng,
      };
    })
    .filter((p): p is KakaoPlace => p !== null);
}

type SearchAttempt =
  | { ok: true; places: KakaoPlace[] }
  | { ok: false; reason: 'skip' | 'fail'; detail?: string };

async function edgeInvokeErrorDetail(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string; detail?: string };
      const main = payload.error ?? error.message;
      if (payload.detail && !main.includes(payload.detail.slice(0, 40))) {
        try {
          const kakao = JSON.parse(payload.detail) as { message?: string };
          if (kakao.message) return `${main} (${kakao.message})`;
        } catch {
          /* ignore */
        }
      }
      return main;
    } catch {
      return error.message;
    }
  }
  if (error instanceof FunctionsFetchError) {
    return `${error.message} (네트워크·CORS 확인)`;
  }
  if (error instanceof Error) return error.message;
  return 'Edge Function 호출 실패';
}

async function searchViaEdgeFunction(query: string): Promise<SearchAttempt> {
  if (!isSupabaseConfigured) return { ok: false, reason: 'skip' };
  try {
    const { data, error } = await supabase.functions.invoke<{ places?: KakaoPlace[]; error?: string }>(
      'search-places',
      { body: { query } },
    );
    if (error) {
      return { ok: false, reason: 'fail', detail: await edgeInvokeErrorDetail(error) };
    }
    if (data?.error) {
      return { ok: false, reason: 'fail', detail: data.error };
    }
    return { ok: true, places: data?.places ?? [] };
  } catch (e) {
    return { ok: false, reason: 'fail', detail: e instanceof Error ? e.message : 'Edge Function 호출 실패' };
  }
}

/** 네이티브(Expo Go·APK) 개발용 — 웹 브라우저는 카카오 CORS로 직접 호출 불가 */
async function searchViaClientKey(query: string): Promise<SearchAttempt> {
  const key = readKakaoRestKey();
  if (!key) return { ok: false, reason: 'skip' };
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'fail', detail: 'web_cors' };
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query);
  url.searchParams.set('size', '15');

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        reason: 'fail',
        detail: res.status === 401 || res.status === 403 ? 'invalid_key' : `http_${res.status}:${text.slice(0, 80)}`,
      };
    }
    const json = await res.json();
    return { ok: true, places: mapDocuments(json.documents ?? []) };
  } catch (e) {
    return { ok: false, reason: 'fail', detail: e instanceof Error ? e.message : 'network' };
  }
}

function buildSearchError(edge: SearchAttempt, client: SearchAttempt): string {
  const hasKey = Boolean(readKakaoRestKey());
  const edgeFailed = edge.reason === 'fail';
  const clientFailed = client.reason === 'fail';

  if (Platform.OS === 'web') {
    if (edge.reason === 'skip') {
      return 'Supabase가 연결되지 않았어요. .env의 EXPO_PUBLIC_SUPABASE_URL·ANON_KEY를 확인하고 Expo를 재시작해 주세요.';
    }
    if (edgeFailed && edge.detail) {
      return `장소 검색 서버 오류: ${edge.detail}`;
    }
    return (
      '웹에서는 Edge Function(search-places)이 필요해요. 배포 후에도 안 되면 Supabase 대시보드 → Edge Functions → search-places 로그를 확인해 주세요.'
    );
  }

  if (!hasKey && !edgeFailed && edge.reason === 'skip') {
    return '장소 검색을 사용하려면 .env에 EXPO_PUBLIC_KAKAO_REST_API_KEY를 넣고 Expo를 완전히 재시작(Ctrl+C 후 npx expo start --clear)해 주세요.';
  }

  if (!hasKey && edgeFailed) {
    return `Edge Function이 동작하지 않아요. (${edge.detail ?? '미배포'}) Supabase에 search-places를 배포하거나 .env에 REST API 키를 설정해 주세요.`;
  }

  if (hasKey && clientFailed) {
    if (client.detail === 'invalid_key') {
      return '카카오 REST API 키가 올바르지 않아요. developers.kakao.com에서 REST API 키를 확인해 주세요.';
    }
    return `카카오 API 호출에 실패했어요. (${client.detail ?? '알 수 없음'}) Expo를 재시작했는지 확인해 주세요.`;
  }

  return '장소 검색을 설정할 수 없어요. docs/KAKAO_PLACES.md를 참고해 주세요.';
}

export async function searchKakaoPlaces(
  query: string,
): Promise<{ places: KakaoPlace[]; error: string | null }> {
  const q = query.trim();
  if (q.length < 2) {
    return { places: [], error: null };
  }

  const edge = await searchViaEdgeFunction(q);
  if (edge.ok) {
    return { places: edge.places, error: null };
  }

  const client = await searchViaClientKey(q);
  if (client.ok) {
    return { places: client.places, error: null };
  }

  return { places: [], error: buildSearchError(edge, client) };
}
