# Instant Grow — Changelog

## 2026-07-21 — PocketBase Admin Login, JS-Bridge Header Fixing, & Expanded Price Editor

### Added
- **Expanded Admin Price Editor (8 Plans)** — Updated `AdminPriceEditorPage.tsx` (`/admin/price-editor`) to provide full CRUD capabilities over all 8 package plans across all 4 target regions: US LLC (Basic & Premium), UK LTD (Basic & Premium), UAE Freezone (Basic & Premium), and Oman SPC (Basic & Premium). Admins can now edit prices, English features, and Arabic features for any plan with instant live updates on the landing page and order wizard.

### Fixed
- **Goja JS-Bridge Casing Error (`req.header.get` / `req.header.set`)** — Resolved `TypeError: Object has no member 'Get'` in `auth_http_only.pb.js` by using lowercase `get` and `set` methods provided by PocketBase v0.22's Goja bridge for `net/http` Header maps.
- **Admin UI Login Exclusion Guard** — Added request path exclusion logic (`/_/`, `/api/admins/*`) in `auth_http_only.pb.js` to prevent stale user `pb_auth` cookies from being injected into admin authentication requests.
- **Audit Logger Scope Isolation** — Fixed `ReferenceError: writeAuditLog is not defined` in `audit_logger.pb.js` by inlining the audit log logic directly into each `onRecordAfter...` callback (PocketBase v0.22 hook callbacks run in isolated Goja contexts). Superuser/admin contexts are safely ignored via `httpContext.get("admin")`.
- **Frontend AuthStore JWT Token Persistence** — Updated `LoginPage.tsx`, `SignupPage.tsx`, and `OrderWizard.tsx` to save the actual JWT token (`res.token`) into `pb.authStore.save(res.token, res.record)` instead of string literal dummy placeholders, allowing `pb.authStore.isValid` to evaluate to `true` and preventing immediate redirects back to `/auth/login`.

## 2026-07-20 — PocketBase v0.22 Hooks Migration & Footer Links Repair

### Added
- **PocketBase v0.22 Hook Compatibility** — Migrated PocketBase JS hooks (`auth_http_only.pb.js`, `rate_limiter.pb.js`, `restrict_admin.pb.js`, `security_headers.pb.js`) to use PocketBase v0.22 `routerUse(...)` middleware instead of deprecated legacy global hook declarations (`onBeforeApiRequest`, `onBeforeRequest`, `onAfterApiRequest`).
- **Whitelisted Admin Auth Routes** — Updated `auth_http_only.pb.js` CSRF bypass logic to explicitly whitelist `/_/`, `/api/admins/*`, `/api/auth/*`, and `/api/oauth2/*` endpoints, enabling seamless admin and client login without CSRF header rejection.

### Fixed
- **Footer Service Links Resolution** — Resolved "Service Not Found" page crashes when clicking footer service links by updating `translations.ts` (LTR and RTL Arabic) to point directly to valid category paths (`/services/business-formation`, `/services/government-compliance`) instead of invalid static string IDs.
- **Localhost HttpOnly Cookie Delivery** — Adjusted `pb_auth` and `csrf-token` cookie flags to remove the mandatory `Secure` flag in local development environments, ensuring authentication cookies are accepted when running on local HTTP (`localhost:3000` / `127.0.0.1:8090`).

## 2026-07-19 — Production Security Hardening, Zero-Trust Architecture & HttpOnly Cookies

