# Testing Instant Grow (swyftform-clone)

## Overview
Instant Grow is an LLC formation service built with Vite + React + TypeScript + Tailwind CSS. Backend uses Supabase (auth + DB), Cloudflare R2 (storage), Stripe (payments), and Resend (email).

## Dev Server Setup
```bash
cd /home/ubuntu/repos/swyftform-clone
npm install
npm run dev
# Runs on http://localhost:3000
```

## Devin Secrets Needed
- `VITE_SUPABASE_URL` — Supabase project URL (required for any auth/DB testing)
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (required for any auth/DB testing)
- `VITE_R2_UPLOAD_ENDPOINT` — Cloudflare R2 upload proxy URL (for file upload testing)
- `VITE_CHECKOUT_ENDPOINT` — Stripe checkout session endpoint (for payment testing)
- `VITE_EMAIL_ENDPOINT` — Resend email endpoint (for email notification testing)

## Frontend-Only Testing (No Credentials Needed)
If Supabase credentials are unavailable, you can still test UI rendering by creating a `.env` file with dummy values:
```
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
```
This allows the Supabase client to initialize without crashing, enabling UI rendering tests.

**Important**: Without this `.env`, the app will crash silently because `createClient(undefined, undefined)` throws.

## Key Routes
| Route | Description |
|---|---|
| `/` | Landing page (Hero, HowItWorks, Features, Pricing, Reviews, FAQ, CTA, Footer) |
| `/auth/login` | Login page (Google OAuth + email/password) |
| `/auth/signup` | Signup page (Google OAuth + name/email/password) |
| `/auth/callback` | OAuth callback — resolves user role, redirects admin→`/admin`, client→`/client/dashboard` |
| `/contact` | Contact form (name, email, phone, subject, message) |
| `/order` | Order wizard (6 steps: Company Info, Member Info, Service Package, Add-ons, Account, Review & Pay) |
| `/client/dashboard` | Client dashboard (requires auth) |
| `/admin` | Admin dashboard (requires auth + admin role) |

## Testing Strategies

### UI Rendering Tests (Frontend-Only)
1. Verify all pages render without console errors
2. Check Blink branding is removed (footer should show "© 2026 Instant Grow" only)
3. Verify Google OAuth button is present on login/signup pages
4. Test form validation (empty submit should show inline errors)
5. Test language toggle (EN ↔ AR) on landing page and order wizard
6. Verify auth callback route exists (should redirect to login when no session)

### Full-Stack Tests (Requires Real Supabase Credentials)
1. Signup flow → verify profile auto-created via trigger
2. Login flow → verify session established
3. Google OAuth → verify redirect through `/auth/callback` with correct role routing
4. Contact form submission → verify `contact_messages` table insert
5. Order wizard completion → verify order creation
6. Admin dashboard → verify data display with RLS policies

### Code Structure Audit
- `grep -ri "blink" src/ --include="*.ts" --include="*.tsx"` should return 0 results
- `grep "from.*supabase" src/ -r --include="*.ts" --include="*.tsx"` should show 27+ files importing Supabase
- Only acceptable "blink" reference: `BlinkMacSystemFont` in CSS font-family stacks

## Key Files
- `src/lib/supabase.ts` — Supabase client initialization
- `src/hooks/useAuth.ts` — Auth hook (login, signup, logout, session management)
- `src/pages/auth/AuthCallbackPage.tsx` — OAuth callback with role-based routing
- `src/router.tsx` — All route definitions
- `supabase/schema.sql` — Full database schema with RLS policies
- `src/i18n/translations.ts` — EN/AR translations

## Known Limitations
- `emailVerified` is hardcoded to `0` (requires server-side RPC to read `auth.users`)
- `lastSignIn` shows "—" (same reason)
- Error handling with dummy Supabase shows "Failed to fetch" — this is expected and confirms the error path works

## Admin Email
- `info@instantgrow.net` is the admin contact email used throughout the app
