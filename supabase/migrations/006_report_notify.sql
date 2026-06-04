-- 신고 접수 시 운영자 이메일 알림 (선택: Supabase Dashboard → Database Webhooks)
-- Edge Function route-report-notify 연동용 컬럼 확장 없음 — webhook on insert route_reports

comment on table public.route_reports is
  'MVP: Dashboard webhook → email 또는 주 1회 수동 검토. payload: route_id, reporter_id, reason';
