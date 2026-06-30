# Instant Grow — Dashboards

## Supabase Dashboard

Built-in Supabase monitoring:
- **Database:** Query performance, active connections, table sizes
- **Edge Functions:** Execution count, error rate, duration
- **Auth:** Active users, signups, sign-ins
- **Storage:** Bandwidth, file count

## Grafana Dashboard (Recommended)

### Key Metrics
- Revenue (daily, weekly, monthly)
- New orders
- Order completion rate
- Active clients
- Edge Function latencies (p50, p95, p99)
- Error rate by function

### Panels
1. Revenue Chart (7-day rolling)
2. Order Status Distribution (pie chart)
3. New Users vs New Orders (line chart)
4. Edge Function Health (latency + error rate)
5. Storage Usage (R2 + Supabase Storage)

## Admin Panel Dashboard

Built-in analytics in `/admin/analytics`:
- Revenue over time
- Orders by status
- Orders by package
- Orders by region
