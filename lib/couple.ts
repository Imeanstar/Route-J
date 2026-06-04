import { fetchCoupleRoutes } from '@/lib/routes';
import { supabase } from '@/lib/supabase';
import type { Couple } from '@/types/database';

export type CoupleSummary = {
  partnerName: string;
  connectedAt: string | null;
  routeCount: number;
  publicCount: number;
  coupleOnlyCount: number;
  inviteCode: string;
};

export async function fetchCoupleSummary(
  couple: Couple,
  myUserId: string,
): Promise<{ summary: CoupleSummary | null; error: string | null }> {
  const partnerId =
    couple.user1_id === myUserId ? couple.user2_id : couple.user1_id;

  let partnerName = '상대';
  if (partnerId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partnerId)
      .maybeSingle();
    const name = profile?.display_name?.trim();
    if (name) partnerName = name.endsWith('님') ? name : `${name}님`;
  }

  const { routes, error } = await fetchCoupleRoutes();
  if (error) return { summary: null, error };

  const active = routes.filter((r) => r.visibility !== 'deleted');
  return {
    summary: {
      partnerName,
      connectedAt: couple.connected_at,
      routeCount: active.length,
      publicCount: active.filter((r) => r.visibility === 'public').length,
      coupleOnlyCount: active.filter((r) => r.visibility === 'couple_only').length,
      inviteCode: couple.invite_code,
    },
    error: null,
  };
}

export async function createInvite(): Promise<{ couple: Couple | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_couple_invite');
  return { couple: data as Couple | null, error: error?.message ?? null };
}

export async function joinWithCode(code: string): Promise<{ couple: Couple | null; error: string | null }> {
  const { data, error } = await supabase.rpc('join_couple_with_code', { p_code: code });
  return { couple: data as Couple | null, error: error?.message ?? null };
}
