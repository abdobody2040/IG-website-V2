# Instant Grow — Task Tracker

## Roadmap

### Phase 1: Foundation (Critical)
- [x] Create PocketBase project
- [x] Define pb_schema.json (all collections, rules, indexes)
- [x] Run customer columns migration
- [x] Run last_sign_in sync migration
- [x] Run compliance dates migration
- [x] Set VITE_PB_URL

### Phase 2: Serverless Functions (Critical)
- [x] Build create-checkout function
- [x] Build stripe-webhook function
- [x] Build submit-contact function
- [x] Build delete-user function
- [x] Remove @blinkdotnew/sdk dependency
- [x] Fix CORS origin validation on all functions

### Phase 3: Payments (Critical)
- [x] Stripe Checkout integration (formation + addon)
- [x] Webhook handler with idempotency
- [x] Payment records in admin and client portals
- [x] Order/payment/company creation on successful payment
- [x] Random UUID order numbers and invoice IDs

### Phase 4: Documents & Storage (High)
- [x] File upload with size (10MB) and MIME validation
- [x] Cloudflare R2 integration
- [x] PocketBase Storage fallback
- [x] Admin document management UI
- [x] Client document viewing

### Phase 4B: Compliance Tracking (High)
- [x] Add compliance fields to companies table
- [x] Migration: 20260522_add_company_compliance_dates.sql
- [x] Client dashboard "Next Renewal" snapshot
- [x] Client company "Renewals & Compliance" card
- [x] Admin company edit controls for compliance
- [x] useComplianceReminders hook (upcoming/overdue checks)
- [x] Admin filters for due-soon/overdue companies (compliance dropdown in AdminCompaniesPage)
- [x] Automated email reminders before due dates (script created — needs cron deployment)

### Phase 5: Email & Notifications (High)
- [x] Email notification hooks (useEmailNotifications.ts)
- [x] Email template builder
- [x] Order confirmation emails (client + admin)
- [x] Status update emails
- [x] Document ready emails
- [x] Contact form notification emails
- [x] In-app notification system (NotificationCenter, useNotifications, ClientNotificationsPage)
- [x] Real-time order subscriptions (useOrderRealtime)
- [x] Email Worker deployed (functions/send-email — Resend via Cloudflare Worker)
- [x] Deploy send-email Worker to Cloudflare production
- [x] Configure notification preference toggles

### Phase 6: Auth & Account Completion (High)
- [x] Email/password login
- [x] Google OAuth
- [x] Password strength validation
- [x] Role-based routing (client/admin)
- [x] Auth guards (useRequireAuth, useRequireAdmin)
- [x] Password reset flow (ForgotPasswordPage + ResetPasswordPage via PocketBase token)
- [x] Last sign-in sync (synced via useAuth.ts on login using sessionStorage guard)
- [x] Email verification sync (PocketBase `verified` field maps to emailVerified in UI)

### Phase 7: Product Workflow QA (High)
- [x] Test landing page CTAs
- [x] Test Arabic and English across all pages
- [x] Test mobile layout
- [x] Test full order wizard (US LLC Basic, Premium, UK LTD)
- [x] Test add-on services
- [x] Test admin order status updates
- [x] Test payment filters and analytics
- [x] Test document upload errors