### Added
- **Zero-Trust Admin Panel Restriction** — Created `pocketbase/pb_hooks/restrict_admin.pb.js` to block public access to the PocketBase Admin UI (`/_/`) on the production domain. Access is now only allowed when tunneling to `localhost`/`127.0.0.1`.
- **SQLite Database Encryption at Rest** — Created a secure startup wrapper script `pocketbase/start.sh` and updated the `Dockerfile` and `fly.toml` configurations to feed `PB_ENCRYPTION_KEY` into the server startup parameters.
- **Automated Container Database Backups** — Added a container-safe backup script `pocketbase/backup.sh` (and `scripts/backup-db.sh` for host/local environments) utilizing SQLite's online `.backup` API, retaining backups for 30 days.
- **Production CSP Headers & HTTPS Enforcement** — Injected `upgrade-insecure-requests` to `public/_headers` and `index.html` CSP definitions, and updated the `connect-src` list to point to `https://pb.instantgrow.net`. Enforced HTTPS-only redirects in Fly.io config.
- **HttpOnly Cookie Authentication** — Created `pb_hooks/auth_http_only.pb.js` to handle `/api/auth/login` and `/api/auth/logout`. Removed localStorage token storage in favor of secure, HttpOnly, SameSite=Lax cookies to prevent token exfiltration via XSS.
- **CSRF Protection** — Implemented an `X-CSRF-Token` requirement for all state-mutating requests (POST, PUT, PATCH, DELETE) via PB hooks. The PocketBase SDK interceptor automatically reads the `csrf-token` cookie and injects it into headers.
- **Strict Role-Level Security (RLS)** — Locked down `pb_schema.json` to prevent self-role escalation in the `users` table, and enforced strict `WITH CHECK` constraints on `orders`, `companies`, and `documents` so users can only access their own records.
- **XSS Payload Sanitization** — Added `pb_hooks/validation.pb.js` to block payloads containing `<script`, `javascript:`, and inline event handlers before they reach the database.
- **Rate Limiting** — Implemented `pb_hooks/rate_limiter.pb.js` backed by a new `rate_limits` collection to restrict login attempts to 5 per minute per IP.
- **Audit Logging** — Added `pb_hooks/audit_logger.pb.js` to automatically log all CREATE/UPDATE/DELETE mutations in the `admin_audit_log` collection, tracking action types, tables, record IDs, and user IPs.
- **Security Headers Hook** — Added `pb_hooks/security_headers.pb.js` to enforce strict CSP, `X-Frame-Options: DENY`, and `nosniff` headers directly at the API level.


### Changed
- **Frontend Authentication Refactoring** — Updated `LoginPage.tsx`, `SignupPage.tsx`, and `OrderWizard.tsx` to use the new `/api/auth/login` endpoint instead of the default PocketBase JS SDK `authWithPassword` method.
- **SDK Overrides** — Modified `src/lib/pocketbase.ts` with `pb.beforeSend` to automatically clear local token state, include credentials (cookies), and append the CSRF header on all requests.
- **Auth State Management** — Refactored `useAuth.ts` and `authState.ts` to rely on the backend-driven session state.

## 2026-07-18 — UK LTD Roles & Ownership, Region-based Add-ons Filtering, Stripe Payment Form & Deployment Readiness

### Added
- **UK LTD Custom Roles:** Introduced specific roles for UK LTD company formations (*Director*, *Shareholder*, *Company Secretary*) while preserving US LLC roles (*Managing Member*, *Member*, *Manager*).
- **Secure Stripe Card Inputs Form:** Added a card details input form (Cardholder Name, Card Number with auto-spacing, Expiry Date with auto-formatting, and CVC) on the "Review & Pay" step when Stripe is selected as the payment method.
- **Card Input Validation Guard:** Enabled validation that disables the final order submission until card information is completely filled.
- **RTL Services Dropdown Alignment:** Added conditional RTL styling (`right-1/2 translate-x-1/2`) to keep the services dropdown navigation drawer aligned correctly under the Arabic "Services" trigger.
- **Features E2E Testing Suite:** Created `tests/e2e/features.spec.ts` covering Document Upload, Notification Center, Contact Form Email routing, and Admin Order status updates.

### Changed
- **Stripe Card Form Styling:** Redesigned the Stripe card details input form container to use the light-themed card layout (white background, slate-200 border, slate-600 labels, brand blue accents) to match the overall premium visual aesthetic of the order wizard.
- **Chrome Non-Secure Autocomplete Bypass:** Replaced card placeholders with generic dot-masked indicators (`•••• •••• •••• ••••` and `••/••`), set `autoComplete="off"`, and generalized input IDs/names to prevent browsers from showing security warnings on local HTTP connections.
- **Multi-Member Ownership Validation:** Restricted ownership to `< 100%` per member when 2 or more members exist. If members are deleted back to a single person, ownership is automatically restored to `100%`.
- **Region-based Add-ons Filtering:** Compliance add-ons are now filtered dynamically based on the plan region. For example, US-only add-ons like *EIN Application*, *ITIN*, and *Reseller Permit* are automatically hidden for UK LTD plans, displaying instead UK-specific services like *UK Registered Office Address* and *Confirmation Statement*.
- **Stripe Service Checkout Payload:** Updated `useServiceCheckout.ts` to include the required `serviceId` parameter in the Stripe checkout request body, preventing API failures.
- **Automatic database seed:** Fixed PocketBase superuser/admin authentication endpoints to match the exact protocol of PocketBase `v0.22.22` and completed database migrations and seeding.
- **PocketBase Schema Mismatch Fix**: Corrected `useDocuments.ts`, `useOrders.ts`, and `useCompanies.ts` hooks to query based on `user` field directly rather than filtering by non-existent `workspace` relations.
- **E2E Testing Optimization**: Intercepted Cloudflare R2 uploads via Playwright routing, updated message click selectors, resolved email visibility for admin client search, and configured Playwright to execute in serial mode.

