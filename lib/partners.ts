import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type PartnerBenefit = {
  id: string;
  venue_id: string;
  title: string;
  description: string;
  coupon_code: string | null;
  plus_only: boolean;
  discount_label: string;
  venue_name?: string;
  region_name?: string;
};

export async function fetchPartnerBenefits(regionName?: string) {
  if (!isSupabaseConfigured) return { benefits: [] as PartnerBenefit[], error: null };

  let query = supabase
    .from('partner_benefits')
    .select('*, partner_venues(name, region_name)')
    .order('created_at', { ascending: true });

  const { data, error } = await query;
  if (error) return { benefits: [], error: error.message };

  const benefits: PartnerBenefit[] = (data ?? []).map((row: Record<string, unknown>) => {
    const venue = row.partner_venues as { name: string; region_name: string } | null;
    return {
      id: row.id as string,
      venue_id: row.venue_id as string,
      title: row.title as string,
      description: row.description as string,
      coupon_code: row.coupon_code as string | null,
      plus_only: row.plus_only as boolean,
      discount_label: row.discount_label as string,
      venue_name: venue?.name,
      region_name: venue?.region_name,
    };
  });

  const filtered = regionName
    ? benefits.filter((b) => b.region_name?.includes(regionName))
    : benefits;

  return { benefits: filtered, error: null };
}