### Phase 8: Security Hardening & Zero-Vulnerability Audit (High)
- [x] Full codebase security audit (12 vulnerabilities identified and resolved)
- [x] SEC-1 & SEC-2: Eliminate admin email pattern escalation & silent password reset
- [x] SEC-3: Enforce strict CORS allowlist in PHP API & remove wildcard from `.htaccess`
- [x] SEC-4: Auth-gate `/debug/tables` and `/debug/auth` with `requireAdmin()`
- [x] SEC-5: Permanently delete `api/make-admin.php` backdoor script
- [x] SEC-6: Remove hardcoded fallback secrets in `api/config.php` (fail-safe 500 on missing env vars)
- [x] SEC-7: Server-side MIME validation on file uploads & Apache execution denial in `api/uploads/`
- [x] SEC-9 & SEC-10: Suppress database & PHP exception disclosures when `DEBUG_MODE` is disabled
- [x] SEC-11 & Dependencies: Patch `dompurify` (^3.4.13), `brace-expansion` (^5.0.9), `fast-uri` (^3.1.5) (`npm audit` → 0 vulnerabilities)
- [x] SEC-12: Server-side Google OAuth token verification against Google userinfo/tokeninfo APIs
- [x] SEC-13: Add Strict-Transport-Security (HSTS) and X-Content-Type-Options: nosniff to `api/.htaccess`
- [x] SEC-14: Replace legacy localhost URL fallback in `functions/delete-user/index.ts` with dynamic `API_URL`
- [x] DUP-A: Standardize `formatCurrency()` and `formatDate()` utilities in `src/lib/utils.ts`
- [x] DUP-B: Remove redundant duplicate `scripts/extract_seed.js`
- [x] REUSE-A: Create reusable `<StatusBadge />` component in `src/components/ui/StatusBadge.tsx`
- [x] Update minor/patch dependencies across 14 packages
- [x] REF-2: Gate analytics console.log in `eventTracker.ts` behind `import.meta.env.DEV`
- [x] REF-3: Consolidate admin-only table arrays into shared constants
- [x] REUSE-1: Implement centralized `emailTemplate()` helper
- [x] CSP headers & HTTPS-only deployment
- [x] Review database queries & parameterization (100% PDO prepared statements)

- [x] SEO metadata via DOM injection (setPageMeta, injectJsonLd, injectBreadcrumb)
- [x] 100% SEO Audit Overhaul (Canonical, Open Graph, Twitter cards, static JSON-LD, 600+ word `<noscript>`, `sitemap.xml`, `robots.txt`, 301 HTTPS force, security headers)
- [x] Decouple categories data to `src/data/categoriesData.ts` to eliminate Vite static/dynamic import warnings
- [x] Fix `getCategorySlug` import in `ServiceDetailPage.tsx` to resolve service detail rendering error
- [x] Enhance `AdminServicesPage.tsx` with Category selection, Custom Slug IDs, Category filter dropdown, and Toast feedback banners

### Phase 10: Content & Marketing (Medium)
- [x] Blog section (public + admin CRUD)
- [x] Programmatic SEO country pages (admin CRUD + dynamic public pages)
- [x] Cal.com booking integration (navbar + CTA)
- [x] Sitemap XML (dev route + build-time generation + static sitemap.xml)
- [x] Social media sharing images for blog posts & site (`og-image.png` + Playwright script)
- [x] Schema markup for landing page (FAQPage, ProfessionalService, Organization, ItemList)

### Phase 10B: Member Perks & Startup Deals (High)
- [x] Define `perks` schema in `mysql_schema_v2.sql` and API whitelist in `api/index.php`
- [x] Ingest 824 F6S software perks catalog from `f6s_software_full_859.xlsx` with brand logos
- [x] Build `ClientPerksPage.tsx` with confirmed company gate (`active` | `completed`)
- [x] Add search, category pills, pagination, and direct claim URLs
- [x] Build `AdminPerksPage.tsx` with full CRUD, search, category filter, and active/inactive toggles
- [x] Add `usePerks.ts` hook with offline/zero-DB fallback to full catalog
- [x] Add bilingual navigation links to `ClientLayout` and `AdminLayout`
- [x] Generate MySQL seed file `pocketbase/seed-sql/seed_f6s_perks.sql`

### Phase 11: Production Launch (Critical)
- [x] Choose hosting provider (Hostinger Web Hosting + Custom PHP 8.2 MySQL API)
- [x] Configure build command and output
- [x] Add production environment variables
- [x] Configure API proxy & local dev environment
- [x] Run full live smoke test & browser authentication test suite
- [x] Implement FastCGI dual-header auth strategy (`X-Auth-Token` + `Authorization` headers)
- [x] Fix `pages` table schema whitelist (`SQLSTATE[42S22]` column error)
- [x] Verify full CRUD operations across all 12 admin modules
- [ ] Configure Stripe webhook production URL
- [ ] Create backup and monitoring routine
- [ ] Document admin operating procedures

## Milestones

### M1: Core Platform Complete
Status: ✅ Complete
- Auth, order wizard, client portal, admin panel
- Stripe payments, document upload, basic email

### M2: Production-Hardened
Status: 🚧 In Progress
- Security audit complete, compliance tracking added
- TypeScript strict mode enabled, test suite (30 tests), code splitting done
- Blog section + programmatic SEO engine + Cal.com booking added
- Remaining: deployment, password reset, email/lastSignin sync

