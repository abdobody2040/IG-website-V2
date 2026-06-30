# ALL AI AGENTS MUST READ THIS FILE BEFORE STARTING WORK.

# Instant Grow — AI Context

## Project Overview

Instant Grow is a SaaS platform for automated LLC & LTD company formation. It serves international entrepreneurs who want to register US or UK companies online. The platform handles the full lifecycle: order placement, document filing, EIN/UTR processing, and ongoing compliance tracking.

## Business Goals

- Allow international entrepreneurs to form US LLCs and UK LTDs entirely online
- Provide bilingual (EN/AR) experience with full RTL support
- Enable admin team to manage clients, orders, companies, documents, and payments
- Track compliance/renewal dates post-formation
- Generate revenue via formation packages (Basic/Premium) and add-on services

## Current Progress

### Completed Systems
- Landing page with all marketing sections
- Authentication (email/password + Google OAuth)
- Auth guards (useRequireAuth, useRequireAdmin)
- Multi-step order formation wizard (US LLC / UK LTD)
- Client portal (dashboard, orders, company, documents, services, payments, mail, verification, settings)
- Admin portal (dashboard, orders, clients, client detail, companies, documents, payments, analytics, settings)
- Bilingual EN/AR UI with RTL layout
- Stripe Checkout integration (formation + add-on services)
- Stripe webhook handler (idempotent, creates orders/payments/companies)
- Document upload (Cloudflare R2 + Supabase Storage fallback)
- Email notifications (Resend via Edge Function)
- Contact form with optional Cloudflare Turnstile CAPTCHA
- Admin full user deletion (profile + auth.users)
- Compliance/renewal tracking fields on companies
- Security audit: 14 findings all fixed (3 Critical, 5 High, 4 Medium, 2 Low)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Password strength validation
- RLS policies on all 8 tables
- Order number/invoice UUID randomization
- **TypeScript strict mode** enabled (~140 errors fixed across 50+ files)
- **Route-level code splitting** via `lazyImport` utility — 25+ routes lazy loaded
- **Vitest test suite** — 30 passing tests across 5 files
- **Notifications system** — NotificationCenter, ClientNotificationsPage, useNotifications, real-time subscriptions
- **Invite flow** — invitations table, InviteClientModal, useInvitations, invite token in signup
- **Reporting/CSV exports** — useExportCsv hook, CSV buttons on admin pages
- **Real-time order subscriptions** — useOrderRealtime in ClientLayout
- **Admin audit log** — audit_logs table + useAdminAuditLog hook
- **Compliance reminders** — useComplianceReminders on ClientDashboardPage
- **14 new DB indexes** for query performance
- **Duplicate `type` column removed** from documents table
- **emailVerified/lastSignIn sync trigger** migration
- **Blog section** — `blogs` table migration + RLS, `Blog`/`BlogFormData` types, `useBlogs` hook (full CRUD), admin blog management (list + editor with slug gen, tags, markdown, publish/feature), public blog (list with featured/tag filter/search, detail with cover/meta/share), routes (`/blog`, `/blog/$slug`, `/admin/blogs`, `/admin/blogs/$id/edit`), navbar + sidebar nav links
- **Order dev mode** — `OrderWizard` falls back to direct Supabase `orders.insert` when `VITE_CHECKOUT_ENDPOINT` is not configured, navigates to `/order/success` with order details
- **Cal.com booking** — Navbar green "Book a Call" dropdown with 15min/30min options; CTASection meeting booking area with outlined 15min / solid green 30min buttons; full EN/AR translations
- **Programmatic SEO engine** — `countries_seo_pages` table migration + RLS, `SeoPage`/`SeoPageFormData` types, `useSeoPages` hook (CRUD with JSON field parsing), `src/lib/seo.ts` (`setPageMeta`, `injectJsonLd`, `injectBreadcrumb`, `getCanonical`, `generateFaqSchema`, `generateOrganizationSchema`), `SeoCountryPage.tsx` (dynamic country guide with hero, pain points, benefits, banking, taxes, FAQ, CTA, breadcrumb, WhatsApp/Cal.com CTAs), `SeoCountryListPage.tsx` (country list with search)
- **Admin SEO pages** — `AdminSeoPagesPage.tsx` (list with search/filter/delete), `AdminSeoEditorPage.tsx` (create/edit with JSON field editors), routes (`/admin/seo`, `/admin/seo/$id/edit`), sidebar nav link
- **Sitemap** — TanStack Router route `/sitemap.xml` (dev fallback via `document.write`), `scripts/generate-sitemap.cjs` (postbuild script queries Supabase and writes `dist/sitemap.xml`), build command updated to `vite build && node scripts/generate-sitemap.cjs`
- **Seed data** — 4 country SEO pages (Egypt, Saudi Arabia, UAE, Morocco) + 10 blog posts (Stripe fix, 3-step LLC guide, 5 mistakes, banking, USD payments, global founders, freelancers, myths, scaling, freedom)

