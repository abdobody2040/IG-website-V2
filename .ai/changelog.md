# Instant Grow — Changelog

## 2026-06-29 — Admin Routing Optimization & Arabic SEO

### Added
- **Arabic SEO Expansion Script** — Created `expand_arabic_blogs.js`, an automated Node.js script that connects to PocketBase and uses the Google Gemini AI API to translate, significantly expand, and SEO-optimize English blogs into raw Arabic HTML content.
- **Dynamic Support Widget** — Updated `SupportWidget.tsx` to automatically pull live pricing data from the `pricing_config` PocketBase collection via the `usePricingConfig` hook, allowing the chatbot to answer pricing questions accurately based on current CMS data.
- **WhatsApp Integration** — Added a direct WhatsApp contact bubble to the support widget linked to `+13072898149`.

### Changed
- **Admin Routing Architecture** — Refactored TanStack router configuration (`router.tsx`) and all 15 Admin pages. Replaced individual `<AdminLayout>` wrappers on every page with a single parent `adminLayoutRoute` using `<Outlet />`. This eliminates full-page reloads and makes navigating the admin sidebar completely instant while preserving UI state.
## 2026-06-29 — PocketBase Migration + Cloudflare Workers

### Added
- **PocketBase Local Integration** — Configured local PocketBase server (v0.22.22) as a free database and auth replacement for Supabase.
- **PocketBase Schema JSON** — Created `pocketbase/pb_schema.json` containing complete schema mapping, static 15-character collection IDs, file field validations, and API access rules.
- **Schema Helper Scripts**:
  - `scripts/format-pb-schema.cjs` — Formats schema JSON, cleans up file fields, and updates relational targets dynamically.
  - `scripts/setup-pb-schema.cjs` — Programmatically imports all collections and access controls to PocketBase via REST API.
  - `scripts/reset-db.cjs` — Utility to wipe local DB data and restart the PocketBase server.
- **Cloudflare Workers Migration** — Completely replaced Deno Supabase Edge Functions with Cloudflare Workers in `functions/`:
  - `stripe-webhook`, `create-checkout`, `create-user`, `delete-user`, `submit-contact`, and `upload-validator` connecting directly to PocketBase with admin token fallback.

### Changed
- **Frontend Data Hooks** — Swapped Supabase SDK for PocketBase SDK and updated all custom React hooks (`useAuth`, `useOrders`, `useCompanies`, etc.).
- **Vite Chunking** — Updated Vite build configuration to chunk PocketBase instead of `@supabase`.
- **Sitemap Generation** — Post-build sitemap generation script modified to gracefully warn and exit with code 0 if PocketBase is offline.

## 2026-05-23 — Programmatic SEO Engine + Blog Section + Cal.com + Order Dev Mode

### Added
- **Blog section** — `blogs` table migration with RLS, `Blog`/`BlogFormData` types, `useBlogs` hook (full CRUD), admin blog management (`AdminBlogsPage` list/filter/search/delete + `AdminBlogEditorPage` create/edit with slug auto-gen, tags, markdown content, publish/feature toggles), public blog (`BlogListPage` featured + tag filter + search + card grid + `BlogDetailPage` cover image + meta + markdown rendering + share), routes (`/blog`, `/blog/$slug`, `/admin/blogs`, `/admin/blogs/$id/edit`), Navbar Blog link (EN/AR), admin sidebar Blog nav item
- **Order dev mode** — `OrderWizard.onSubmit` falls back to direct Supabase `orders.insert` when `VITE_CHECKOUT_ENDPOINT` is not configured, navigates to `/order/success` with `orderNumber`/`plan`/`company` search params
- **Cal.com booking** — Navbar green "Book a Call" dropdown with 15min/30min options; CTASection meeting booking area with outlined 15min / solid green 30min buttons; mobile nav includes both Cal.com links; full EN/AR translations in `translations.ts`
- **Programmatic SEO engine** — `countries_seo_pages` table migration with RLS, `SeoPage`/`SeoPageFormData` types, `useSeoPages` hook (CRUD with JSON field parsing), `src/lib/seo.ts` (`setPageMeta`, `injectJsonLd`, `injectBreadcrumb`, `getCanonical`, `generateFaqSchema`, `generateOrganizationSchema`), `SeoCountryPage.tsx` (dynamic country guide with hero, pain points, benefits, banking, taxes, FAQ, CTA, breadcrumb, WhatsApp + Cal.com CTAs), `SeoCountryListPage.tsx` (country list with search)
- **Admin SEO pages** — `AdminSeoPagesPage.tsx` (list with search/filter/delete), `AdminSeoEditorPage.tsx` (create/edit with JSON field editors), routes (`/admin/seo`, `/admin/seo/$id/edit`), admin sidebar "SEO Pages" nav link with Globe icon
- **Sitemap** — TanStack Router route `/sitemap.xml` (dev fallback via `document.write`), `scripts/generate-sitemap.cjs` (postbuild script queries Supabase and writes `dist/sitemap.xml`), build command updated to `vite build && node scripts/generate-sitemap.cjs`, `public/_redirects` updated with `/sitemap.xml` rule
- **Seed SQL** — `supabase/migrations/20260523_seed_seo_countries.sql` (4 countries: Egypt, Saudi Arabia, UAE, Morocco), `supabase/migrations/20260523_seed_blogs.sql` (10 blog posts covering Stripe, LLC formation, mistakes, banking, USD, global mindset, freelancers, myths, scaling, freedom)