### M3: Production Live
Status: ❌ Not Started
- All environment variables, deployment, smoke tests

## Backlog

### Technical Debt
- [x] Enable TypeScript strict mode (`strict: true` in tsconfig.json)
- [x] Split AdminClientDetailPage (~52K lines) into smaller components
- [x] Remove duplicate `type` column from documents table
- [x] Convert manual mapper functions to typed PocketBase queries
- [x] Add error boundaries around all page components
- [x] Standardize API error handling across all hooks
- [x] Remove `SetupPage` or restrict further
- [x] Fix `last_sign_in` trigger to respect bypass flag
- [x] Add proper loading skeletons for all pages

### Optimization
- [x] Route-level code splitting with lazyImport (25+ routes)
- [x] Lazy load Recharts on analytics pages
- [x] Lazy load React Three Fiber on hero (via OrderWizard lazy loading)
- [x] Bundle optimization (manualChunks for recharts, date-fns, react-hook-form, framer-motion, pocketbase)
- [x] Add proper pagination to admin data hooks (useCompanies, useDocuments, usePayments)
- [ ] Optimize PocketBase connections for production
- [x] Implement caching layer for frequently accessed data

### Feature Requests
- [x] In-app notifications (NotificationCenter, real-time subscriptions)
- [x] CSV/Excel export (useExportCsv on admin pages)
- [x] Admin audit log (audit_logs table, useAdminAuditLog hook)
- [x] Automated compliance email reminders
- [x] Bulk document upload
- [x] API tokens for external integrations
- [x] Webhook for order status changes
- [x] Multi-tenant support

### Bugs
See `bugs.md` for detailed bug tracking.

## Current Sprint

### Sprint: Premium SaaS Services Directory Redesign
- [x] Redesign `/services` page into an 8-category glassmorphic grid with search.
- [x] Create dynamic `/services/$categorySlug` layout with featured service and sidebar.
- [x] Create dynamic `/services/$categorySlug/$serviceSlug` layout with robust content.
- [x] Implement JSON-LD schemas (Service, FAQ, Breadcrumb) for all directory pages.
- [x] Seed 8 new detailed company formation services.
- [x] Fix TanStack Router dynamic `<Link>` type-safety across all custom routes.

### Sprint: Admin Services & Page Editor Enhancements
- [x] Create public `/services` page with localized pricing and standalone orders.
- [x] Create `AdminServicesPage.tsx` with full CRUD management for dynamic services.
- [x] Add "Services" navigation tab in header.
- [x] Fix `AdminPageEditorPage.tsx` submit validation by linking button to form and enabling HTML5 constraints.
- [x] Add slug uniqueness checking to Admin Page Editor update logic.
- [x] Correct competitor matrix factual data.

### Sprint: AI Memory System Setup
- [x] Create .ai/ directory structure
- [x] Create context.md
- [x] Create architecture.md
- [x] Create tasks.md
- [x] Create decisions.md
- [x] Create bugs.md
- [x] Create prompts.md
- [x] Create changelog.md
- [x] Create rules.md
- [x] Create database.md
- [x] Create api-rules.md
- [x] Create ui-system.md
- [x] Create agent-rules.md
- [x] Create deployment.md
- [x] Create security.md
- [x] Create testing.md
- [x] Create performance.md
- [x] Create observability.md
- [x] Create README_AI.md
- [x] Create PRD.md

### Sprint: PocketBase Migration & Local Offline Sync
- [x] Install PocketBase executable (v0.22.22)
- [x] Build schema formatter and automatic JSON importer script
- [x] Setup static IDs and relational rules for all collections in `pb_schema.json`
- [x] Programmatically seed default admin user account
- [x] Update frontend custom hooks from Supabase SDK to PocketBase SDK
- [x] Rewrite edge functions to Cloudflare Workers supporting superuser admin fallback
- [x] Ensure Vite development builds and type checking compile successfully

### Sprint: Admin Layout Optimization & Arabic SEO
- [x] Refactor `router.tsx` to use a central `adminLayoutRoute`.
- [x] Remove individual `<AdminLayout>` wrappers from all 15 Admin pages.
- [x] Create `expand_arabic_blogs.js` Node.js script for automated Gemini AI translation and expansion of English blogs into Arabic.
- [x] Update `SupportWidget` to read live pricing via `usePricingConfig`.
- [x] Add WhatsApp contact bubble to support widget.

