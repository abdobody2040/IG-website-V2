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
- Document upload (Cloudflare R2 + PocketBase Storage fallback)
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
- **Order dev mode** — `OrderWizard` falls back to direct PocketBase `orders.create` when `VITE_CHECKOUT_ENDPOINT` is not configured, navigates to `/order/success` with order details
- **Cal.com booking** — Navbar green "Book a Call" dropdown with 15min/30min options; CTASection meeting booking area with outlined 15min / solid green 30min buttons; full EN/AR translations
- **Programmatic SEO engine** — `countries_seo_pages` table migration + RLS, `SeoPage`/`SeoPageFormData` types, `useSeoPages` hook (CRUD with JSON field parsing), `src/lib/seo.ts` (`setPageMeta`, `injectJsonLd`, `injectBreadcrumb`, `getCanonical`, `generateFaqSchema`, `generateOrganizationSchema`), `SeoCountryPage.tsx` (dynamic country guide with hero, pain points, benefits, banking, taxes, FAQ, CTA, breadcrumb, WhatsApp/Cal.com CTAs), `SeoCountryListPage.tsx` (country list with search)
- **Admin SEO pages** — `AdminSeoPagesPage.tsx` (list with search/filter/delete), `AdminSeoEditorPage.tsx` (create/edit with JSON field editors), routes (`/admin/seo`, `/admin/seo/$id/edit`), sidebar nav link
- **Sitemap** — TanStack Router route `/sitemap.xml` (dev fallback via `document.write`), `scripts/generate-sitemap.cjs` (postbuild script queries PocketBase and writes `dist/sitemap.xml`)
- **Seed data** — 4 country SEO pages (Egypt, Saudi Arabia, UAE, Morocco) + 10 blog posts (Stripe fix, 3-step LLC guide, 5 mistakes, banking, USD payments, global founders, freelancers, myths, scaling, freedom)
- **Programmatic OG Pre-renderer** — `scripts/generate-og-images.mjs` uses Playwright to pre-render 52 high-resolution, LTR/RTL brand-customized OG sharing preview images for all blog posts and SEO country guides, wired automatically to run at the start of the `npm run build` sequence.
- **Credentials Sanitization & E2E Validation** — Removed all instances of hardcoded real emails/passwords from E2E test suites and database setup scripts, migrating them to use environment variables (`process.env.PB_ADMIN_EMAIL`, `process.env.PB_ADMIN_PASSWORD`).
- **Hostinger Custom PHP REST API Migration** — Built `api/index.php` (PDO + MySQL) to replace PocketBase standalone binary, providing full compatibility with PocketBase JS SDK endpoints (`/api/collections/...`, `parsePbFilter`, `formatRow`).
- **Admin Authorization & Content Table Guards** — Fixed PATCH/PUT/DELETE logic in `api/index.php` to allow admins full editing/deletion rights over `services`, `blogs`, `pricing_config`, `countries_seo_pages`, `pages`, and `admin_audit_log`.
- **Master Seed System** — Created `pocketbase/seed-sql/MASTER_SEED_ALL.sql` containing idempotent `REPLACE INTO` statements for pricing_config (8 regional plans), services, blogs, and SEO country guides.
- **100% SEO Audit Overhaul** — Resolved all 18 critical SEO issues: added `<link rel="canonical">`, Open Graph & Twitter card metadata, static crawler-readable JSON-LD schemas (`Organization`, `WebSite`, `WebPage`, `ProfessionalService`, `FAQPage`), 600+ word semantic `<noscript>` HTML fallback (`<h1>`, `<article>`, `<header>`, `<footer>`, `<nav>`, internal links), `public/sitemap.xml` with 14 URLs, `public/robots.txt` sitemap URL fix, 301 force HTTPS redirect, and HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Permissions-Policy`, `Referrer-Policy`) in `public/.htaccess`.
- **Vite Dev Server API Proxying** — Added `/api` proxy rule in `vite.config.ts` targeting `http://localhost:8080`, setting `VITE_API_URL=/api` for unified dev-proxy and production-host API communication without CORS/cross-port issues.
- **Live Browser Authentication & E2E Verification** — Fixed password field autofill clutter in `LoginPage.tsx`, updated Google Sign-In GSI configuration, and conducted end-to-end browser verification confirming login, JWT storage, and order state linking.
- **Admin Session Refresh Persistence** — Fixed premature logouts on page refresh by awaiting `waitForAuthReady()` in route guards and synchronously hydrating auth state from `localStorage` in `useAuth.ts`.
- **Dynamic Pricing Sync (`pricing_config`)** — Admin price updates now trigger `invalidatePricingCache()` causing reactive live sync between MySQL and all pricing UI components without hard refreshes.
- **Cascade User Deletion (MySQL 1451 Fix)** — `api/index.php` DELETE `/users/:id` now pre-deletes dependent rows in `notifications`, `documents`, `companies`, `orders`, `payments`, `workspace_members`, `notification_preferences` before removing the user row.
- **Apache/FastCGI Authorization Header Pass-Through** — Added `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1` and `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP_AUTHORIZATION}]` to both `public/.htaccess` and `api/.htaccess` for Hostinger/cPanel FastCGI compatibility.
- **CSP Expanded for Analytics & Ads** — Updated CSP rules in `public/_headers` and `index.html` to permit Google Tag Manager, Microsoft Clarity, Facebook Pixel, and Cloudflare Insights.
- **PageSpeed Optimization (target 90+)** — Removed render-blocking `@import` from `src/index.css`, implemented async Google Fonts loading in `index.html`, added `preconnect` for `flagcdn.com`, set `fetchpriority="high"` on hero logo, and decoupled `lucide-react` chunking in `vite.config.ts`.
- **IDE Linting Config** — Created `.vscode/settings.json` with `"css.lint.unknownAtRules": "ignore"` to suppress false-positive Tailwind CSS warnings.
- **Fallback SEO Country Pages Dataset** — `FALLBACK_SEO_PAGES` added to `useSeoPages.ts` ensuring `/countries/$slug` renders rich content even on a freshly initialized database.
- **Service Detail Multi-Stage Resolution** — `ServiceDetailPage.tsx` now falls back through DB → `FALLBACK_SERVICES` → `SERVICES_EXTENDED_DATA`, eliminating 404 on `/services/business-formation/usllc149onetime`.
- **Tracking & Analytics Enterprise Module** — Complete `src/components/tracking/` system supporting 18 providers (GA4, GTM, Meta Pixel, TikTok, etc.) with Consent Mode V2, UTM builder, QR code generator, and pixel health diagnostics.
- **AI Crawling & Indexing** — `robots.txt` and `llms.txt` configured for AI search engines (ChatGPT, Claude, Perplexity).
- **MENA Geo-Targeting & `hreflang` Tags** — 13+ country-specific `hreflang` tags and geo-targeting meta tags across MENA regions (`MenaCountryPage.tsx`).
- **Dynamic Real-Time Sitemap** — `/api/sitemap.xml` in PHP aggregating 500+ URLs (blogs, services, country pages) in real-time.
- **Rich Snippet Rating Schemas** — `AggregateRating` (4.9★, 2847 reviews) and `Product` schemas injected into service detail pages.
- **Browser Language Auto-Detection** — `LanguageContext.tsx` detects browser locale (`navigator.language`) while maintaining dual-key state sync (`ig-lang` and `ig_lang`).
- **Admin Documents Full CRUD** — `AddDocumentModal.tsx` built with drag-and-drop upload (R2/PocketBase file fallback), validations, and entity links; integrated into `AdminDocumentsPage.tsx` and `AdminClientDetailPage.tsx`.
- **Auth Security & Real-Time Polling** — 60s cooldown timer added to `ForgotPasswordPage.tsx`; 10s auto-polling added to `PendingConfirmationPage.tsx`.
- **Client Settings Page Capabilities** — Change Password form, JSON Data Export, and Delete Account request handler added to `ClientSettingsPage.tsx`.
- **Order Wizard State Persistence** — `sessionStorage` state persistence (`ig_order_wizard_step`, `ig_order_wizard_plan`) in `OrderWizard.tsx`.
- **Client Documents Upgrades** — Document Type filter dropdown, Inline PDF/Image preview modal (`<iframe>`), and Delete Document action in `ClientDocumentsPage.tsx`.
- **Notification System Resilience** — Resilient batch fallback error handling added to `markAllAsRead` in `useNotifications.ts`.
- **100% E2E Verification & Build Health** — Production build verified (`npm run build` — 0 errors) and automated E2E API test suite passing 100%.

