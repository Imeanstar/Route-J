-- Supabase Dashboard → Storage → New bucket: route-photos (public read 권장 MVP)

-- 인증 사용자 업로드 · 읽기 예시 (Dashboard SQL 또는 여기 실행)
-- create policy "route photos upload" on storage.objects for insert to authenticated with check (bucket_id = 'route-photos');
-- create policy "route photos read" on storage.objects for select using (bucket_id = 'route-photos');