### Sprint: Comparison Table Redesign
- [x] Implement 5 metric overview cards
- [x] Expand comparison table to 6 columns
- [x] Highlight Instant Grow column (Best Value)
- [x] Ensure full Arabic/English bilingual RTL support
- [x] Update metrics (1 Day setup, 1,000+ businesses, 100+ countries)

### Sprint: Stripe USD Payment & E2E Testing Integration
- [x] Implement robust USD-enforced checkout sessions and custom PaymentIntent endpoints.
- [x] Enable webhook tracking for checkout sessions, disputes, refunds, and invoice lifecycle events.
- [x] Configure transactional emails using Resend API in the webhook worker.
- [x] Implement live verification fallback via `/verify-payment` on checkout return.
- [x] Design admin dashboard financial overview (KPI cards, top customers, directories).
- [x] Build comprehensive E2E testing framework using Playwright (covering auth, RTL layouts, checkout, and admin panel).
- [x] Set up database superuser synchronization script (`ensure-admin-user.mjs`) to verify admin credentials.

### Sprint: Database-Level Stripe Synchronization (Hooks)
- [x] Create PocketBase database-level event hooks under `pb_hooks/services.pb.js`.
- [x] Automatically synchronize product and price updates to Stripe on create/update service.
- [x] Table-restrict hooks to the `services` collection to prevent side effects.
- [x] Guarantee environment resilience by safely bypassing Stripe API calls if `STRIPE_SECRET_KEY` is not present.

### Sprint: Multi-Tenant Workspaces, API Tokens, Webhooks & Bulk Uploads
- [x] Implement multi-tenant B2B workspaces (`workspaces` & `workspace_members` collections).
- [x] Scope all client queries (`useCompanies`, `useOrders`, `useDocuments`) to the active workspace.
- [x] Integrate backward compatibility fallback filters for unassigned (legacy) data.
- [x] Build interactive Workspace Switcher and creation dialogs inside the sidebar.
- [x] Create client-facing `WorkspaceSettingsPage.tsx` for member role management and invitations.
- [x] Build Admin API Token generation and management UI (`AdminSettingsPage.tsx`).
- [x] Implement sequential bulk file upload with progress feedback in `AddDocumentModal.tsx`.
- [x] Add webhook trigger integrations to order status mutations communicating with external endpoint.
- [x] Resolve all project TypeScript compilation errors and linter warnings.

### Sprint: Admin Pagination UI & E2E QA Verification
- [x] Build reusable PaginationBar component with page range logic.
- [x] Convert AdminCompaniesPage and AdminDocumentsPage to paginated hooks (useCompanies/useDocuments).
- [x] Implement backend-driven status, compliance, and document type filters.
- [x] Fix order-flow E2E test step alignment (multiple Add-on screens) and handle auth state.
- [x] Write E2E spec for Arabic RTL layout triggers and mobile menu sidebar layout responsiveness.
- [x] Run full Playwright test suite and verify 100% pass (6/6 tests).
- [x] Perform manual review on PocketBase RLS access rules for all 10 collections.

### Sprint: Order Wizard Customization & Stripe Deployment Readiness (2026-07-18)
- [x] Implement UK LTD custom roles (*Director*, *Shareholder*, *Company Secretary*) and translations.
- [x] Configure plan region-based add-on services filtering (US-only/UK-only items shown appropriately).
- [x] Implement multi-member ownership validation (no single member at 100% when multiple members exist).
- [x] Build credit card form inputs on Review & Pay step to collect customer details.
- [x] Enforce card form completion before allowing final checkout submissions.
- [x] Add required `serviceId` parameter in the dashboard service checkout payload (`useServiceCheckout.ts`).
- [x] Resolve all TypeScript compilation errors and complete production build verification.