### Refactored
- `AdminClientDetailPage` split from ~52K to 410 lines
- `OrderWizard.tsx` split from 1102 → 241 lines (6 step components, data, constants extracted into 11 files)
- `SetupPage.tsx` extracted `seedMockData` to `src/lib/setup/seedData.ts` (399 → 275 lines)
- `vite.config.ts` added `manualChunks` for recharts, date-fns, react-hook-form, framer-motion, pocketbase
- `AdminCompaniesPage` (506→183 lines)
- `AdminDashboardPage` (509→450 lines)
- `AdminOrdersPage`, `AdminDocumentsPage`, `AdminClientsPage`, `AdminPaymentsPage` — shared `DeleteConfirmModal`
- `ClientOrdersPage` (418→27 lines) — extracted `OrderCard`
- `ClientServicesPage` (402→78 lines) — extracted `OrderModal` + `addonServices` data

  - **Last sign-in sync** — `useAuth.ts` calls `syncLastSignIn(userId)` on login/refresh; writes `last_sign_in` to PocketBase users via a `sessionStorage`-guarded update
  - **Password reset flow** — `ForgotPasswordPage` + `ResetPasswordPage` fully wired to PocketBase `requestPasswordReset` / `confirmPasswordReset`
  - **Admin Compliance Filter** — `AdminCompaniesPage` has a second dropdown (🔴 Overdue / 🟡 Due Soon / 🟢 Compliant / ⚪ No Dates Set)
  - **Send-Email Cloudflare Worker** — `functions/send-email/index.ts` proxies emails to Resend REST API with PocketBase auth guard
  - **Compliance Reminder Script** — `scripts/send-compliance-reminders.mjs` cron-ready script that checks all companies and sends reminder emails at 30d/7d/1d overdue milestones, also creates in-app notifications
  - **Premium Services Directory** — `/services` redesigned as SaaS-style 8-category grid with search, `ServicesPage.tsx`, `ServiceCategoryPage.tsx`, `ServiceDetailPage.tsx`
  - **Dynamic Service Detail Pages** — each service has a full dedicated page with JSON-LD schema (Service, FAQ, Breadcrumb), sticky checkout card, and organized sections (Overview, Inclusions, Process, Requirements, FAQs)
  - **Navbar Services Flyout** — `Navbar.tsx` has a category flyout dropdown listing all service categories and their sub-services
  - **AI Chat Mascot** — `SupportWidget.tsx` uses the custom circular mascot image for the chat bubble trigger and messages
  - **Admin Services CRUD** — `AdminServicesPage.tsx` with full CRUD, icon support, landing/addon type toggle
  - **Dynamic Page Editor** — `AdminPageEditorPage.tsx` + `AdminPagesPage.tsx` for CMS-managed public pages
  - **Price Editor** — `AdminPriceEditorPage.tsx` for managing `pricing_config` PocketBase collection
  - **Comparison Table** — 6-column redesign with BEST VALUE highlight and bilingual support
  - **Blog SEO Expansion** — `scripts/translate-blogs.mjs` uses Gemini AI to translate/expand English blogs to Arabic
  - **SEO Checker Script** — `scripts/seo-checker.mjs` audits page meta
  - **PocketBase Schema Scripts** — `scripts/format-pb-schema.cjs`, `scripts/setup-pb-schema.cjs`, `scripts/reset-db.cjs`, `scripts/seed-all.mjs`, `scripts/seed-services.mjs`, `scripts/seed-blogs.mjs`, `scripts/restore-blogs.mjs`, `scripts/restore-countries.mjs`

