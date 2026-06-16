# AGENTS.md

루트제이 (Route J) — 커플 데이트 루트 공유 앱. Expo (React Native, web/iOS/Android 공통 코드) + Supabase 백엔드.

## Cursor Cloud specific instructions

This environment runs the app on **web** (`react-native-web` via Expo) against a **local Supabase** stack (Docker). Node 22 (`.nvmrc`) is used. `npm install` (the update script) only refreshes JS deps — services below are NOT auto-started and must be brought up manually each session.

### One-time-per-session startup (services)

1. **Docker daemon** (no systemd here, start it yourself if `docker info` fails):
   - `sudo dockerd` in a background/tmux session, then `sudo chmod 666 /var/run/docker.sock` (the `ubuntu` user is already in the `docker` group, but the socket perms reset each boot).
2. **Local Supabase** (applies `supabase/migrations/*` automatically on first start):
   - `npx supabase start` (run from repo root; CLI is used via `npx`, no global install). `npx supabase status` prints URLs/keys.
   - The API is `http://127.0.0.1:54321`; DB container is `supabase_db_mzqlnhvanubhkixggpvh` (project_id in `supabase/config.toml`).
3. **Grant table privileges to anon/authenticated** (REQUIRED — see gotcha below):
   - `docker exec -i supabase_db_mzqlnhvanubhkixggpvh psql -U postgres -d postgres -f - < scripts/local-supabase-grants.sql`
4. **`.env`** (gitignored; recreate if missing) with the local Supabase URL + the legacy `anon` JWT key from `npx supabase status` (the app requires a key starting with `eyJ`, so use `ANON_KEY`, NOT the new `sb_publishable_...` key):
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from supabase status>
   ```
5. **Expo web dev server**: `npm run web` (Metro on `http://localhost:8081`; press `w` or open the URL). Smoke test the backend with `node scripts/verify-supabase.mjs`.

### Key gotchas

- **anon/authenticated table grants (critical):** Hosted Supabase grants DML on `public` tables to `anon`/`authenticated` (RLS gates rows). The local CLI creates migration tables as the `postgres` role, whose default privileges do NOT include `SELECT`, so direct `supabase.from('...').select()` calls (e.g. route detail, `regions`/`themes` in the editor) fail with `42501 permission denied` and screens hang on "불러오는 중…". `scripts/local-supabase-grants.sql` restores parity and is idempotent; re-run it after any `supabase start` / `supabase db reset`.
- **Legacy vs new keys:** newer Supabase CLI shows `sb_publishable_...` keys, but `lib/supabase.ts` validates that the anon key starts with `eyJ`. Always use the `ANON_KEY` (JWT) from `supabase status`.
- **Demo feed data:** `supabase/seed.sql` (regions/themes/stations) runs automatically on `supabase start`. The 20 demo routes in `supabase/seed_demo_routes.sql` are NOT auto-loaded — they require two seed auth users + an active couple first. To load: create `seed1@routej.local` / `seed2@routej.local` (password `RouteJSeed2026!`) via the auth admin API (`POST /auth/v1/admin/users` with `email_confirm:true` using the service_role key), insert an `active` row in `public.couples` linking them, then run `seed_demo_routes.sql`. Without them the feed is empty (the app still works).
- **Optional Kakao features are not configured:** place search (route creation) and the map view need Kakao keys/edge function. On web, place search needs the `search-places` edge function + `KAKAO_REST_API_KEY`; without it you cannot add stops, so **creating a route via the web UI is not possible** in this environment. The route-detail map shows a "EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY를 설정해 주세요" notice — this is expected, not a bug. Core flows (browse, sign up/login, like, bookmark) work without Kakao.
- **Local signup auto-confirms** (`mailer_autoconfirm: true`), so a fresh sign-up logs in immediately — no email step.

### Lint / build

- Lint: `npm run lint` (`expo lint`). Pre-existing warnings/errors exist (e.g. an `import/no-unresolved` false positive for platform-specific `lib/load-app-fonts.*` files, a Deno import in the edge function); these are not environment issues.
- There is no web "build" step used for dev; run via the Metro dev server (`npm run web`). Native store builds use EAS (`docs/EAS_BUILD.md`), not needed for local dev.
