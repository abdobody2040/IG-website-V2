# Instant Grow — Observability Strategy

## Current State

- **Edge Functions:** Log via `console.log` / `console.error` (viewable in Supabase dashboard)
- **Frontend:** No error tracking service configured
- **Analytics:** No analytics service configured
- **Monitoring:** No uptime monitoring configured
- **Alerting:** No alerting system configured

## Recommended Architecture

### Logging

**Edge Functions:**
- Use structured JSON logging for machine-parseable logs
- Log levels: INFO, WARN, ERROR
- Never log PII (email, name, phone, address)
- Include: requestId, function name, duration, status code

**Recommended format:**
```typescript
function log(level: string, message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta || {}),
  }))
}
```

**Frontend:**
- Integrate Sentry for error tracking
- Capture unhandled promise rejections
- Capture React render errors

### Tracing

- **Edge Functions:** Add execution time logging to each function
- **Frontend:** Browser performance API for page load timing
- **Supabase:** Built-in query performance insights

### Monitoring Tools

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Sentry | Error tracking (frontend + backend) | 5K events/month |
| Better Uptime | Uptime monitoring + status page | 1 monitor free |
| Checkly | Synthetic monitoring + API checks | 5 checks free |
| Supabase Logs | Edge Function logs + DB queries | Included |
| PostHog | Product analytics + session recording | 1M events/month |
| Plausible | Lightweight analytics (GDPR-compliant) | Free self-hosted |

### Recommended Setup

**1. Error Tracking — Sentry**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
})
```

**2. Uptime Monitoring — Better Uptime**
- Monitor: https://instantgrow.net
- Check interval: 1 minute
- Alert via: Telegram bot, email

**3. Edge Function Logging — Supabase Dashboard**
- View: Supabase → Edge Functions → Logs
- Filter by function name, status, time range

### Analytics

**Recommended: Plausible or PostHog**

Plausible (lightweight):
```html
<script defer data-domain="instantgrow.net" src="https://plausible.io/js/script.js"></script>
```

PostHog (feature-rich):
```typescript
import posthog from 'posthog-js'

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
})
```

### Audit Logging

**Current:** Order status changes tracked in `order_updates` table.

**Recommended addition:**
```sql
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,          -- 'delete_user', 'update_order', etc.
  target_type TEXT NOT NULL,     -- 'user', 'order', 'company'
  target_id UUID,
  details JSONB,                 -- Previous values, changed fields
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Alerting

**Telegram Bot Integration:**
```typescript
// Edge Function for sending alerts
async function sendTelegramAlert(message: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN")
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID")
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })
}
```

**Alert Events:**
- Stripe webhook failure (signature mismatch, DB write failure)
- High error rate in Edge Functions (>5% error rate)
- Order processing delays (order pending > 48 hours)
- Payment failures
- Admin user deletion
- New user signup spikes

### Dashboard

**Recommended: Grafana + Prometheus (for production)**
- Track: API latency, error rates, active users, order volume, revenue
- Deploy Grafana Cloud free tier (up to 3 dashboards)

### Uptime Monitoring

**Immediate setup:**
1. Create Better Uptime account
2. Add monitor for production URL
3. Configure Telegram/email alerts
4. Create status page: status.instantgrow.net

### Monitoring Directory

`/monitoring/` contains:
- `alerts.md` — Alert rules and configuration
- `dashboards.md` — Dashboard configurations
- `runbooks.md` — Incident response procedures