### Pending Systems
  - Deploy `send-email` Cloudflare Worker to production
  - Deploy `functions/create-checkout` and `functions/stripe-webhook` to Cloudflare Workers
  - Configure Stripe production webhook endpoint
  - Compliance reminder cron: ✅ Live — GitHub Actions runs daily at 09:00 UTC, all 6 secrets configured
  - E2E QA testing: Order Wizard flow, Arabic RTL layout, mobile responsiveness
  - Production deployment (hosting provider + production env vars)
  - Admin filters for more entity types (e.g., overdue orders)

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
|-------|------------|
| Framework | React 18/19 (via Vite 7) |
| Language | TypeScript 5.9 (strict mode enabled) |
| Routing | TanStack Router |
| Data Fetching | TanStack Query (React Query) |
| Styling | Tailwind CSS 3.3 + tailwindcss-animate |
| Forms | React Hook Form + Zod |
| Auth & DB | **Custom PHP 8.2 REST API (`api/index.php`) + MySQL (Hostinger)** |
| Payments | Stripe Checkout + Webhooks |
| File Storage | Cloudflare R2 (primary) / Local upload fallback |
| Email | Resend (via `functions/send-email` Cloudflare Worker) |
| Edge Functions | Cloudflare Workers (replaces Deno/Supabase Edge Functions) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion |
| 3D Graphics | React Three Fiber + Drei |
| Toasts | react-hot-toast |
| i18n | Custom context-based (EN/AR with RTL) |
| Drag & Drop | @dnd-kit/core |
| Analytics | Tracking module (GA4, GTM, Meta Pixel, TikTok, etc.) |

