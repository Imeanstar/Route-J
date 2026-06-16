import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { createAuthStorage } from '@/lib/auth-storage';

export const EAS_SUPABASE_SETUP_HINT =
  'EAS → Environment variables(preview)에 EXPO_PUBLIC_SUPABASE_URL·ANON_KEY를 Sensitive로 등록한 뒤 eas build를 다시 실행해 주세요.';

/** Expo Go·로컬 개발 — Network request failed 시 (EAS 안내와 혼동 방지) */
export const DEV_SUPABASE_NETWORK_HINT =
  'Expo Go: 프로필 탭 하단 "서버: mzqlnhvanubhkixggpvh.supabase.co"가 보이는지 확인하세요. 없으면 .env 확인 후 npx expo start --clear. 서버가 보이는데도 실패하면 폰 Wi‑Fi(PC와 같은 망), VPN 끄기, Supabase 대시보드에서 프로젝트 일시중지(paused) 여부를 확인하세요.';

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
    detectSessionInUrl: Platform.OS === 'web',
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