### Refactored
- `AdminClientDetailPage` split from ~52K to 410 lines
- `OrderWizard.tsx` split from 1102 → 241 lines (6 step components, data, constants extracted into 11 files)
- `SetupPage.tsx` extracted `seedMockData` to `src/lib/setup/seedData.ts` (399 → 275 lines)
- `vite.config.ts` added `manualChunks` for recharts, date-fns, react-hook-form, framer-motion, supabase
- `AdminCompaniesPage` (506→183 lines)
- `AdminDashboardPage` (509→450 lines)
- `AdminOrdersPage`, `AdminDocumentsPage`, `AdminClientsPage`, `AdminPaymentsPage` — shared `DeleteConfirmModal`
- `ClientOrdersPage` (418→27 lines) — extracted `OrderCard`
- `ClientServicesPage` (402→78 lines) — extracted `OrderModal` + `addonServices` data

### In-Progress Systems
- Apply seed SQL migrations to Supabase (countries_seo_pages table + seed data, 10 blog posts)

### Pending Systems
- Password reset flow
- Email verification sync from auth.users (migration exists, needs trigger update)
- Last sign-in sync (RPC created, trigger not updated)
- Automated compliance reminders (hook exists, UI partial)
- Admin filters for due-soon/overdue companies
- Production deployment
- Admin SEO page preview (what-you-get mockup for country pages)
- More country seed data (expand beyond 4 countries)
- Social media sharing images for blog posts

## Core Business Logic

**Order Formation Flow:**
1. User selects Jurisdiction (US LLC / UK LTD)
2. US: Select State (NM $0, WY $50, DE $100, + all 50 states)
3. Select Package (Basic $229/$379 or Premium $349/$499)
4. Add Members/Managers
5. Business Details (company name, activity, contact, address)
6. Add-ons (Website $99, Logo $49, Express $50)
7. Review & Pay (redirects to Stripe Checkout)
8. Stripe webhook creates order, payment, company, order_update records
9. Admin processes order through statuses: pending → in_review → processing → documents_filed → ein_processing → completed

**Pricing:**
- US Basic: $229, US Premium: $349
- UK Basic: £379, UK Premium: £499
- State fees: NM $0, WY $50, DE $100 (others vary)

**Role-Based Access:**
- `client`: own orders, companies, documents, payments
- `admin`: full CRUD on all entities, analytics, settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18/19 (via Vite 7) |
| Language | TypeScript 5.9 |
| Routing | TanStack Router |
| Data Fetching | TanStack Query (React Query) |
| Styling | Tailwind CSS 3.3 + tailwindcss-animate |
| Forms | React Hook Form + Zod |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| Payments | Stripe Checkout + Webhooks |
| File Storage | Cloudflare R2 (primary) / Supabase Storage (fallback) |
| Email | Resend |
| Edge Functions | Deno (Supabase Edge Functions) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion |
| 3D Graphics | React Three Fiber + Drei |
| Toasts | react-hot-toast |
| i18n | Custom context-based (EN/AR with RTL) |
| Drag & Drop | @dnd-kit/core |

## Deployment Stack

**Frontend:** Static SPA → Cloudflare Pages / Netlify / Vercel
**Backend:** Supabase (managed PostgreSQL + Auth)
**Edge Functions:** Deno on Supabase
**File Storage:** Cloudflare R2 (production) / Supabase Storage (fallback)
**Email:** Resend API
**Payments:** Stripe