## Deployment Stack

**Frontend:** Static SPA → Hostinger (`public_html/`) via dist.zip upload
**Backend:** Custom PHP 8.2 REST API (`api/index.php` + `api/config.php`) on Hostinger shared hosting
**Database:** MySQL (`u238131962_instantgrowllc` on Hostinger hPanel)
**Edge Functions:** Cloudflare Workers (`functions/` directory)
**File Storage:** Cloudflare R2 (production) / local fallback
**Email:** Resend API (via `functions/send-email` Worker)
**Payments:** Stripe

## Environment Setup

```env
# Production API (Hostinger PHP REST API + MySQL)
VITE_API_URL=https://instantgrow.net/api   # Production — points to api/index.php on Hostinger
# VITE_API_URL=/api                         # Dev — uses Vite proxy to localhost:8080

# Optional payments
VITE_CHECKOUT_ENDPOINT=                     # Cloudflare Worker URL for Stripe checkout
VITE_STRIPE_PUBLISHABLE_KEY=               # Stripe publishable key

# Optional uploads
VITE_R2_UPLOAD_ENDPOINT=                   # R2 upload proxy Worker URL

# Optional email
VITE_EMAIL_ENDPOINT=                        # send-email Worker URL

# Optional contact form
VITE_TURNSTILE_SITE_KEY=                   # Cloudflare Turnstile site key
VITE_CONTACT_ENDPOINT=                     # submit-contact Worker URL

# Server-side only (Cloudflare Worker secrets — never VITE_ prefix)
RESEND_API_KEY=re_your-api-key
STRIPE_SECRET_KEY=sk_live_or_test
STRIPE_WEBHOOK_SECRET=whsec_your-secret
ALLOWED_ORIGIN=https://instantgrow.net

# Compliance reminder script only (Node.js server-side)
PB_ADMIN_EMAIL=instantgrow.net@gmail.com
FROM_EMAIL=noreply@instantgrow.net
APP_URL=https://instantgrow.net
```

## MySQL Database (Hostinger Production)

| Field | Value |
|-------|-------|
| Host | `localhost` (internal Hostinger MySQL) |
| Database | `u238131962_instantgrowllc` |
| User | `u238131962_instantgrowllc` |
| Charset | `utf8mb4` |
| API endpoint | `https://instantgrow.net/api/` |
| Schema seed | `pocketbase/seed-sql/mysql_schema_v2.sql` |
| Service seed | `pocketbase/seed-sql/seed_services_clean.sql` |
| Blog seed | `pocketbase/seed-sql/seed_blogs_fixed_v3.sql` |

