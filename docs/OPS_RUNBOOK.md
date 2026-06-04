# RouteJ 운영 런북 (Phase 3)

## 주간 루틴 (1인 운영 · 2~3시간)

| 요일 | 작업 |
|------|------|
| 월 | `route_reports` 미처리 건 검토 → 삭제/비공개 |
| 수 | `partner_venues` `valid_until`·`is_active` 만료 확인 |
| 금 | `app_events` 스프레드시트 export (MAU·공유·Plus) |

## 지표 export (SQL 예시)

```sql
-- 주간 신규 공개 루트
select count(*) from routes where visibility = 'public' and created_at > now() - interval '7 days';

-- 이벤트 (온보딩·공유)
select event_name, count(*) from app_events
where created_at > now() - interval '7 days'
group by event_name;
```

## 제휴 만료

- `partner_benefits.valid_until` 지난 행 → 앱 비노출 (필터는 클라이언트 + 필요 시 view)
- 매장 월 고정 스폰서십: 스프레드시트로 계약일·금액 관리

## Plus 수동 부여 (파일럿)

```sql
insert into couple_subscriptions (couple_id, plan, status, provider, current_period_end)
values ('<couple_uuid>', 'plus_monthly', 'active', 'manual', now() + interval '30 days')
on conflict (couple_id) do update set status = 'active', current_period_end = excluded.current_period_end;
```

## MRR 목표식

`MRR ≈ (유료 커플 × ARPU) + (제휴 월 고정 × N) + 스폰서`

초기에는 제휴 월 고정이 ARPU보다 빠르게 쌓이는 경우가 많습니다.
