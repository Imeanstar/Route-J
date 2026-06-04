import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { createAuthStorage } from '@/lib/auth-storage';

function resolveSupabaseUrl(raw: string | undefined): string {
  if (!raw) return '';
  const m = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (m) return `https://${m[1]}.supabase.co`;
  return raw.replace(/\/$/, '');
}

const url = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

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