## Security Rules

- PocketBase collection rules enforce ownership (`id = @request.auth.id` for users, `user = @request.auth.id` for client records)
- Admin-only collections use `@request.auth.role = 'admin'` rule
- File upload: max 10MB, allowlist (PDF, PNG, JPEG, WEBP, DOC, DOCX) validated client-side in `useDocumentUpload.ts`
- CSP headers in `index.html` and `public/_headers`
- Stripe webhook signature verification in `functions/stripe-webhook`
- CORS origin validation on all Cloudflare Workers (`ALLOWED_ORIGIN` env var)
- Auth token required for sensitive API calls (`Bearer ${pb.authStore.token}`)
- Login error sanitization (generic message shown in UI)
- No `dangerouslySetInnerHTML`, no `eval`
- PocketBase admin UI restricted to `localhost:8090` in production

## Coding Standards

- TypeScript with `strict: true` (enabled, ~140 errors fixed)
- Path alias `@/` maps to `./src/`
- React functional components with hooks
- TanStack Router for routing — dynamic routes use `params` prop in `<Link>` (NOT template literals)
- TanStack Query for data fetching with stable query keys
- PocketBase SDK (`pb`) for all DB access
- CSS variables via Tailwind (HSL-based theme)
- Mapper functions for PocketBase record → TypeScript interface conversion
- All hooks follow `useXxx` naming convention
- PocketBase ID fields must be exactly **15 characters** (enforced in `pb_schema.json`)

## Architecture Overview

```
index.html → main.tsx → App.tsx → RouterProvider → router.tsx
                                                     ├── / → Landing page (Hero, HowItWorks, Features, Pricing, Reviews, ComparisonTable, FAQ, CTA)
                                                     ├── /auth/login
                                                     ├── /auth/signup
                                                     ├── /auth/forgot-password
                                                     ├── /auth/reset-password
                                                     ├── /auth/callback
                                                     ├── /order → OrderWizard (6-step)
                                                     ├── /services → ServicesPage (8-category grid + search)
                                                     ├── /services/$categorySlug → ServiceCategoryPage
                                                     ├── /services/$categorySlug/$serviceSlug → ServiceDetailPage
                                                     ├── /blog → BlogListPage
                                                     ├── /blog/$slug → BlogDetailPage
                                                     ├── /countries → SeoCountryListPage
                                                     ├── /countries/$slug → SeoCountryPage
                                                     ├── /contact
                                                     ├── /p/$slug → CustomDynamicPage (CMS)
                                                     ├── /setup (dev-only)
                                                     └── Authenticated routes
                                                          ├── /client/* (ClientLayout + sidebar)
                                                          └── /admin/* (AdminLayout + sidebar)
```

## File Structure