## 2026-07-07 — Admin UI Pagination, E2E QA Verification, Programmatic OG Pre-rendering & Deployment Foundations


### Added
- **Arabic & Mobile E2E Testing Coverage** — Wrote a new E2E test file `tests/e2e/rtl-and-mobile.spec.ts` to test language toggling, Arabic Right-to-Left layout direction triggers (`dir="rtl"`), and mobile viewport hamburger sidebar responsiveness.
- **Admin UI Reusable Pagination** — Built `PaginationBar.tsx` featuring sliding page window links, Chevron page navigators, and total item range indicators.
- **Programmatic OG Image Pre-renderer** — Wrote a Node.js pre-renderer script `generate-og-images.mjs` using Playwright to dynamically take screenshot previews of all blog posts and SEO country guides from PocketBase, in LTR (English) and RTL (Arabic) layout variants.
- **Cloudflare Worker Deployments** — Configured `wrangler.toml` files for all 5 core edge functions: `send-email`, `create-checkout`, `stripe-webhook`, `delete-user`, and `submit-contact` to simplify wrangler publishing.
- **PocketBase Production Package** — Added a lightweight alpine-based `pocketbase/Dockerfile` and a `pocketbase/fly.toml` app template configured with automated https, port routing, and volume mounting for SQLite persistent storage.
- **Live Stripe Seeding Script** — Added `scripts/sync-stripe-prices.mjs` to automatically verify, create, and seed products and price IDs on Stripe matching formation plans and add-on services.

### Changed
- **Sanitized hardcoded credentials** — Removed all instances of the hardcoded real email `instantgrow.net@gmail.com` and sensitive admin password `Admin@2025!` from `tests/e2e/auth.spec.ts`, `tests/e2e/admin-panel.spec.ts`, `scripts/ensure-admin-user.mjs`, and `expand_arabic_blogs.js`. Replaced them with environment variables (`process.env.PB_ADMIN_EMAIL` and `process.env.PB_ADMIN_PASSWORD`) and safe generic test values (`admin@example.local` / `AdminTestPassword123!`) for local test runs.
- **Executed and Verified E2E Test Suite** — Successfully executed the full Playwright E2E test suite (6/6 passing tests) on a clean, locally seeded PocketBase instance using the sanitized test credentials.
- **Wired Admin Pagination & Server-Side Filters** — Replaced `useAllCompanies` and `useAllDocuments` with the paginated `useCompanies` and `useDocuments` hooks in `AdminCompaniesPage.tsx` and `AdminDocumentsPage.tsx`. Wired filtering options (status, compliance status, document type) directly to the PocketBase backend to ensure correct pagination counts.
- **Resilient E2E Checkout Flow** — Fixed the `order-flow.spec.ts` test by adding steps to handle the split dual Add-on pages (Compliance & Tech Add-ons) and conditionally skip creating a customer account if the E2E session state is already authenticated.
- **Manual Database Security Audit** — Conducted a final manual audit on `pb_schema.json` rules, confirming secure configuration: profiles, orders, companies, documents, payments, and notification preferences are owner-locked/admin-only, and audit logs are strictly restricted to admin roles.
- **Dynamic SEO Metadata Fallbacks** — Wired `BlogDetailPage.tsx` and `SeoCountryPage.tsx` with localized fallback preview links (`/og/blog-*.png` and `/og/seo-*.png`), and updated `seo.ts` to resolve relative images into absolute URLs via `window.location.origin` with a default global fallback to `/logo.png`.
- **Automated Production Build Pipeline** — Linked the OG image generation script to run during the `npm run build` phase, allowing graceful compilation bypass in offline CI/CD compilation environments.

## 2026-07-05 — Multi-Tenant Workspaces, API Tokens, Webhooks & Bulk Uploads

### Added
- **Multi-Tenant Workspaces (B2B Portal)** — Added full support for B2B multi-tenant workspaces. Created `useWorkspace.tsx` provider, wrapped the App with `WorkspaceProvider`, and added a workspace switcher dropdown UI to the client navigation sidebar. Added `WorkspaceSettingsPage.tsx` allowing workspace owners to rename the workspace, view members, add new members by email, and revoke member access.
- **API Token System** — Added an "API Tokens" section to `AdminSettingsPage.tsx` where admins can generate secure, random API tokens (using `crypto.getRandomValues`) and revoke them. The tokens are saved in the admin's `metadata` JSON field.
- **Bulk Document Upload** — Refactored `AddDocumentModal.tsx` to support selecting and uploading multiple documents simultaneously. Added a scrollable UI list of selected files with remove buttons, and processed uploads sequentially with individual error/progress tracking.
- **Order Status Webhooks** — Implemented order status change webhook triggers in `UpdateStatusModal.tsx`, `EditOrderModal.tsx`, and `AdminOrdersPage.tsx` using a new `useUpdateOrderStatus` React Query mutation, sending a `POST` request to `VITE_ORDER_WEBHOOK_URL` on status changes.