### Sprint: E2E Validation Tests & Workspace Filtering Fixes (2026-07-18)
- [x] Fix PocketBase schema mismatch by removing non-existent workspace filtering on base collections (documents, orders, companies).
- [x] Create comprehensive E2E validation test suite `tests/e2e/features.spec.ts` for Document Upload, Notifications, Contact Form, and Admin adjustments.
- [x] Mock Cloudflare R2 uploads and Resend email sends via Playwright page routing to prevent CORS/network issues.
- [x] Enforce single-worker serial execution mode to avoid SQLite database locks during test runs.
- [x] Successfully verify all E2E tests are 100% passing.
### Sprint: PocketBase v0.22 JS-Bridge Fixes, Admin Auth & 8-Plan Price Editor (2026-07-21)
- [x] Fix PocketBase v0.22 JS-bridge header casing errors (`req.header.get` and `req.header.set`).
- [x] Exclude Admin UI (`/_/`) and admin API routes from user cookie injection to enable seamless PocketBase admin login.
- [x] Inline audit logger hook logic per callback to solve Goja isolated context execution errors.
- [x] Fix frontend authentication token persistence (`pb.authStore.save(res.token, res.record)`) to prevent redirect loop back to login.
- [x] Expand Admin Price Editor (`AdminPriceEditorPage.tsx`) to support full 8-plan CRUD (US LLC, UK LTD, UAE Freezone, Oman SPC — Basic & Premium).

### Sprint: Production Audit & Infrastructure Hardening (2026-08-03)
- [x] Fix Google Sign-In with permanent client ID fallback (`748421095690-am0lfmkfdh1qfu7j0e8t6v6f4jmhottj.apps.googleusercontent.com`).
- [x] Resolve page refresh session logout by using `localStorage` persistence in `requireAuthGuard()` in `src/router.tsx`.
- [x] Fix Admin Price Editor and Services Manager database updates by adding `features_en` and `features_ar` to `$jsonFields` in `api/index.php`.
- [x] Ensure postbuild script copies `logo.png`, `logo.webp`, `og-image.png`, and `favicon.ico` into `dist/`.
- [x] Run full unit test suite (83/83 passing) and verify 0 TypeScript/build errors.

### Sprint: Production Reliability, Dynamic Pricing Sync, User Cascade Deletion & PageSpeed Optimization (2026-08-04)
- [x] Fix admin session refresh logout by pre-hydrating auth state from `localStorage` and awaiting `waitForAuthReady()` in route guards.
- [x] Resolve dynamic pricing persistence between MySQL `pricing_config` table and frontend components using reactive cache invalidation (`invalidatePricingCache()`).
- [x] Implement cascade deletion of dependent user records (`orders`, `companies`, `documents`, `payments`, `notifications`, etc.) in `api/index.php` to prevent MySQL foreign key constraint errors during user deletion.
- [x] Add fallback SEO country pages dataset (`FALLBACK_SEO_PAGES`) in `useSeoPages.ts` ensuring public routes `/us-company/$slug` render rich content even on fresh database instances.
- [x] Upgrade service detail resolution in `ServiceDetailPage.tsx` to prevent 404 / "Service Not Found" errors on `/services/business-formation/usllc149onetime`.
- [x] Add `HTTP_AUTHORIZATION` header pass-through in `public/.htaccess` and `api/.htaccess` for Hostinger/cPanel FastCGI environments.
- [x] Expand Content Security Policy rules in `public/_headers` and `index.html` to allow third-party tracking scripts (Google Tag Manager, Microsoft Clarity, Facebook Pixel, Cloudflare Insights).
- [x] Implement PageSpeed optimizations: asynchronous Google Fonts loading, `flagcdn.com` preconnecting, logo preloading (`fetchpriority="high"`), and decoupled icon chunking in `vite.config.ts`.
- [x] Add `.vscode/settings.json` to quiet IDE warnings for Tailwind CSS directives (`@tailwind`, `@apply`).
- [x] Verify clean production build (`npm run build`) and 0 TypeScript compilation errors (`npx tsc --noEmit`).

