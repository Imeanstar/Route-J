import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AnalyticsEvent =
  | 'app_open'
  | 'onboarding_complete'
  | 'route_share'
  | 'plus_info_open'
  | 'benefit_redeem'
  | 'plus_purchase_sync'
  | 'kakao_login_attempt';

export async function trackEvent(eventName: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (!isSupabaseConfigured) return;
  try {
    const { data: session } = await supabase.auth.getSession();
    await supabase.from('app_events').insert({
      event_name: eventName,
      payload,
      user_id: session.session?.user?.id ?? null,
    });
  } catch {
    /* non-blocking */
  }
}