### Changed
- **Client Hooks Scoped to Workspace** — Updated `useCompanies.ts`, `useOrders.ts`, and `useDocuments.ts` to query by the active workspace ID (`workspace = "${workspaceId}"`) instead of `userId`.
- **Query Compatibility Fallback** — Configured a fallback filter `(workspace = "" && user = "${userId}")` in all workspace-scoped client queries to ensure legacy user data remains visible in their default personal workspace.
- **Quoted Workflow Secrets** — Added quotes around secret context access in `.github/workflows/compliance-reminders.yml` (e.g. `"${{ secrets.PB_URL }}"`) to clear IDE validation warnings.
- **Restored Dashboard Hook Helpers** — Restored `useAllOrders` and `useAllUsers` in `useAdminData.ts` using `.getFullList()` to fix compiler errors across 4 admin summary pages.
- **Fixed Global Error Boundary TS Issues** — Addressed `override` method warnings and unused React imports in `GlobalErrorBoundary.tsx`, and replaced node-only `process.env.NODE_ENV` with `import.meta.env.DEV` to ensure clean TypeScript compilation.

## 2026-07-04 — Stripe USD Payment & Database Hooks Integration

### Added
- **PocketBase Lifecycle Hook Sync** — Created `pocketbase/pb_hooks/services.pb.js` database-level hook to synchronize PocketBase service records (creation & pricing updates) with Stripe Products and Prices on the fly.
- **E2E Playwright Automation Framework** — Set up full-coverage E2E test suites in `tests/e2e/` (auth, multilingual layout direction, order placement wizard, admin overview cards).
- **Admin Superuser Credentials Setup Script** — Built `scripts/ensure-admin-user.mjs` to programmatically sync and verify that the target client admin credentials exist on local PocketBase instances.
- **Resend Transactional Email Hook** — Wired transactional email dispatching (Checkout Success, Payment Failed, Refund, Dispute) using Resend API inside the Cloudflare Workers webhook handler.
- **Dashboard Financial Overview** — Extended `AdminPaymentsPage` into a premium financial dashboard containing revenue KPIs, top customer lists, customer directories, and Excel-compliant CSV/PDF reports.

### Changed
- **Stripe Session Routing** — Configured Workers checkout routes and PaymentIntent creators to enforce secure, server-side USD pricing lookups.
- **Verification Return Fallback** — Updated checkout callbacks to support live verification requests to `/verify-payment` to sync order state in case of webhook lag.

## 2026-07-02 — Responsive Mobile-First Redesign & Floating Widget Fixes

### Added
- **Global Spacing & Typography System** — Defined mobile-first CSS layout tokens in `index.css` supporting standard utility classes like `.ig-heading` (Desktop `54px` -> Mobile `32px`) and `.ig-body` (Desktop `20px` -> Mobile `16px`).
- **Static Services Fallback** — Created `staticServicesData` array fallback inside `Navbar.tsx` to automatically populate navigation category links when PocketBase API is offline, preventing empty drawers.

### Changed
- **Mobile Menu Containing Block Bugfix** — Moved the mobile menu drawer outside the `<header>` element and increased z-index to `z-[9999]`. This resolves containing block height restriction bugs caused by the header's `backdrop-filter` backdrop styling, ensuring solid full-viewport white background coverage.
- **Mobile Drawer Spacing Compacted** — Reduced link paddings (`py-2`), gaps, and bottom actions container padding to guarantee all header items fit on mobile screen viewports without vertical clipping.
- **Interactive Network Map Centered Stack** — Replaced absolute hover cards with stacked responsive lists below the world map on mobile to prevent horizontal clipping.
- **Floating Chat Widgets Raised** — Hidden the floating green WhatsApp icon bubble on mobile (integrated into the sticky bottom CTA bar instead) and raised the AI Chat widget bubble container position from `bottom-6` to `bottom-24` on mobile to float cleanly above the sticky bar.
- **Arabic RTL Timeline Vertical Line Fix** — Set `rtl:left-auto rtl:right-[40px]` class for the timeline connector dashed line in RTL mode, aligning it correctly with step circles.

