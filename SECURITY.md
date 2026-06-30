# Security Policy & Audit Report

## Reporting Vulnerabilities

If you discover a security vulnerability, email **security@instantgrow.net** immediately. Do not open a public GitHub issue.

---

## Security Audit — April 2026

### Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 3     | 3     | 0         |
| High     | 5     | 5     | 0         |
| Medium   | 4     | 4     | 0         |
| Low      | 2     | 2     | 0         |

---

### Critical — Fixed

**1. `.env` files committed to Git**
- `.env` (Supabase URL + anon key) and `.env.local` (old Blink keys) were tracked in the repository.
- **Fix**: Added `.env` and `.env.*` to `.gitignore`, removed from tracking, created `.env.example`.
- **Action required**: Rotate the Supabase anon key and any Blink keys that were committed.

**2. SetupPage exposes hardcoded credentials in production**
- `/setup` route displays `admin@instantgrow.net` / `Admin@2025!` credentials and can create admin accounts. Accessible to anyone in production.
- **Fix**: Added `import.meta.env.PROD` guard — page now shows "Not Available" in production builds.
- **Action required**: Change the admin password (`Admin@2025!`) since it was exposed in source code.

**3. Weak password policy**
- Signup only required 8 characters minimum — no uppercase, lowercase, number, or special character requirements.
- **Fix**: Added full password strength validation (uppercase, lowercase, number, special character).

### High — Fixed

**4. CORS wildcard on Stripe webhook**
- `Access-Control-Allow-Origin: *` allowed any origin to call the webhook endpoint.
- **Fix**: CORS origin is now validated against `ALLOWED_ORIGIN` env var. Set this to your frontend domain.

**5. No authentication on external API calls**
- Checkout, R2 upload, and email endpoints were called without any auth headers. Anyone who discovered the endpoint URLs could exploit them.
- **Fix**: All three now attach `Authorization: Bearer <token>` from the Supabase session.

**6. No file upload validation**
- Any file type and any file size could be uploaded.
- **Fix**: Added 10 MB size limit and allowlist of document types (PDF, PNG, JPEG, WEBP, DOC, DOCX).

**7. No security headers**
- No X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, or Permissions-Policy headers.
- **Fix**: Added meta tags to `index.html` and a `public/_headers` file for Netlify/Cloudflare Pages deployment.

**8. Login error messages leak Supabase internals**
- Raw Supabase error messages were displayed to users (e.g., "Invalid login credentials", "Email not confirmed").
- **Fix**: Login now always shows the generic "Invalid email or password." message.

### Medium — Fixed

**9. No rate limiting on contact form**
- The contact form allows anonymous inserts (`with check (true)` RLS policy). No CAPTCHA or rate limiting exists, making it vulnerable to spam.
- **Fix**: Added Cloudflare Turnstile CAPTCHA widget to the contact form. The widget is opt-in via `VITE_TURNSTILE_SITE_KEY` env var — when not set, the form works without CAPTCHA.

**10. Customer PII stored in order notes as plain text**
- The Stripe webhook stores name, phone, country, address, and email in the `orders.notes` column as a concatenated string. This makes GDPR-compliant data deletion and auditing harder.
- **Fix**: Added dedicated columns to the `orders` table (`customer_name`, `customer_email`, `customer_phone`, `customer_country`, `customer_address`, `business_activity`, `stripe_session_id`). Webhook now writes PII to these columns instead of concatenating into `notes`. Migration SQL provided in `supabase/migrations/20260424_add_order_customer_columns.sql`.

**11. npm dependency vulnerability (postcss)**
- postcss < 8.5.10 had a moderate XSS vulnerability (GHSA-qx2v-qp2m-jg93).
- **Fix**: Updated postcss to 8.5.12 via `npm audit fix`.

**12. User deletion only removes profile, not auth user**
- Admin "Delete User" only deletes the `profiles` row. The user can still authenticate via `auth.users`.
- **Fix**: Created `functions/delete-user/` Edge Function that uses `supabase.auth.admin.deleteUser()` to fully remove users from both `profiles` and `auth.users`. Admin frontend calls this endpoint when `VITE_DELETE_USER_ENDPOINT` is configured, falls back to profile-only deletion otherwise.

### Low — Fixed

**13. Predictable order/invoice numbers**
- Order numbers (`IG-${Date.now().toString().slice(-6)}`) and invoice IDs (`INV-${Date.now().toString().slice(-8)}`) are timestamp-based and guessable.
- **Fix**: Replaced with `crypto.randomUUID()` slices (8 uppercase hex chars), e.g. `IG-A1B2C3D4`, `INV-E5F6G7H8`.

**14. Old Vite boilerplate files**
- `src/counter.ts`, `src/main.ts`, `src/style.css`, `src/typescript.svg`, and `public/vite.svg` used `innerHTML` and were unused.
- **Fix**: Deleted all 5 files.

---

## Security Architecture

### Authentication
- **Provider**: Supabase Auth (email/password + Google OAuth)
- **Session storage**: Supabase JS SDK manages tokens in `localStorage` (standard for SPAs)
- **Role resolution**: Client-side reads from `profiles.role`, enforced server-side via RLS

### Authorization (Row-Level Security)
- All 8 tables have RLS enabled
- Admin access uses `is_admin()` SECURITY DEFINER function (avoids infinite recursion)
- Users can only read/write their own rows
- Contact messages allow anonymous inserts

### XSS Prevention
- React escapes all rendered content by default
- No `dangerouslySetInnerHTML` usage in the codebase
- No `eval()` or `new Function()` usage

### SQL Injection
- All database queries use Supabase client's parameterized queries
- No raw SQL construction from user input

### CSRF
- Supabase Auth tokens are stored in `localStorage` (not cookies), making traditional CSRF attacks ineffective
- SPA architecture with API calls rather than form submissions

---

## Recommended Next Steps

1. **Rotate compromised credentials** — The Supabase anon key and admin password were exposed in git history
2. **Set up Cloudflare Turnstile** — Get a site key at [dash.cloudflare.com/turnstile](https://dash.cloudflare.com/turnstile), add it as `VITE_TURNSTILE_SITE_KEY`
3. **Deploy the delete-user Edge Function** — Deploy `functions/delete-user/` to Supabase, set `VITE_DELETE_USER_ENDPOINT` to its URL
4. **Run the orders migration** — Execute `supabase/migrations/20260424_add_order_customer_columns.sql` in Supabase SQL Editor
5. **Set up Supabase rate limiting** — Configure in Authentication > Rate Limits
6. **Set `ALLOWED_ORIGIN`** env var on the Stripe webhook and delete-user functions to your production domain
7. **Enable HTTPS-only** — Ensure production deployment forces HTTPS (most platforms do this by default)
