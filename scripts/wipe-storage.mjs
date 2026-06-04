/**
 * route-photos 버킷 비우기 (Storage API — SQL DELETE 불가)
 * 사용: node scripts/wipe-storage.mjs
 * 필요: .env 에 SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API → service_role)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const BUCKET = 'route-photos';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing .env');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

/** 폴더·파일 경로를 재귀적으로 수집 */
async function collectPaths(supabase, folder = '') {
  const paths = [];
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
      return paths;
    }
    throw error;
  }

  for (const item of data ?? []) {
    const full = folder ? `${folder}/${item.name}` : item.name;
    // 폴더: id 없음 · metadata null (Supabase Storage list 규칙)
    const isFile = item.id != null || item.metadata != null;
    if (isFile) {
      paths.push(full);
    } else {
      paths.push(...(await collectPaths(supabase, full)));
    }
  }
  return paths;
}

async function main() {
  const env = loadEnv();
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Need EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const paths = await collectPaths(supabase);
  console.log(`Found ${paths.length} object(s) in ${BUCKET}`);

  if (paths.length === 0) {
    console.log('Nothing to delete (bucket empty or missing).');
    console.log('Optional: Dashboard → Storage → delete bucket "route-photos"');
    return;
  }

  const batchSize = 100;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) {
      console.error('Remove failed:', error.message);
      process.exit(1);
    }
    console.log(`Removed ${Math.min(i + batchSize, paths.length)} / ${paths.length}`);
  }

  console.log('Done. Optional: Dashboard → Storage → Delete bucket "route-photos"');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