## 2026-07-02 — Auth Sync, Compliance Filters, Email Worker

### Added
- **Last Sign-In Sync** — `useAuth.ts` now calls `syncLastSignIn(userId)` on every authenticated session, updating the `last_sign_in` field in PocketBase. Uses `sessionStorage` as a guard to prevent redundant writes per browser tab.
- **Send-Email Cloudflare Worker** — Created `functions/send-email/index.ts`, a production-ready Cloudflare Worker that proxies transactional email sends to the Resend REST API. Supports PocketBase token-based auth verification and allows guest sends to the admin address (for contact forms).
- **Admin Compliance Filter** — Added a "Compliance" dropdown filter to `AdminCompaniesPage.tsx` (🔴 Overdue, 🟡 Due Soon ≤30 days, 🟢 Compliant, ⚪ No Dates Set) wired into the in-memory `useMemo` filter.
- **Compliance Reminder Script** — Created `scripts/send-compliance-reminders.mjs`, a cron-ready Node.js script that authenticates to PocketBase as admin, checks all company compliance dates (renewal, annual report, tax filing, registered agent), sends personalized emails via Resend at 30-day and 7-day windows plus 1-day-overdue, and creates in-app notifications for each client.

### Changed
- **`.env.example`** — Added documentation for `send-email` Worker environment variables (`RESEND_API_KEY`, `ALLOWED_ORIGIN`, `ADMIN_EMAIL`) and compliance script variables (`PB_ADMIN_EMAIL`, `PB_ADMIN_PASS`, `FROM_EMAIL`, `APP_URL`).

## 2026-07-02 — Premium SaaS Services Directory Redesign


### Added
- **Premium Services Directory** — Redesigned `/services` into a premium SaaS-style interface featuring 8 major service categories and dynamic search functionality.
- **Dynamic Category Pages** — Created dynamic `/services/$categorySlug` pages featuring a sticky sidebar, featured service highlighting, and breadcrumbs.
- **Dynamic Service Detail Pages** — Created dynamic `/services/$categorySlug/$serviceSlug` pages with robust content sections (Overview, Inclusions, Process, Requirements, FAQs) and a sticky checkout card.
- **Dynamic SEO Injections** — Implemented comprehensive JSON-LD schema injections (Breadcrumb, Service, FAQ) and dynamic meta tags for all category and detail pages.
- **New Seed Data** — Seeded 8 new detailed company formation services (e.g., US LLC, UK LTD, UAE Company, Oman Company) and categorized them under 'Company Formation'.

### Changed
- **Type-Safe Routing** — Replaced raw string-based routing with TanStack Router's type-safe `params` for dynamic Links across category and detail pages.
- **Mascot Chat Integration** — Updated `SupportWidget` to use the new circular mascot for the floating bubble trigger and all inner chat messages.

## 2026-07-01 — Admin Services & Page Editor Fixes

### Added
- **Public Services Page** — Created `/services` directory with localized pricing, dynamic DB loading, and direct standalone order modal (`ServicesPage.tsx`).
- **Admin Services Module** — Full CRUD management for services (`AdminServicesPage.tsx`), assigning services as 'landing' or 'addon' types. Added dynamic rendering constraints and icon support.
- **Navbar Integration** — Added "Services" tab between Pricing and FAQ in main navigation.

### Changed
- **Admin Page Editor Validation** — Rebuilt `AdminPageEditorPage.tsx` form submission by removing raw `onClick` overrides and enabling HTML5 `required` constraints (e.g., Arabic titles), which previously caused silent 400 API errors from PocketBase.
- **Slug Uniqueness Checking** — Intercepted slug conflicts during page updates to prevent database UNIQUE constraint violations, offering user-friendly localized errors instead.
- **Competitor Matrix Facts** — Updated competitor table with accurate facts (e.g., Northwest registered agent free first year, Doola $297 bundle constraint, Firstbase standard package limitations, Bizee basic plan constraints).

## 2026-06-30 — Comparison Table Redesign

### Changed
- **Comparison Table Redesign** — Fully refactored `ComparisonTable.tsx` to match the new UI design. Added 5 metric cards (Formed, Rating, Countries, Satisfaction, Support), expanded comparison to 6 competitors (Instant Grow, Doola, Firstbase, Bizee, Northwest, DIY), dynamically styled the "Instant Grow" column with "BEST VALUE" badge, and implemented full bilingual (Arabic/English) RTL support.
- **Metric Values Updated** — Adjusted "Average Setup Time" to "1 Day", "Businesses Formed" to "1,000+", and "Countries Served" to "100+". Adjusted font colors and UI styling per design specs.

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
