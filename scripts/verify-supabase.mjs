/**
 * Supabase 연결·RPC 스모크 테스트
 * 사용: node scripts/verify-supabase.mjs
 * 필요: .env 의 EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing .env at', envPath);
    process.exit(1);
  }
  const text = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[name] = value;
  }
  return env;
}

function normalizeSupabaseUrl(raw) {
  if (!raw) return { url: null, hint: null };
  const dashboard = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboard) {
    const ref = dashboard[1];
    return {
      url: `https://${ref}.supabase.co`,
      hint: `Dashboard 주소가 아니라 API URL이 필요합니다 → https://${ref}.supabase.co`,
    };
  }
  return { url: raw.replace(/\/$/, ''), hint: null };
}

const env = loadEnv();
const rawUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const { url, hint } = normalizeSupabaseUrl(rawUrl);

if (!rawUrl) {
  console.error('Invalid Supabase env: EXPO_PUBLIC_SUPABASE_URL 이 비어 있습니다.');
  process.exit(1);
}
if (hint) {
  console.error('Invalid Supabase env:', hint);
  console.error('.env 예시: EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co');
  process.exit(1);
}
if (!key) {
  console.error('Invalid Supabase env: EXPO_PUBLIC_SUPABASE_ANON_KEY 가 비어 있습니다.');
  process.exit(1);
}
if (!url || url.includes('placeholder')) {
  console.error('Invalid Supabase env: URL 형식을 확인하세요.');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

async function rpc(name, body = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log('Supabase URL:', url);

  const popular = await rpc('get_public_routes_popular', {
    p_limit: 10,
    p_region_id: null,
    p_station_id: null,
    p_theme_id: null,
    p_search: null,
  });

  if (!popular.ok) {
    console.error('get_public_routes_popular failed', popular.status, popular.data);
    process.exit(1);
  }

  const count = Array.isArray(popular.data) ? popular.data.length : 0;
  console.log(`OK: public routes returned ${count} item(s)`);
  if (count === 0) {
    console.warn('WARN: 피드가 비어 있습니다. seed_demo_routes.sql 실행을 권장합니다.');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
