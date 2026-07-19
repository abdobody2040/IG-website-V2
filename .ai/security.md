# Instant Grow — Security Architecture

## Security Posture Summary

A comprehensive security audit was completed with 14 findings (3 Critical, 5 High, 4 Medium, 2 Low). All 14 have been fixed. See `SECURITY.md` for the full audit report.

## Authentication

| Aspect | Implementation |
|--------|---------------|
| Provider | PocketBase Auth (Custom Endpoint) |
| Methods | Email/password + Google OAuth |
| Session Storage | HttpOnly `pb_auth` Cookie (No localStorage) |
| Token Type | JWT (managed by PocketBase, issued via cookie) |
| Password Policy | Min 8 chars, uppercase, lowercase, number, special char |
| Login Error Handling | Generic "Invalid email or password." |
| Session Refresh | Automatic via PocketBase SDK + Hook interceptors |

## Authorization (RBAC)

Two roles: `client` and `admin`

### Enforcement Layers:
1. **Database (Access Rules):** All collections have PocketBase API access rules (RLS-equivalent)
2. **Frontend:** Route guards (`useRequireAuth`, `useRequireAdmin`)
3. **Edge Functions:** Manual role verification via PocketBase Token verification / Admin API check in Cloudflare Workers

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
- **Backend Sanitization:** `pb_hooks/validation.pb.js` blocks payloads containing `<script`, `javascript:`, or inline event handlers before they are stored in the database.
- CSP headers restrict script sources

## CSRF Protection

- **Anti-CSRF Tokens:** All state-mutating requests (POST, PUT, PATCH, DELETE) require a matching `X-CSRF-Token` header.
- The `pb_hooks/auth_http_only.pb.js` hook issues a `csrf-token` cookie which the frontend reads and injects via `pb.beforeSend`.
- SPA architecture with API calls (not form submissions)
- CSP headers include `form-action 'self'`

## SQL Injection Prevention

- All database queries use PocketBase SDK (which parameterizes SQLite queries)
- No raw SQL construction from user input
- Cloudflare Workers use PocketBase SDK / HTTP API (parameterized)

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
connect-src 'self' http://localhost:8090 http://127.0.0.1:8090 https://challenges.cloudflare.com https://*.workers.dev
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
| Max File Size | 10 MB | useDocumentUpload.ts / upload-validator Worker |
| MIME Type Allowlist | PDF, PNG, JPEG, WEBP, DOC, DOCX | useDocumentUpload.ts / upload-validator Worker |
| Server-Side Validation | Implemented | upload-validator Worker / PocketBase collection rules |

## Secrets Management

- `.env`, `.env.local`, `.env.*` in `.gitignore`
- Only `.env.example` committed (with placeholder values)
- **Sanitized scripts and test suites:** Hardcoded emails (`instantgrow.net@gmail.com`) and default admin passwords (`Admin@2025!`) are removed from all E2E test suites (`tests/e2e/auth.spec.ts`, `tests/e2e/admin-panel.spec.ts`) and utility scripts (`scripts/ensure-admin-user.mjs`, `expand_arabic_blogs.js`), replacing them with environment variables (`process.env.PB_ADMIN_EMAIL` / `process.env.PB_ADMIN_PASSWORD`) and safe generic test values (`admin@example.local` / `AdminTestPassword123!`) for local setup.
- Admin credentials/keys never used in frontend code
- Cloudflare Workers use environment variables/secrets bound via Wrangler/Cloudflare Dashboard
- Stripe webhook secret used only in webhook Worker

## Rate Limiting

- **Global Auth Limiting:** Implemented via `pb_hooks/rate_limiter.pb.js`. Backed by the `rate_limits` collection. Login attempts are restricted to 5 attempts per minute per IP to mitigate brute-force and credential stuffing attacks.
- **Contact form:** Optional Cloudflare Turnstile CAPTCHA
- **Cloudflare Workers:** Rate limiting can be configured via Cloudflare WAF/rate limiting rules

## Webhook Security

- Stripe webhook signature verified via `stripe.webhooks.constructEventAsync()`
- Idempotency via `stripe_session_id` unique constraint
- CORS origin validation on webhook endpoint

## Token Strategy

- **PocketBase Auth:** JWT tokens managed by PocketBase SDK
- **Worker Auth:** Bearer token passed in Authorization header and validated using PocketBase token verification

## Audit Logging

- **Action Tracking:** Every CREATE/UPDATE/DELETE mutation is securely logged into the `admin_audit_log` collection by `pb_hooks/audit_logger.pb.js`.
- **Details Logged:** Action type, collection name, record ID, and user IP.
- **Order status changes:** Tracked in `order_updates` table with `created_by`
- **Webhook events:** Logged via `console.log` in Cloudflare Workers

## Recommended Security Improvements

1. **Rate limiting on Workers** — Add rate limiting for contact form and auth endpoints
2. **HTTPS-only enforcement** — ✅ Enforced via fly.toml force_https and CSP upgrade-insecure-requests
3. **PocketBase Admin Restriction** — ✅ Enforced via pb_hooks/restrict_admin.pb.js (restricts /_/ to localhost/SSH tunnels only)
4. **Dependency scanning** — Add Dependabot or Snyk to CI/CD

---

*Manual RLS Policy Review completed on 2026-07-07. All 10 active collections confirmed locked down to owners (`user = @request.auth.id`) or admins (`@request.auth.role = 'admin'`). SetupPage has been permanently deleted.*
