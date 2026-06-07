import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { createAuthStorage } from '@/lib/auth-storage';

export const EAS_SUPABASE_SETUP_HINT =
  'EAS → Environment variables(preview)에 EXPO_PUBLIC_SUPABASE_URL·ANON_KEY를 Sensitive로 등록한 뒤 eas build를 다시 실행해 주세요.';

function readPublicEnv(key: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'): string {
  const fromBundle = process.env[key];
  if (fromBundle?.trim()) return fromBundle.trim();
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return (extra?.[key] ?? '').trim();
}

function resolveSupabaseUrl(raw: string | undefined): string {
  if (!raw) return '';
  const m = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (m) return `https://${m[1]}.supabase.co`;
  return raw.replace(/\/$/, '');
}

const url = resolveSupabaseUrl(readPublicEnv('EXPO_PUBLIC_SUPABASE_URL'));
const anonKey = readPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('placeholder') && anonKey.startsWith('eyJ'),
);

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
  auth: {
    storage: createAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** APK에서 Supabase 주입 여부 확인용 (키 값은 노출하지 않음) */
export function supabaseConfigStatus(): { ok: boolean; host: string | null } {
  try {
    const host = url ? new URL(url).host : null;
    return { ok: isSupabaseConfigured, host };
  } catch {
    return { ok: false, host: null };
  }
}