## Environment Setup

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_CHECKOUT_ENDPOINT=     # Stripe checkout function URL
VITE_R2_UPLOAD_ENDPOINT=    # R2 upload proxy URL
VITE_EMAIL_ENDPOINT=        # Email sending function URL
VITE_TURNSTILE_SITE_KEY=    # Cloudflare Turnstile site key
VITE_CONTACT_ENDPOINT=      # Contact form function URL
VITE_DELETE_USER_ENDPOINT=  # Delete user function URL
```

## Security Rules

- RLS enabled on all 8 tables
- `is_admin()` SECURITY DEFINER function for admin checks
- File upload: max 10MB, allowlist (PDF, PNG, JPEG, WEBP, DOC, DOCX)
- CSP headers in index.html and public/_headers
- Stripe webhook signature verification
- CORS origin validation on all Edge Functions
- Auth token required for external API calls
- Login error sanitization (generic message)
- No dangerouslySetInnerHTML, no eval

## Coding Standards

- TypeScript with `strict: true` (enabled, ~140 errors fixed)
- Path alias `@/` maps to `./src/`
- React functional components with hooks
- TanStack Router for routing
- TanStack Query for data fetching
- Supabase client for DB access
- CSS variables via Tailwind (HSL-based theme)
- Mapper functions for DB row → TypeScript interface conversion

## Architecture Overview

```
index.html → main.tsx → App.tsx → RouterProvider → router.tsx
                                                       ├── / → Landing page (Hero, HowItWorks, Features, Pricing, Reviews, FAQ, CTA)
                                                       ├── /auth/login
                                                       ├── /auth/signup
                                                       ├── /auth/callback
                                                       ├── /order → OrderWizard (6-step)
                                                       ├── /contact
                                                       ├── /setup (dev-only)
                                                       └── Authenticated routes
                                                            ├── /client/* (ClientLayout + sidebar)
                                                            └── /admin/* (AdminLayout + sidebar)
```

## File Structure

```
/ (root)
├── .ai/                    # AI memory system
├── src/                    # Frontend source
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # App wrapper
│   ├── router.tsx          # Route definitions
│   ├── Shell.tsx           # Responsive layout
│   ├── components/         # Shared UI components (DeleteConfirmModal, InviteClientModal, KPICard, NotificationCenter, etc.)
│   ├── pages/              # Route pages
│   │   ├── auth/           # Login, Signup, Callback
│   │   ├── order/          # Order wizard (6 steps + data/constants/summary extracted to sub-files), success
│   │   ├── client/         # Client dashboard pages (OrderCard, OrderModal extracted)
│   │   └── admin/          # Admin panel pages
│   ├── hooks/              # Custom React hooks (useNotifications, useInvitations, useExportCsv, useAdminAuditLog, useOrderRealtime, useComplianceReminders, etc.)
│   ├── i18n/               # EN/AR translations
│   ├── lib/                # Utilities (supabase client, lazyImport, adminUtils)
│   │   └── setup/          # seedData.ts (seedMockData extracted from SetupPage)
│   ├── data/               # Static data (addonServices.ts)
│   └── types/              # TypeScript interfaces
├── functions/              # Deno Edge Functions
│   ├── create-checkout/    # Stripe checkout creation
│   ├── stripe-webhook/     # Stripe webhook handler
│   ├── submit-contact/     # Contact form + CAPTCHA
│   └── delete-user/        # Admin full user deletion
├── supabase/               # Database schema + migrations
├── public/                 # Static assets + headers
├── docs/                   # Documentation
├── tests/                  # Tests (30 Vitest tests)
├── scripts/                # Automation scripts
└── monitoring/             # Observability configs
```

## Important Constraints

- Supabase `auth.users` not directly queryable from client (anon key restriction)
- `email_verified` and `last_sign_in` still show placeholder values in admin UI (migration exists, trigger not updated)
- Edge Functions use Deno runtime (npm: specifiers)
- File upload MIME type checking is client-side only (server check would be needed for production)

## Known Limitations

1. emailVerified always shows false — needs server-side sync trigger update
2. lastSignIn shows placeholder — RPC created but trigger not updated to respect bypass flag
3. No password reset flow
4. `SetupPage` still exists with demo credentials (PROD-guarded but not ideal)
5. Edge Function MIME type checking is client-side only
6. Contact messages from logged-in users not linked to profile

## Blockers

- Production Supabase project not yet configured
- Production Stripe keys not configured
- R2 upload proxy not deployed (using Supabase Storage fallback with `documents` bucket created)
- Email sending endpoint not deployed
- Delete-user function not deployed

## Immediate Next Tasks

1. Add password reset flow
2. Fix emailVerified/lastSignIn sync trigger
3. Deploy to production
4. Remove `SetupPage` before production
5. Admin filters for due-soon/overdue companies
6. Fix `last_sign_in` trigger to respect bypass flag
7. Add server-side MIME validation for file uploads
8. Complete compliance reminders (automated emails)

---

Before making changes:

1. Read all .ai documentation
2. Analyze repository state
3. Continue from latest stable progress
4. Never rewrite stable systems unnecessarily
5. Update changelog after modifications
