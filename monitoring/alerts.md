# Instant Grow — Alert Rules

## Critical Alerts

| Condition | Action | Channel |
|-----------|--------|---------|
| Stripe webhook signature fails | Notify admin immediately | Telegram + Email |
| Stripe webhook DB write fails | Notify admin immediately | Telegram + Email |
| Edge Function error rate > 5% | Investigate root cause | Telegram |
| Production site down | Restart deployment | Telegram + Email |

## Warning Alerts

| Condition | Action | Channel |
|-----------|--------|---------|
| Order pending > 48 hours | Flag for admin review | Admin dashboard |
| Payment amount mismatch | Manual reconciliation | Email |
| File upload failure rate > 2% | Check R2/Supabase Storage | Telegram |
| Email send failure rate > 5% | Check Resend API | Telegram |

## Info Alerts

| Condition | Action | Channel |
|-----------|--------|---------|
| New user signup (daily summary) | Track growth metrics | Dashboard |
| New order placed | Process order | Admin dashboard |
| Compliance date approaching | Send reminder email | Email |
