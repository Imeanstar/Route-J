-- route-photos 버킷 정책 (Dashboard에서 버킷 생성 후 실행)
-- Storage → New bucket: route-photos, Public: true (MVP)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'route-photos',
  'route-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "route_photos_public_read" on storage.objects;
create policy "route_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'route-photos');

drop policy if exists "route_photos_auth_insert" on storage.objects;
create policy "route_photos_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'route-photos'
    and (storage.foldername(name))[1] in (
      select c.id::text from public.couples c
      where c.status = 'active'
        and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
    )
  );

drop policy if exists "route_photos_auth_update" on storage.objects;
create policy "route_photos_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'route-photos');

drop policy if exists "route_photos_auth_delete" on storage.objects;
create policy "route_photos_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'route-photos');