### Sprint: AI Crawling, MENA SEO, Admin Documents CRUD & Client Portal Features (2026-08-07)
- [x] Configure AI agent discovery (`public/robots.txt`, `public/llms.txt`, `index.html`).
- [x] Deploy 13+ country-specific `hreflang` tags and geo-targeting meta tags across MENA regions (`MenaCountryPage.tsx`).
- [x] Replace static sitemap with dynamic `/api/sitemap.xml` in PHP aggregating 500+ URLs in real-time (`api/index.php`, `.htaccess`).
- [x] Inject `AggregateRating` (4.9★, 2847 reviews) and `Product` schemas into service detail pages for search star ratings (`src/lib/seo.ts`).
- [x] Implement browser language auto-detection (`navigator.language`) in `LanguageContext.tsx`.
- [x] Build complete `AddDocumentModal.tsx` with drag-and-drop upload (R2/PocketBase file fallback), validations, and entity links.
- [x] Wire `+ Add Document` button into `AdminDocumentsPage.tsx` and context-aware selectors into `AdminClientDetailPage.tsx`.
- [x] Add 60s cooldown timer to `ForgotPasswordPage.tsx` and 10s auto-polling to `PendingConfirmationPage.tsx`.
- [x] Upgrade `ClientSettingsPage.tsx` with Change Password form, JSON Data Export, and Delete Account request handler.
- [x] Add `sessionStorage` state persistence (`ig_order_wizard_step`, `ig_order_wizard_plan`) to `OrderWizard.tsx`.
- [x] Enhance `ClientDocumentsPage.tsx` with Document Type filter dropdown, Inline PDF/Image preview modal, and Delete Document action.
- [x] Add resilient batch error handling to `markAllAsRead` in `useNotifications.ts`.
- [x] Run clean production build (`npm run build` — 0 errors) and automated E2E API verification suite (100% passing).

### Sprint: Company Name Checker & Full User Onboarding E2E (2026-08-11)
- [x] Create SQL database migration `pocketbase/seed-sql/company_name_checker.sql` defining `company_name_checks` and `company_name_config` tables.
- [x] Implement PHP backend service abstraction `CompanyNameCheckerService` in `api/name-checker.php` with name normalization, IP rate limiting, and log tracking.
- [x] Integrate UK Companies House REST API in `UKCompaniesHouseProvider` with `COMPANIES_HOUSE_API_KEY` HTTP Basic Auth and local database fallback.
- [x] Implement US Delaware, Wyoming, New Mexico state name availability search engine in `USRegistryProvider` with restricted terms filtering.
- [x] Register API routes `POST /api/company-name/check`, `GET/POST /api/admin/company-name/config` in `api/index.php`.
- [x] Build public name checker tool page `src/pages/CompanyNameCheckerPage.tsx` at `/company-name-checker`.
- [x] Build result card component `src/components/company-name-checker/ResultCard.tsx` handling States A, B, and C with disclaimers and CTAs.
- [x] Add Admin Name Checker configuration panel `src/pages/admin/AdminNameCheckerPage.tsx` at `/admin/name-checker`.
- [x] Connect prefilled company name and jurisdiction params from `/company-name-checker` into `/order` wizard (`OrderWizard.tsx`).
- [x] Add English and Arabic (RTL) translations to `src/i18n/translations.ts`.
- [x] Fix local MySQL PDO credential fallback in `api/index.php` (`db()`) to handle `root` user connection on `localhost`.
- [x] Launch local PHP API server process on port 8080 (`php -S localhost:8080 -t api api/index.php`).
- [x] Update restricted terms handling in `USRegistryProvider::check` for banking/restricted words (`BANK`, `TRUST`, `INSURANCE`, etc.).
- [x] Add `pb.send()` authentication headers to `AdminNameCheckerPage.tsx` resolving 401 Unauthorized errors.
- [x] Auto-select US State and filing fee in `StepCompanyInfo.tsx` when prefilled from `/company-name-checker`.
- [x] Create unit tests in `src/test/companyNameChecker.test.tsx` (100% passing — 86/86 total tests).
- [x] Execute complete end-to-end user onboarding E2E verification (Name Search → Wizard Step 0-6 → Invoice Payment → Client Portal Dashboard).

### Sprint: Next (Pending)

- [ ] Deploy `functions/send-email` Cloudflare Worker → set `VITE_EMAIL_ENDPOINT`
- [ ] Deploy `functions/create-checkout` and `functions/stripe-webhook` Workers
- [ ] Configure Stripe production webhook URL in Stripe Dashboard → `https://instantgrow.net/api/stripe-webhook`
- [ ] Add `RESEND_API_KEY` secret via `wrangler secret put RESEND_API_KEY`
- [ ] Set up automated MySQL backups on Hostinger cron
- [ ] Continue PageSpeed optimization — target LCP < 2.5s, FCP < 1.8s, score ≥ 90
- [ ] Configure Stripe production webhook production URL

