# Instant Grow — Security Architecture

## Security Posture Summary

A comprehensive security audit was completed with 14 findings (3 Critical, 5 High, 4 Medium, 2 Low). All 14 have been fixed. See `SECURITY.md` for the full audit report.

## Authentication

| Aspect | Implementation |
|--------|---------------|
| Provider | Supabase Auth |
| Methods | Email/password + Google OAuth |
| Session Storage | localStorage (Supabase JS SDK) |
| Token Type | JWT (managed by Supabase) |
| Password Policy | Min 8 chars, uppercase, lowercase, number, special char |
| Login Error Handling | Generic "Invalid email or password." |
| Session Refresh | Automatic via Supabase SDK |

## Authorization (RBAC)

Two roles: `client` and `admin`

### Enforcement Layers:
1. **Database (RLS):** All 8 tables have RLS policies
2. **Frontend:** Route guards (`useRequireAuth`, `useRequireAdmin`)
3. **Edge Functions:** Manual role verification via Supabase Admin API

### RLS Policy Summary:
| Table | User Access | Admin Access |
|-------|-------------|--------------|
| profiles | Own row only | All rows |
| orders | Own rows | All rows |
| companies | Own rows | All rows |
| documents | Own rows | All rows |
| payments | Own rows | All rows |
| order_updates | Via order ownership | All rows |
| contact_messages | N/A (anonymous insert) | All rows |
| notification_preferences | Own row only | N/A |

### is_admin() Function:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

This is **SECURITY DEFINER** to avoid infinite recursion in RLS policies.

## XSS Prevention

- React escapes all rendered content by default
- No `dangerouslySetInnerHTML` in codebase
- No `eval()` or `new Function()` usage
- CSP headers restrict script sources

## CSRF Protection

- Supabase Auth tokens stored in `localStorage` (not cookies)
- SPA architecture with API calls (not form submissions)
- CSP headers include `form-action 'self'`

## SQL Injection Prevention

- All database queries use Supabase client's parameterized queries
- No raw SQL construction from user input
- Edge Functions use Supabase client (parameterized)

## Security Headers

**In `index.html` (meta tags):**
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

**Content Security Policy:**
```
default-src 'self'
script-src 'self' https://challenges.cloudflare.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: https: blob:
connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://*.workers.dev
frame-src https://challenges.cloudflare.com
object-src 'none'
base-uri 'self'
form-action 'self'
```

**In `public/_headers` (for Netlify/Cloudflare Pages):**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: ...
```

## Upload Validation

| Check | Implementation | Location |
|-------|---------------|----------|
| Max File Size | 10 MB | useDocumentUpload.ts |
| MIME Type Allowlist | PDF, PNG, JPEG, WEBP, DOC, DOCX | useDocumentUpload.ts |
| Server-Side Validation | TODO: Not yet implemented | R2 Worker / Supabase Storage |

## Secrets Management

- `.env`, `.env.local`, `.env.*` in `.gitignore`
- Only `.env.example` committed (with placeholder values)
- Service role key never used in frontend code
- Edge Functions use `Deno.env.get()` for server-side secrets
- Stripe webhook secret used only in webhook function

## Rate Limiting

- **Contact form:** Optional Cloudflare Turnstile CAPTCHA
- **Supabase:** Rate limiting can be configured in Authentication → Rate Limits
- **Edge Functions:** No application-level rate limiting yet

## Webhook Security

- Stripe webhook signature verified via `stripe.webhooks.constructEventAsync()`
- Idempotency via `stripe_session_id` unique constraint
- CORS origin validation on webhook endpoint

## Token Strategy

- **Supabase Auth:** JWT tokens managed by Supabase SDK
- **Edge Function Auth:** Bearer token passed in Authorization header
- **Service Role Key:** Used only in server-side Edge Functions
- **No API tokens:** External API access not yet implemented

## Audit Logging

- **Order status changes:** Tracked in `order_updates` table with `created_by`
- **Webhook events:** Logged via `console.log` in Edge Functions
- **Admin actions:** No audit log (recommend adding for compliance)

## Recommended Security Improvements

1. **Server-side upload validation** — Add MIME/size checks in R2 Worker/Supabase Storage
2. **Rate limiting on Edge Functions** — Add rate limiting for contact form and auth endpoints
3. **Audit log for admin actions** — Create `admin_audit_log` table
4. **HTTPS-only enforcement** — Ensure production deployment forces HTTPS
5. **Remove SetupPage** — Or restrict with IP allowlist before production
6. **Supabase MFA** — Enable multi-factor authentication for admin accounts
7. **Dependency scanning** — Add Dependabot or Snyk to CI/CD
