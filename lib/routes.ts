import { GUEST_HOME_TOP, GUEST_PER_CATEGORY_TOP } from '@/constants/app';
import { supabase } from '@/lib/supabase';
import type { Route, RouteStop, RouteVisibility } from '@/types/database';

export type RouteFilters = {
  regionId?: string;
  stationId?: string;
  themeId?: string;
  search?: string;
};

export async function fetchPopularRoutes(
  tier: 'guest' | 'member' | 'couple',
  filters: RouteFilters = {},
  options?: { categoryPreview?: boolean },
) {
  const limit =
    tier === 'guest'
      ? options?.categoryPreview
        ? GUEST_PER_CATEGORY_TOP
        : GUEST_HOME_TOP
      : 50;

  const { data, error } = await supabase.rpc('get_public_routes_popular', {
    p_limit: limit,
    p_region_id: filters.regionId ?? null,
    p_station_id: filters.stationId ?? null,
    p_theme_id: filters.themeId ?? null,
    p_search: filters.search?.trim() || null,
  });

  return { routes: (data as Route[]) ?? [], error: error?.message };
}

export async function fetchCoupleRoutes() {
  const { data, error } = await supabase.rpc('get_couple_routes');
  return { routes: (data as Route[]) ?? [], error: error?.message };
}

export async function fetchRouteById(id: string) {
  const { data, error } = await supabase.from('routes').select('*').eq('id', id).single();
  return { route: data as Route | null, error: error?.message };
}

export async function fetchRouteStops(routeId: string) {
  const { data, error } = await supabase
    .from('route_stops')
    .select('*')
    .eq('route_id', routeId)
    .order('sort_order', { ascending: true });
  return { stops: (data as RouteStop[]) ?? [], error: error?.message };
}

export async function incrementView(routeId: string) {
  await supabase.rpc('increment_route_view', { p_route_id: routeId });
}

export async function toggleLike(routeId: string, userId: string, liked: boolean) {
  if (liked) {
    return supabase.from('route_likes').delete().eq('route_id', routeId).eq('user_id', userId);
  }
  return supabase.from('route_likes').insert({ route_id: routeId, user_id: userId });
}

export async function toggleBookmark(routeId: string, userId: string, saved: boolean) {
  if (saved) {
    return supabase.from('route_bookmarks').delete().eq('route_id', routeId).eq('user_id', userId);
  }
  return supabase.from('route_bookmarks').insert({ route_id: routeId, user_id: userId });
}

export async function reportRoute(routeId: string, reporterId: string, reason: string) {
  return supabase.from('route_reports').insert({ route_id: routeId, reporter_id: reporterId, reason });
}

export async function updateRouteVisibility(routeId: string, visibility: RouteVisibility) {
  const patch: Partial<Route> = { visibility, updated_at: new Date().toISOString() };
  if (visibility === 'deleted') {
    Object.assign(patch, { deleted_at: new Date().toISOString() });
  }
  return supabase.from('routes').update(patch).eq('id', routeId);
}

export type StopInput = {
  place_name: string;
  address?: string;
  lat?: number;
  lng?: number;
  photo_path?: string;
  rating?: number;
  memo?: string;
};

export type CreateRouteInput = {
  coupleId: string;
  userId: string;
  title: string;
  description: string;
  regionId?: string;
  stationId?: string;
  themeIds: string[];
  visibility: RouteVisibility;
  stops: StopInput[];
};

export async function createRoute(input: CreateRouteInput) {
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({
      couple_id: input.coupleId,
      created_by: input.userId,
      title: input.title,
      description: input.description,
      region_id: input.regionId ?? null,
      station_id: input.stationId ?? null,
      visibility: input.visibility,
    })
    .select()
    .single();

  if (routeError || !route) return { route: null, error: routeError?.message ?? '루트 생성 실패' };

  if (input.themeIds.length) {
    await supabase.from('route_themes').insert(
      input.themeIds.map((theme_id) => ({ route_id: route.id, theme_id })),
    );
  }

  const stopsPayload = input.stops.map((s, i) => ({
    route_id: route.id,
    sort_order: i,
    place_name: s.place_name,
    address: s.address ?? null,
    lat: s.lat ?? null,
    lng: s.lng ?? null,
    photo_path: s.photo_path ?? null,
    rating: s.rating ?? null,
    memo: s.memo?.trim() || null,
  }));

  const { error: stopsError } = await supabase.from('route_stops').insert(stopsPayload);
  if (stopsError) return { route: null, error: stopsError.message };

  return { route: route as Route, error: null };
}

export async function fetchRouteThemeIds(routeId: string) {
  const { data, error } = await supabase
    .from('route_themes')
    .select('theme_id')
    .eq('route_id', routeId);
  if (error) return { themeIds: [] as string[], error: error.message };
  return { themeIds: (data ?? []).map((row) => row.theme_id as string), error: null };
}

export type UpdateRouteInput = {
  routeId: string;
  title: string;
  description: string;
  regionId?: string;
  stationId?: string;
  themeIds: string[];
  visibility: RouteVisibility;
  stops: StopInput[];
};

export async function updateRoute(input: UpdateRouteInput) {
  const { error: routeError } = await supabase
    .from('routes')
    .update({
      title: input.title,
      description: input.description,
      region_id: input.regionId ?? null,
      station_id: input.stationId ?? null,
      visibility: input.visibility,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.routeId);

  if (routeError) return { route: null, error: routeError.message };

  await supabase.from('route_themes').delete().eq('route_id', input.routeId);
  if (input.themeIds.length) {
    await supabase.from('route_themes').insert(
      input.themeIds.map((theme_id) => ({ route_id: input.routeId, theme_id })),
    );
  }

  await supabase.from('route_stops').delete().eq('route_id', input.routeId);
  const stopsPayload = input.stops.map((s, i) => ({
    route_id: input.routeId,
    sort_order: i,
    place_name: s.place_name,
    address: s.address ?? null,
    lat: s.lat ?? null,
    lng: s.lng ?? null,
    photo_path: s.photo_path ?? null,
    rating: s.rating ?? null,
    memo: s.memo?.trim() || null,
  }));

  const { error: stopsError } = await supabase.from('route_stops').insert(stopsPayload);
  if (stopsError) return { route: null, error: stopsError.message };

  const { data: route, error: fetchError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', input.routeId)
    .single();

  if (fetchError || !route) return { route: null, error: fetchError?.message ?? '루트 조회 실패' };
  return { route: route as Route, error: null };
}