### Fixed
- Import paths in `SeoCountryPage.tsx` and `SeoCountryListPage.tsx` (`../../` → `../`)
- Unused imports removed (`Link` in editor, `FileText` in list, `navigate`/`FileText`/`Calendar` in country pages)
- `painPoints` type in `SeoPage` interface changed from `Record<string, unknown>[]` to `string[]`
- Escaped single quotes in blog seed SQL (`someone else''s`, `Mercury''s`, `friend''s`)
- Supabase Storage `documents` bucket created for document upload fallback

## 2026-05-23 — Blog Section (initial)

### Added
- `blogs` table migration with RLS (public read published, admin full access)
- `Blog` / `BlogFormData` types in `src/types/db.ts`
- `useBlogs` hook with full CRUD (list, get by slug, create, update, delete)
- Admin blog management: `AdminBlogsPage` (list/filter/search/delete) + `AdminBlogEditorPage` (create/edit with slug auto-gen, tags, markdown content, publish/feature toggles)
- Public blog: `BlogListPage` (featured article, tag filter, search, card grid) + `BlogDetailPage` (cover image, meta, markdown rendering, share)
- Routes: `/blog`, `/blog/$slug`, `/admin/blogs`, `/admin/blogs/$id/edit`
- Navbar Blog link (EN/AR), admin sidebar Blog nav item

## 2026-05-22 — AI Memory System

### Added
- Complete AI memory system in `.ai/` directory with all documentation files
- `context.md` — Full project context for AI agents
- `architecture.md` — Architecture documentation with diagrams
- `tasks.md` — Task tracking, roadmap, milestones, backlog
- `decisions.md` — Architectural Decision Records (9 ADRs)
- `bugs.md` — Bug tracker with 9 known issues
- `prompts.md` — Reusable AI prompts for common workflows
- `changelog.md` — This file
- `rules.md` — Engineering standards and rules
- `database.md` — Database schema documentation
- `api-rules.md` — API standards and patterns
- `ui-system.md` — UI/UX design system
- `agent-rules.md` — AI agent behavior rules
- `deployment.md` — Deployment strategy
- `security.md` — Security architecture
- `testing.md` — Testing strategy
- `performance.md` — Performance system
- `observability.md` — Observability strategy
- `README_AI.md` — AI operating instructions
- `PRD.md` — Product Requirements Document
- `/docs/` directory
- `/tests/` directory
- `/scripts/` directory
- `/monitoring/` directory

### Security
- Addressed CSP configuration review — confirmed all directives correct
- Added SUPABASE_SERVICE_ROLE_KEY to .env.example warning (was documented but could be clearer)
- Documented all 14 fixed security findings from previous audit

### Technical Debt Documented
- TypeScript strict mode disabled (`strict: false`)
- AdminClientDetailPage ~52K lines needs splitting
- Duplicate `type` column in documents table
- emailVerified always shows placeholder
- lastSignIn shows placeholder
- No automated test suite
- No route-level code splitting

## 2026-05-22 — Compliance Tracking

### Added
- `20260522_add_company_compliance_dates.sql` migration
- Compliance fields on companies table (renewal_due_date, annual_report_due_date, etc.)
- Client dashboard "Next Renewal" snapshot card
- Client company "Renewals & Compliance" detail card
- Admin company edit controls for compliance dates and status

## 2026-05-22 — TypeScript Strict + Code Splitting + Test Suite

