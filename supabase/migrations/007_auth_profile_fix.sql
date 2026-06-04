-- 회원가입 시 "Database error saving new user" 방지
-- (wipe 후 트리거·권한 꼬임, profiles INSERT RLS 등)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do update
    set display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auth 서비스가 프로필 행을 만들 수 있도록 (Supabase 호스팅)
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update on table public.profiles to service_role;
grant select, insert, update on table public.profiles to authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    grant usage on schema public to supabase_auth_admin;
    grant insert, update on table public.profiles to supabase_auth_admin;
  end if;
end $$;