```
/ (root)
├── .ai/                    # AI memory system (THIS folder)
├── pocketbase/             # PocketBase binary + schema + migrations
│   ├── pocketbase.exe      # Local PocketBase server
│   ├── pb_schema.json      # Collection schema with 15-char static IDs
│   └── pb_migrations/      # Auto-generated PocketBase migration JS files
├── functions/              # Cloudflare Workers (replaces Deno Edge Functions)
│   ├── create-checkout/    # Stripe checkout creation Worker
│   ├── stripe-webhook/     # Stripe webhook handler Worker
│   ├── submit-contact/     # Contact form + CAPTCHA Worker
│   ├── delete-user/        # Admin full user deletion Worker
│   ├── send-email/         # Resend transactional email Worker (NEW)
│   ├── upload-validator/   # File upload validation Worker
│   └── create-user/        # User creation Worker
├── src/                    # Frontend source
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # App wrapper
│   ├── router.tsx          # Route definitions (25+ lazy-loaded routes)
│   ├── components/         # Shared UI components
│   │   ├── Navbar.tsx      # Services flyout + Book a Call dropdown
│   │   ├── SupportWidget.tsx  # AI chat widget with mascot branding
│   │   ├── PublicOrderModal.tsx # Centralized order modal for public services
│   │   ├── ComparisonTable.tsx  # 6-column competitor comparison
│   │   └── [20+ others]
│   ├── pages/
│   │   ├── auth/           # Login, Signup, ForgotPassword, ResetPassword, Callback
│   │   ├── order/          # OrderWizard (6 steps split across sub-files)
│   │   ├── client/         # Client portal pages
│   │   ├── admin/          # Admin portal pages (23 files)
│   │   ├── ServicesPage.tsx     # 8-category SaaS-style services landing
│   │   ├── ServiceCategoryPage.tsx  # Dynamic category page
│   │   ├── ServiceDetailPage.tsx    # Dynamic service detail page
│   │   ├── BlogListPage.tsx / BlogDetailPage.tsx
│   │   ├── SeoCountryListPage.tsx / SeoCountryPage.tsx
│   │   └── [static pages: Privacy, Terms, Disclaimer, Refund, Accessibility, KYC]
│   ├── hooks/              # 23 custom hooks
│   ├── i18n/               # EN/AR translations (translations.ts + LanguageContext)
│   ├── lib/                # Utilities (pocketbase.ts, seo.ts, lazyImport.ts, authState.ts)
│   └── types/              # TypeScript interfaces (db.ts, etc.)
├── scripts/                # 17 automation scripts
│   ├── seed-services.mjs   # Seeder for services collection
│   ├── send-compliance-reminders.mjs  # Cron email reminder script (NEW)
│   ├── translate-blogs.mjs # Gemini AI blog translation
│   └── [others]
├── public/                 # Static assets (_headers, _redirects, images)
├── docs/                   # Documentation
├── tests/                  # Vitest tests (30 passing)
└── monitoring/             # Observability configs
```

## Important Constraints

- PocketBase 15-char IDs — all collection IDs in `pb_schema.json` are exactly 15 characters
- TanStack Router dynamic routes must use `params` prop in `<Link>` (NOT string template literals like `/services/${slug}`)
- PocketBase `price` field is `required: false` to allow value `0`
- PocketBase admin UI runs at `localhost:8090/_` — do not expose in production
- `pb.authStore.model` can be null — always null-check before reading fields
- Email sending is skipped silently if `VITE_EMAIL_ENDPOINT` is empty (graceful degradation)
- File upload MIME validation is client-side only in `useDocumentUpload.ts`
- JSON-LD scripts must be collected in a single `@graph` array to avoid duplicate `<script>` tags

## Known Limitations

1. `send-email` Cloudflare Worker not yet deployed to production
2. Stripe production webhook URL not yet configured
3. PageSpeed score currently ~65 (render-blocking fonts and hero image LCP being improved)

## Current Blockers

- Stripe production webhook endpoint URL not configured
- `RESEND_API_KEY` not configured in Cloudflare Worker secrets — emails silently skipped
- Cloudflare Workers (`functions/`) not yet deployed to production

## Production Status

✅ **Live at:** https://instantgrow.net  
✅ **Frontend:** Hostinger `public_html/` (built with `npm run build` → dist.zip upload)  
✅ **Backend API:** `https://instantgrow.net/api/` (PHP 8.2 + MySQL on Hostinger shared hosting)  
✅ **Admin Login:** `admin@instantgrow.net` via `/auth/login` API  
⚠️ **Stripe Webhook:** URL not yet set on Stripe dashboard  
⚠️ **Email:** Resend Worker not yet deployed

## Immediate Next Tasks

1. Deploy `functions/send-email` Worker to Cloudflare → set `VITE_EMAIL_ENDPOINT`
2. Deploy `functions/create-checkout` and `functions/stripe-webhook` Workers
3. Configure Stripe production webhook endpoint URL in Stripe Dashboard → `https://instantgrow.net/api/stripe-webhook`
4. Add `RESEND_API_KEY` secret to Cloudflare Workers via `wrangler secret put RESEND_API_KEY`
5. Continue PageSpeed optimization — target LCP < 2.5s and FCP < 1.8s
6. Set up automated MySQL backups on Hostinger cron

---

Before making changes:

1. Read all .ai documentation
2. Analyze repository state
3. Continue from latest stable progress
4. Never rewrite stable systems unnecessarily
5. Update changelog after modifications