### Added
- TypeScript strict mode enabled (`tsconfig.json` strict: true)
- ~140 type errors fixed across 50+ files
- Route-level code splitting via `lazyImport` utility — 25+ routes lazy loaded
- App-level lazy loading (AdminClientDetailPage, OrderWizard split)
- Vitest test suite with 30 passing tests across 5 files
- 14 new DB indexes for query performance
- `emailVerified` / `lastSignIn` sync trigger migration
- Duplicate `type` column removal migration
- Real-time order subscriptions (`useOrderRealtime`) in ClientLayout
- Admin audit log table + `useAdminAuditLog` hook
- Compliance reminders (`useComplianceReminders`) on ClientDashboardPage
- `useNotifications` — fetch, real-time subscribe, mark read, create notification RPC
- Notifications table with RLS + SECURITY DEFINER RPC
- NotificationCenter component (bell icon + dropdown + unread badge)
- ClientNotificationsPage (full history)
- Notifications wired into ClientLayout + AdminLayout + useOrderRealtime
- Invitations table with RLS + token-based RPCs (create_invitation, accept_invitation)
- `useInvitations` hook (admin create + token lookup)
- `InviteClientModal` — admin invite form
- Invite flow integrated into AdminClientsPage + SignupPage (?invite=TOKEN)
- `useExportCsv` — generic CSV download with column mapping
- Enhanced AdminAnalyticsPage — date range filter, trend chart, client growth, CSV exports
- Export CSV buttons on AdminOrdersPage, AdminClientsPage, AdminPaymentsPage

### Refactored
- `AdminClientDetailPage` split from ~52K to 410 lines
- `OrderWizard.tsx` split from 1102 → 241 lines (extracted 6 step components, data, constants, OrderSummary, StepIndicator into 11 files under `src/pages/order/`)
- `SetupPage.tsx` extracted `seedMockData` to `src/lib/setup/seedData.ts` (399 → 275 lines)
- `vite.config.ts` added `manualChunks` for recharts, date-fns, react-hook-form, framer-motion, supabase
- Created shared `DeleteConfirmModal`, `KPICard`, `adminUtils` for admin pages
- `AdminCompaniesPage` refactored 506→183 lines
- `AdminDashboardPage` refactored 509→450 lines
- `AdminOrdersPage`, `AdminDocumentsPage`, `AdminClientsPage`, `AdminPaymentsPage` — applied shared `DeleteConfirmModal`
- `ClientOrdersPage` refactored 418→27 lines (extracted `OrderCard` component)
- `ClientServicesPage` refactored 402→78 lines (extracted `OrderModal` + `src/data/addonServices.ts`)

## 2026-05-03 — Last Sign-In RPC

### Added
- `20260503_add_update_last_sign_in_rpc.sql` migration
- RPC `update_last_sign_in()` function
- Trigger dispatch in useAuth on SIGNED_IN event
- Note: trigger function on profiles table still needs bypass flag update

## 2026-04-24 — Customer PII Columns & Security Hardening

### Added
- `20260424_add_order_customer_columns.sql` migration
- customer_name, customer_email, customer_phone, etc. columns on orders
- stripe_session_id unique constraint for webhook idempotency
- CSP, X-Frame-Options, Referrer-Policy, and HSTS headers
- Cloudflare Turnstile CAPTCHA widget
- Password strength validation (uppercase, lowercase, number, special char)
- File upload validation (10MB max, MIME allowlist)

### Fixed
- Security audit findings (14 total, all fixed)
  - 3 Critical (env in git, setup page exposed, weak passwords)
  - 5 High (CORS wildcard, no API auth, no upload validation, no headers, error leaks)
  - 4 Medium (no CAPTCHA, PII in notes, incomplete delete, postcss vuln)
  - 2 Low (predictable IDs, boilerplate files)
- Removed @blinkdotnew/sdk from functions

## 2026-04-20 — Initial Platform Build

### Added
- Vite + React + TypeScript project setup
- TanStack Router with all route definitions
- Landing page (Hero, Features, Pricing, HowItWorks, Reviews, FAQ, CTA)
- Auth pages (Login, Signup, AuthCallback)
- Multi-step order wizard (6 steps)
- Client portal (dashboard, orders, company, documents, services, payments, mail, verification, settings)
- Admin portal (overview, dashboard, orders, clients, detail, companies, documents, payments, analytics, settings)
- Supabase schema with 8 tables + RLS policies
- Stripe Checkout integration (formation + addon modes)
- Stripe webhook handler (idempotent)
- Document upload (R2 + Supabase Storage fallback)
- Email notification system (useEmailNotifications.ts)
- Bilingual EN/AR UI with RTL
- Custom i18n context
- Shell responsive layout
- Edge Functions: create-checkout, stripe-webhook, submit-contact, delete-user
- Security headers (public/_headers, CSP in index.html)
