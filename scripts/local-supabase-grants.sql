-- Local-dev only: grant table privileges to anon/authenticated for the local
-- Supabase CLI stack.
--
-- Why this is needed: hosted Supabase grants DML privileges on the public schema
-- to the anon/authenticated roles (row access is then gated by RLS policies). The
-- local Supabase CLI stack creates migration tables as the `postgres` role, whose
-- default privileges only grant TRUNCATE/REFERENCES/TRIGGER — so direct
-- `supabase.from('...').select()` calls (e.g. route detail) return 42501
-- "permission denied". This script restores hosted parity. RLS still protects rows.
--
-- Run after `supabase start` (or `supabase db reset`):
--   docker exec -i supabase_db_<project_id> psql -U postgres -d postgres -f - < scripts/local-supabase-grants.sql
-- (project_id is in supabase/config.toml)

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on routines to anon, authenticated, service_role;
