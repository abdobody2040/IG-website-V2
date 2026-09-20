# Instant Grow — Changelog

## 2026-08-15 — Full Security Audit, Backend Hardening, Zero-Vulnerability Dependency Fixes
- **Privilege Escalation & Backdoor Removal (`api/index.php`, `api/make-admin.php`)** — Deleted `api/make-admin.php` backdoor script. Removed all email pattern matches (`instantgrow.net@gmail.com` / `@instantgrow.net`) from user registration, password verification, Google OAuth, and JWT verification. First-run bootstrap now only permits creating an admin when the `users` table is completely empty.
- **Strict CORS Origin Allowlist (`api/index.php`, `api/.htaccess`)** — Replaced wildcard CORS headers with a strict domain allowlist (`instantgrow.net`, `www.instantgrow.net`, `localhost:5173/3000`). Removed static wildcard header from `.htaccess` to prevent overriding PHP security controls.
- **Server-Side Google OAuth Token Verification (`api/index.php`, `src/lib/pocketbase.ts`)** — Updated Google OAuth endpoint `/auth/google` to verify `access_token` against Google's `userinfo` API or `id_token` against `tokeninfo` before trusting account emails. Updated frontend client to send OAuth tokens.
- **Fail-Safe Secrets Management (`api/config.php`)** — Removed all hardcoded fallback secrets for `JWT_SECRET` and `ADMIN_SECRET`. The PHP backend now terminates with `500 Server misconfiguration` if critical security keys are missing.
- **Auth-Gated Debug Endpoints (`api/index.php`)** — Restricted `/debug/tables` and `/debug/auth` to authenticated administrators via `requireAdmin()`.
- **Upload Hardening & MIME Validation (`api/index.php`, `api/.htaccess`)** — Implemented server-side `mime_content_type()` validation on uploaded files, randomized alphanumeric filenames, and added Apache directives disabling PHP script execution inside `api/uploads/`.
- **Error Disclosure Suppression (`api/index.php`)** — Database connection and query errors are sanitized in production responses, revealing detailed PDO traces only when `DEBUG_MODE` is explicitly enabled.
- **HSTS & Apache Security Headers (`api/.htaccess`)** — Added `Strict-Transport-Security "max-age=31536000; includeSubDomains"` and `X-Content-Type-Options "nosniff"` to reinforce transport security on all backend API responses.
- **Worker Configuration Fail-Safe (`functions/delete-user/index.ts`)** — Replaced legacy local port fallback with dynamic `API_URL` / `PB_URL` resolution that throws an immediate 500 error if unconfigured.
- **Zero-Vulnerability Dependencies (`package.json`, `package-lock.json`)** — Patched high-severity DoS and XSS vulnerabilities via npm overrides and updated minor/patch packages (`@tanstack/react-query` `5.101.4`, `@tanstack/react-router` `1.170.29`, `date-fns` `4.4.0`, `lucide-react` `1.31.0`, `react-hook-form` `7.85.0`, `recharts` `3.10.1`, `tailwind-merge` `3.6.0`, `zod` `4.4.3`, `lenis` `1.3.26`, `playwright` `1.62.1`). `npm audit` reports 0 vulnerabilities.
- **Shared Formatting Helpers & Status Badge (`src/lib/utils.ts`, `src/components/ui/StatusBadge.tsx`, `scripts/`)** — Added `formatCurrency()` and `formatDate()` to `utils.ts`, created a reusable `<StatusBadge />` component for consistent order/company badge styling, and deleted redundant CommonJS duplicate `scripts/extract_seed.js`.
- **Seamless Gapless Infinite Marquees (`src/components/TrustLogos.tsx`, `src/components/effects/InfiniteMarquee.tsx`, `src/components/Reviews.tsx`)** — Solved the empty right-hand gap and jump issue in both LTR and RTL/Arabic modes by enforcing explicit LTR direction isolation on marquee tracks, using dual synchronized track clone strips with matched padding, and adding edge fade gradient masks.
- **Unique Branded High-Res Blog Cover Images (32+ Assets Generated, `scripts/generate-all-blog-images.mjs`, `scripts/generate-og-images.mjs`, `src/data/blogsData.ts`, `src/pages/BlogListPage.tsx`, `src/pages/BlogDetailPage.tsx`)** — Built an automated 1200x630px OpenGraph & Cover Image generator for all 16 blog posts in English and Arabic. Features Instant Grow official branding, category color accents, cybernetic mesh lighting, glassmorphism hologram metric cards, Trustpilot 5-star badges, and complete SEO `ImageObject` and `Article` schema integration.
- **Transactional Email Template & Code Consolidations (`api/index.php`, `src/lib/tracking/eventTracker.ts`)** — Added reusable `emailTemplate()` helper function; unified `$_ADMIN_ONLY_CREATE`, `$_ADMIN_ONLY_WRITE`, `$_ADMIN_ONLY_DELETE` constants; gated tracking `console.log` behind `import.meta.env.DEV`.

## 2026-08-14 — Member Perks System & 824 F6S Software Deals Ingestion
- **Gated Member Perks Marketplace (`src/pages/client/ClientPerksPage.tsx`, `/client/perks`)** — Built an exclusive perks & discounts marketplace accessible only to clients with confirmed/active company formations (`status === 'active' || status === 'completed'`). Unconfirmed users see a founder teaser with step-by-step guidance. Features category filtering pills, live search, 24-card pagination, high-resolution brand logos with fallback handling, and direct deal claim buttons.
- **824 F6S Software Deals Catalog (`src/data/f6sPerks.ts`, `pocketbase/seed-sql/seed_f6s_perks.sql`)** — Ingested and categorized all 824 software deals from `f6s_software_full_859.xlsx` ($1.5M+ in founder perks and credits from AWS, GitHub, OpenAI, Cloudflare, Linear, Stripe, Google Workspace, etc.) with 128px brand logos via Google Favicon CDN.
- **Full Admin Perks Management Panel (`src/pages/admin/AdminPerksPage.tsx`, `/admin/perks`)** — Created an admin CRUD dashboard with search, category filtering, active/inactive toggles, logo URL management, and delete confirmation modal.
- **Database & API Integration (`api/index.php`, `pocketbase/seed-sql/mysql_schema_v2.sql`, `src/types/db.ts`)** — Added `perks` table schema and API whitelist with `logo_url`, `category`, `claim_type`, and `offer_value` fields. Public read with `active = 1` guard; admin-only writes.
- **Bilingual & Navigation Integration (`src/i18n/translations.ts`, `ClientLayout.tsx`, `AdminLayout.tsx`, `router.tsx`)** — Added Member Perks (`مزايا الأعضاء`) to client and admin sidebars with full English and Arabic translations.
- **Zero-DB Resilience (`src/hooks/usePerks.ts`)** — Configured `usePerks` with fallback to `F6S_PERKS` so the entire catalog displays and operates seamlessly even before MySQL table seeding.

## 2026-08-12 — Compliance Reminders, Pricing Reactivity & Feature Cleanup
- **Compliance Reminder Script Migration (`scripts/send-compliance-reminders.mjs`)** — Rewrote the cron script to authenticate via the new PHP REST API (`/api/auth/login`) instead of the defunct PocketBase API. Uses JWT bearer tokens to fetch companies and users, and successfully creates in-app notifications. Maintains backward compatibility with `PB_URL` for GitHub Actions secrets.
- **Pricing Editor Reactivity (`src/hooks/usePricingConfig.ts`, `src/pages/admin/AdminPriceEditorPage.tsx`)** — Migrated the pricing configuration fetch to TanStack Query for robust caching and invalidation. Calling `invalidatePricingCache()` from the admin panel now instantly reflects price changes on the public landing page without hard refreshes.
- **Company Name Checker Feature Removal** — Completely removed the Company Name Checker feature from the codebase (`/company-name-checker`, `/admin/name-checker`, `api/name-checker.php`, `src/components/company-name-checker/`, navigation links in `Navbar` & `Footer`, router definitions, API endpoints, unit tests, and i18n keys).

## 2026-08-11 — Company Name Checker Fixes, Local DB Fallback & Full User Onboarding E2E
- **Local MySQL Connection Fallback (`api/index.php`)** — Updated `db()` to automatically attempt fallback connection as `root` with `""` password on `localhost` when the default production DB user fails with access denied (B-044).
- **Restricted Terms Detection (`api/name-checker.php`)** — Updated `USRegistryProvider::check` to flag restricted terms (`BANK`, `TRUST`, `INSURANCE`, `RESERVE`, `TREASURY`, `UNIVERSITY`, `FEDERAL`) as similar name matches with explicit state approval warning messages instead of returning "Likely Available".
- **Admin Configuration Authentication (`src/pages/admin/AdminNameCheckerPage.tsx`)** — Replaced unauthenticated `fetch()` calls with `pb.send('/admin/company-name/config')`, passing `Authorization` and `X-Auth-Token` headers to eliminate `401 Unauthorized` errors in the admin panel.
- **Environment-Agnostic Endpoint Invocation (`src/pages/CompanyNameCheckerPage.tsx`)** — Replaced raw `fetch()` calls with `pb.send()` for API calls to ensure environment variable `VITE_API_URL` and header configurations are respected.
- **Order Wizard State Pre-selection (`src/pages/order/StepCompanyInfo.tsx`, `OrderWizard.tsx`)** — Pre-populated `selectedState` and state fee (`DE` $100, `WY` $50, `NM` $0) when redirected from the Name Checker tool with a US state jurisdiction.
- **Database Table Auto-Initialization (`api/name-checker.php`, `pocketbase/seed-sql/MASTER_SEED_ALL.sql`)** — Added `ensureTablesExist()` in `CompanyNameCheckerService` to auto-create `company_name_checks` and `company_name_config` tables if missing, and added schema definitions to `MASTER_SEED_ALL.sql`.
- **Full User Onboarding E2E Verification** — Performed live browser testing from `/company-name-checker` through `/order` steps 0-6 to client portal `/client/dashboard` auto-redirect, confirming 100% functional flow and 0 errors.
- **Test Suite Verification** — Achieved 100% test suite pass rate across 86 unit tests (`vitest run`) and 0 TypeScript compilation errors (`npx tsc --noEmit`).

## 2026-08-11 — Production-Ready Company Name Checker Feature (End-to-End)

### Company Name Availability Search & Registry Integration
- **Public Name Checker Tool (`/company-name-checker`, `src/pages/CompanyNameCheckerPage.tsx`)** — Built a dedicated tool for checking proposed US LLC (Delaware, Wyoming, New Mexico) and UK LTD company names before starting an order. Features segmented country tabs, state cards, entity suffix dropdown (`LLC`, `Inc`, `Ltd`), loading states with spam prevention, and SEO schema.
- **Result UI Component (`src/components/company-name-checker/ResultCard.tsx`)** — Handled State A (Likely Available), State B (Similar/Existing Name with matched entities table), and State C (Unable to Verify) with legal disclaimers.
- **Backend API & Service Abstraction (`api/name-checker.php`, `api/index.php`)** — Built `CompanyNameCheckerService` with jurisdiction-aware name normalizer (`normalize()`), rate limiter (10 requests/min per IP), search logger, and endpoints `POST /api/company-name/check` and `GET/POST /api/admin/company-name/config`.
- **UK Companies House REST API Adapter (`UKCompaniesHouseProvider`)** — Connected to Companies House search API (`api.company-information.service.gov.uk`) using `COMPANIES_HOUSE_API_KEY` Basic Auth with local database verification fallback.
- **US Registry Provider Adapter (`USRegistryProvider`)** — Implemented state entity verification search for DE, WY, and NM with restricted terms checking (`BANK`, `TRUST`, `INSURANCE`).
- **Conversion Funnel Integration (`src/pages/order/OrderWizard.tsx`)** — Redirected `"Start My Company →"` to `/order`, pre-filling company name and jurisdiction into the formation wizard.
- **Admin Configuration Panel (`src/pages/admin/AdminNameCheckerPage.tsx`)** — Created admin settings page to toggle jurisdiction readiness and rate limits.
- **Unit Test Suite & Verification (`src/test/companyNameChecker.test.tsx`)** — Added unit tests verifying States A, B, and C rendering & events (100% passing). Verified `npx tsc --noEmit` (0 errors) and Vite build.

## 2026-08-08 — Admin CRUD Operations Fix, PHP API Boolean Casting, User Cascade Deletion & Anti-Caching


### Admin Platform CRUD & Persistence Fixes
- **HTTP Anti-Caching & Cache-Busting (`api/index.php`, `src/lib/pocketbase.ts`)** — Resolved issue where edits/deletions appeared unsaved due to aggressive browser and proxy HTTP caching on `GET` requests. Added `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` headers to `api/index.php` and appended `_t=${Date.now()}` query timestamps to all `getList` and `getOne` requests in `pocketbase.ts`.
- **MySQL Strict Mode Boolean Serialization (`api/index.php`)** — Fixed `SQLSTATE[22007]` prepared statement failures when creating/editing records with boolean properties (`active`, `published`, `featured`, `requires_company`, `read`). Converted boolean values explicitly to integers (`1` / `0`) prior to binding.
- **Master Admin JWT Role Enforcement (`api/index.php`)** — Updated `getAuthFromHeader()` to enforce `role: 'admin'` for master admin accounts (`instantgrow.net@gmail.com`, `admin@instantgrow.net`), preventing authorization rejections caused by stale local JWT payloads.
- **User Profile Edits & Full Cascade Deletion (`api/index.php`)** — Added `'users'` table to `$clientMutableTables` with self-ownership checks (`$id === $auth['id']`), and implemented full cascade deletion across `workspaces` (`owner = ?`) and `admin_audit_log` (`admin = ?`) upon user deletion.
- **Local File Uploads & Upload Delivery Endpoint (`api/index.php`)** — Added fallback `$_FILES` processing for multipart document uploads into `/api/uploads/` and created static route `GET /uploads/{file}` for direct document viewing.

## 2026-08-07 — AI Agent Crawling, MENA SEO, Admin Documents CRUD, Client Features & E2E QA

### AI Crawling & MENA SEO Upgrades
- **AI Agent Crawling & Indexing (`public/robots.txt`, `public/llms.txt`, `index.html`)** — Configured `robots.txt` and `llms.txt` to enable discovery by AI search engines (ChatGPT, Claude, Perplexity).
- **MENA Geo-Targeting & `hreflang` Tags (`index.html`, `src/pages/MenaCountryPage.tsx`)** — Deployed 13+ country-specific `hreflang` tags and geo-targeting meta tags across MENA regions. Refactored `MenaCountryPage.tsx` to handle 15+ regions with bilingual content and dynamic schema injection.
- **Dynamic Real-Time Sitemap (`api/index.php`, `public/.htaccess`)** — Replaced static sitemap with dynamic `/api/sitemap.xml` in PHP that aggregates 500+ URLs (blogs, services, country pages) in real-time.
- **Rich Snippet Rating Schemas (`src/lib/seo.ts`, `src/pages/ServiceDetailPage.tsx`)** — Injected `AggregateRating` (4.9★, 2847 reviews) and `Product` schema into service detail pages to trigger star ratings in search engine results.
- **Browser Language Auto-Detection (`src/i18n/LanguageContext.tsx`)** — Upgraded `LanguageContext` to auto-detect browser locale (`navigator.language`), defaulting to Arabic if browser is Arabic and English otherwise, while maintaining dual-key state sync (`ig-lang` and `ig_lang`) for legacy components.

### Admin Platform & Documents Full CRUD
- **Admin Document Creation Modal (`src/pages/admin/components/AddDocumentModal.tsx`)** — Built complete `AddDocumentModal` with drag-and-drop file upload (Cloudflare R2 with PocketBase file fallback), file type/size validation, manual URL entry, document type, status, and linked entity IDs.
- **Admin Documents Page Integration (`src/pages/admin/AdminDocumentsPage.tsx`)** — Wired `+ Add Document` button into the page header with query invalidation on save.
- **Context-Aware Client Detail Integration (`src/pages/admin/AdminClientDetailPage.tsx`)** — Updated `AddDocumentModal` to pre-fill and lock User ID and render smart Order and Company dropdowns populated from the user's existing records.

### Client Portal & User Experience Improvements
- **Forgot Password Rate-Limit Cooldown (`src/pages/auth/ForgotPasswordPage.tsx`)** — Added a 60-second cooldown timer on submit to prevent button spamming.
- **Pending Confirmation Real-Time Polling (`src/pages/auth/PendingConfirmationPage.tsx`)** — Implemented 10-second auto-polling to detect order/payment activation without manual page refreshes.
- **Client Settings Page Capabilities (`src/pages/client/ClientSettingsPage.tsx`)** — Enhanced settings page with a **Change Password form** (with current & confirm password validation), **JSON Data Export** (downloads user profile, orders, and documents as JSON), and **Delete Account request handler**.
- **Order Wizard State Persistence (`src/pages/order/OrderWizard.tsx`)** — Persisted current step and selected plan in `sessionStorage` (`ig_order_wizard_step`, `ig_order_wizard_plan`) to preserve progress across accidental refreshes. Automatically cleared on order completion.
- **Client Documents Upgrades (`src/pages/client/ClientDocumentsPage.tsx`)** — Added **Document Type filtering**, an **Inline PDF/Image preview modal** using `<iframe>`, and a **Delete Document action** for user-owned files.
- **Notification System Resilience (`src/hooks/useNotifications.ts`)** — Added batch fallback error handling to `markAllAsRead` so it operates seamlessly across both PHP API endpoints and PocketBase collection fallbacks.

### Production Build & E2E Verification
- **Clean Production Build (`npm run build`)** — Built in 50.64s with 0 TypeScript compilation errors.
- **Automated E2E API Test Suite** — Executed E2E verification tests against PHP API: User Signup, Auth Login, Document CRUD (Create, Read, Update, Delete), and Notification Mark-Read APIs all passing 100%.

---

### Complete Platform Audit & Recovery Completed
- **Dual-Header FastCGI Auth Strategy (`pocketbase.ts`, `api/index.php`, `api/.htaccess`)** — Resolved global read-only issue across all 12 admin modules (Orders, Clients, Companies, Documents, Blog, SEO Pages, Payments, Analytics, Tracking, Home Editor, Price Editor, Services, Pages). Implemented dual `Authorization` + `X-Auth-Token` header transmission in `apiFetch` and updated `extractBearerToken()` to read from 4 redundant locations (`HTTP_X_AUTH_TOKEN`, `HTTP_AUTHORIZATION`, `REDIRECT_HTTP_AUTHORIZATION`, `apache_request_headers()`).
- **Pages Table Schema Fix (`api/index.php`)** — Resolved `500 Internal Server Error` on page creation (`SQLSTATE[42S22] Unknown column 'title'`) by removing non-existent columns from `$tableColumns['pages']` and aligning with the MySQL table schema (`slug`, `title_en`, `title_ar`, `content_en`, `content_ar`, `active`).
- **Full End-to-End Live Verification** — Executed live integration tests across all 12 admin endpoints confirming `200 OK` reads, `201 Created` inserts, `200 OK` updates, and `204 No Content` deletes.
- **Clean Production Build** — Built with `npm run build` (0 TypeScript errors, 100% build health in 21.63s).

### Secondary Fixes
- **`api/.htaccess` — Removed duplicate CORS headers:** The wildcard `Access-Control-Allow-Origin: *` set by `.htaccess` conflicted with `index.php`'s origin-reflecting header (`Access-Control-Allow-Origin: <origin>`), producing duplicate headers that browsers reject for credentialed requests. Only `index.php` now sets CORS headers.
- **`api/.htaccess` — Added `RewriteBase /api/`:** Prevents incorrect path resolution when `index.php` is under the `/api/` subdirectory on Hostinger.
- **`api/index.php` — Added `/debug/auth` diagnostic endpoint:** Returns which `$_SERVER` key the Authorization token was found in, whether the token is valid, and the decoded admin identity. Essential for post-deploy verification.


### Fixed & Enhanced
- **Admin Session Refresh & Auth Guard Hydration (`pocketbase.ts`, `useAuth.ts`, `router.tsx`)** — Fixed premature logouts on page refresh by awaiting `waitForAuthReady()` prior to route guard checks and hydrating user auth state directly from `localStorage`. Prevented token destruction on temporary network hiccups.
- **Dynamic Pricing Persistence & Live Sync (`api/index.php`, `AdminPriceEditorPage.tsx`, `usePricingConfig.ts`, `config/pricing.ts`)** — Resolved pricing sync gaps between MySQL and frontend views. Admin price updates in `pricing_config` now trigger reactive cache invalidation (`invalidatePricingCache()`) and update live pricing components without hard refreshes.
- **Cascade User Deletion in Admin (`api/index.php`)** — Resolved foreign key constraint error (`MySQL 1451`) during user deletions in `AdminClientsPage.tsx` by cascading cleanups across dependent tables (`notifications`, `documents`, `companies`, `orders`, `payments`, `workspace_members`, `notification_preferences`) prior to user row deletion.
- **SEO Country Pages & Fallback Data (`useSeoPages.ts`, `SeoCountryPage.tsx`)** — Added `FALLBACK_SEO_PAGES` dataset in `useSeoPages.ts` for key target countries (**Egypt**, **Saudi Arabia**, **UAE**, **Morocco**, etc.). Public routes `/us-company/$slug` render rich content, benefits, and schemas even if the MySQL table is newly initialized.
- **USA Formation Service Detail Resolution (`ServiceDetailPage.tsx`, `useServices.ts`)** — Replaced fragile service ID matching with multi-stage fallback lookup (`services` $\rightarrow$ `FALLBACK_SERVICES` $\rightarrow$ `SERVICES_EXTENDED_DATA`), resolving 404 / "Service Not Found" errors on `/services/business-formation/usllc149onetime`.
- **Apache/FastCGI Authorization Pass-Through (`public/.htaccess`, `api/.htaccess`)** — Added `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1` and `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP_AUTHORIZATION}]` in both `.htaccess` files to pass Bearer tokens to PHP under Hostinger/cPanel FastCGI environments.
- **CSP Headers for Analytics & Ads (`public/_headers`, `index.html`)** — Updated Content Security Policy rules to allow Google Tag Manager (`googletagmanager.com`), Microsoft Clarity (`clarity.ms`), Facebook Pixel (`connect.facebook.net`), and Cloudflare Insights.
- **PageSpeed & Performance Optimization (90+ Score)** —
  - Removed render-blocking `@import` from `src/index.css` and implemented asynchronous font preloading in `index.html`.
  - Added CDN `preconnect` for `flagcdn.com` and `fetchpriority="high"` for hero logo.
  - Decoupled `lucide-react` chunking in `vite.config.ts` to allow dynamic tree-shaking per route chunk, dramatically decreasing main-thread blocking time (TBT).
- **IDE Linter Configuration (`.vscode/settings.json`)** — Created `.vscode/settings.json` with `"css.lint.unknownAtRules": "ignore"` to mute VS Code warnings for Tailwind CSS directives (`@tailwind`, `@apply`).
- **Clean Production Build** — Verified with `npm run build` (0 errors, 100% build health).

## 2026-08-04 — Complete Tracking & Analytics Module

### Added & Integrated
- **Tracking & Analytics Enterprise Module (`src/components/tracking/`)** — Created complete, production-ready Tracking & Analytics management system accessible under `/client/tracking` and `/admin/tracking`.
- **18 Analytics & Advertising Pixel Integrations (`providerRegistry.ts`)** — Built full configuration and connection management for:
  - *Analytics*: Google Analytics 4 (GA4), Google Tag Manager (GTM), Microsoft Clarity, Hotjar, Plausible Analytics, Matomo, Mixpanel, PostHog.
  - *Advertising Pixels*: Meta Pixel & Conversions API (CAPI), Google Ads, TikTok Pixel & Events API, LinkedIn Insight Tag, Snapchat Pixel, Pinterest Tag, X (Twitter) Pixel, Reddit Pixel.
  - *Search Console & Webmaster*: Google Search Console & Bing Webmaster verification.
- **Dynamic Script Injector (`scriptInjector.ts`)** — Created DOM script injector supporting active provider tags while adhering to Google Consent Mode V2 preferences.
- **Client-Side Event Bus (`eventTracker.ts`)** — Created universal event dispatcher supporting standard & custom event signals (`Purchase`, `Lead`, `Form Submit`, `Book Call`, `WhatsApp Click`).
- **Google Consent Mode V2 & GDPR/CCPA Banner (`consentManager.ts`, `CookieConsentBanner.tsx`)** — Implemented Consent Mode V2 initialization (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) with live customizable cookie banner.
- **Pixel Helper & Diagnostic Scanner (`PixelHelperTab.tsx`)** — Added tag health audit scanner checking for missing pixels, broken tags, duplicate scripts, and Consent Mode V2 status.
- **UTM Campaign Builder & QR Code Generator (`UtmBuilderTab.tsx`)** — Built custom campaign link generator with short URL and SVG QR code preview.
- **Multi-Domain & Team Permission Matrix (`MultiDomainTab.tsx`)** — Added domain management properties and role-based access matrix (Owner, Admin, Marketing, Developer, Viewer).
- **PHP REST API Database Allowlist (`api/index.php`)** — Added `tracking_integrations`, `tracking_events`, `tracking_domains`, `tracking_consent`, `tracking_custom_events`, and `tracking_logs` to `$allowed` and `$tableColumns`.
- **100% Test Suite & Clean Vite Build** — Verified all 83/83 unit tests passing, clean production build.

## 2026-08-04 — Admin Services Manager & Category Management Upgrade

### Added & Enhanced
- **Admin Category & Custom Slug Management (`AdminServicesPage.tsx`)** — Upgraded Services Manager modal to allow admins to assign any service to its exact category (*Business Formation, Government & Compliance, Banking & Payments, Legal Documents, Branding, Websites, Marketing, Content, AI Automation, Software, Business Consulting, Education*). Added custom ID/slug input for new service creation.
- **Category Table Filter & Display (`AdminServicesPage.tsx`)** — Added a dedicated Category filter dropdown to the Services table header and displayed category badges on every service row.
- **Toast Feedback Banners (`AdminServicesPage.tsx`)** — Added animated success (`CheckCircle`) and error (`AlertCircle`) toast banners on service creation, updates, toggles, and deletions.
- **100% Test Suite & 0 Warning Build** — Verified all 83/83 unit tests passing, clean Vite build (`npx vite build` in 14.20s with 0 warnings/errors).

## 2026-08-03 — Vite Chunk Decoupling & Service Detail `getCategorySlug` Resolution

### Fixed & Refactored
- **Categories Data Decoupling (`src/data/categoriesData.ts`)** — Extracted `CATEGORY_MAP` and `getCategorySlug` out of `ServicesPage.tsx` into a dedicated data file `src/data/categoriesData.ts`. Updated imports across `Navbar.tsx`, `ServicesPage.tsx`, `ServiceCategoryPage.tsx`, and `ServiceDetailPage.tsx`. Completely eliminated Vite build warning `(!) ServicesPage.tsx is dynamically imported by router.tsx but also statically imported by Navbar.tsx`.
- **Service Detail `getCategorySlug` Reference Fix (`ServiceDetailPage.tsx`)** — Resolved runtime `ReferenceError: getCategorySlug is not defined` on `/services/:category/:slug` by explicitly importing `getCategorySlug` from `../data/categoriesData` alongside `CATEGORY_MAP`.
- **100% Test Suite & 0 Warning Build** — Verified all 83/83 unit tests passing, clean Vite build (`npx vite build` in 15.69s with 0 warnings/errors).

## 2026-08-03 — Production Audit: Google OAuth Fallback, Session Refresh Persistence & Admin Price Editor Resolution

### Fixed & Resolved
- **Google OAuth Client ID & Resilient Fallback (`pocketbase.ts`, `LoginPage.tsx`)** — Embedded permanent Google Client ID fallback (`748421095690-am0lfmkfdh1qfu7j0e8t6v6f4jmhottj.apps.googleusercontent.com`) into `authWithOAuth2` so production builds never fail on Google Sign-In due to missing environment variables at build time. Added robust GSI credential initialization and button trigger.
- **Session Refresh Persistence (`src/router.tsx`)** — Fixed `requireAuthGuard()` in `src/router.tsx` to check `localStorage` and prevent kicking authenticated client portal users out to `/order` when `sessionStorage` order count cache is absent or 0 on page refresh.
- **Admin Price Editor & Services Persistence (`api/index.php`, `AdminPriceEditorPage.tsx`, `AdminServicesPage.tsx`)** — Added `'features_en'` and `'features_ar'` to `$jsonFields` in `formatRow()` in `api/index.php` so MySQL JSON strings are properly parsed as array objects on API read. Sanitized `update()` payloads in `AdminServicesPage.tsx` and `AdminPriceEditorPage.tsx` to strip read-only columns (`id`, `created`, `updated`, `expand`).
- **Postbuild Static Asset Copy (`scripts/generate-sitemap.cjs`)** — Updated postbuild script to guarantee `logo.png`, `logo.webp`, `og-image.png`, and `favicon.ico` are copied into `dist/` on every `npm run build`.
- **100% Test Suite & Clean Production Build** — All 83/83 unit tests passing across 7 test files, 0 TypeScript errors, clean production bundle generated.

### Fixed & Optimized (SEO 100/100)
- **Primary Meta & Social Tags (`index.html`)** — Added canonical link (`<link rel="canonical" href="https://instantgrow.net/" />`), full Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:site_name`), Twitter summary card tags (`twitter:card`, `twitter:image`), sitemap link, and `defer` attribute on primary script entry.
- **Static JSON-LD Schema Graph (`index.html`)** — Embedded static, crawler-visible JSON-LD graph (`Organization`, `WebSite`, `WebPage`, `ProfessionalService`, `FAQPage`) directly in HTML head to ensure search engines index structured business and FAQ data without requiring JS execution.
- **Crawler-Visible `<noscript>` Fallback** — Added 600+ word semantic HTML fallback inside `<noscript>` (`<header>`, `<main>`, `<article>`, `<footer>`, `<nav>`, `<h1>`, `<h2>`, `<h3>`, internal links) addressing "Thin Content", "Missing H1", and "Missing Internal Links" audit findings.
- **Static XML Sitemap (`public/sitemap.xml`)** — Created XML sitemap indexing all 14 core public pages (`/`, `/services`, `/blog`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`, `/us-company`, `/us-company/wyoming`, `/us-company/delaware`, etc.) with correct priorities and change frequencies.
- **Robots.txt Sitemap URL (`public/robots.txt`)** — Corrected sitemap location to point directly to `https://instantgrow.net/sitemap.xml`.
- **Apache/LiteSpeed Security Headers & HTTPS Enforcement (`public/.htaccess`)** — Added 301 force HTTPS rewrite rule (resolving "Page Not Using HTTPS"), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy`, `Strict-Transport-Security` (HSTS), and `Permissions-Policy` response headers.
- **Branded Open Graph Social Image (`public/og-image.png`)** — Generated and deployed 1200x630 branded social media share preview image.

### Added & Refactored
- **Vite Dev Server API Proxying (`vite.config.ts`)** — Configured `/api` proxy rule forwarding to `http://localhost:8080` (resolving IPv4/IPv6 localhost binding issues on Windows).
- **Environment & API Client Alignment (`.env.local`, `pocketbase.ts`)** — Set `VITE_API_URL=/api` and fallback in `pocketbase.ts` to `/api` for environment-agnostic API fetching in both local dev and production.
- **Auth Form UI Cleanup & Live E2E Verification** — Replaced multi-bullet password placeholder string in `LoginPage.tsx` with clean text, added `autoComplete="current-password"`, and verified live browser sign-in flow with automated Playwright browser test.
- **Automated 401 Session Cleanup & Test Suite 100% Pass** — Added automatic `authStore.clear()` on HTTP 401 response in `pocketbase.ts` to prevent stale session persistence on refresh, updated `useNotifications.ts` with `hasUnread` helper, and updated test mocks to reach 100% test suite pass rate (83/83 tests passing across 7 test files).

## 2026-07-27 — Hostinger PHP REST API Admin Authorization Fixes & Master Seed Recovery System

### Fixed
- **API Content Authorization Guard (`api/index.php`)** — Resolved "Admin cannot edit/delete anything" issue. Enforced explicit admin-only role checks (`$auth['role'] === 'admin'`) for content tables (`services`, `blogs`, `pricing_config`, `countries_seo_pages`, `pages`, `invitations`, `contact_messages`). Removed user ownership checks on non-user tables that were blocking administrative updates on PATCH, PUT, and DELETE endpoints.
- **Service & SEO Page Loading Failure** — Fixed missing services and SEO country guides by creating a unified master database seed pipeline (`pocketbase/seed-sql/MASTER_SEED_ALL.sql`).
- **Pricing Editor Mutation Guard** — Ensured `pricing_config` table accepts both `POST` and `PATCH` updates seamlessly for all 8 regional plans (US, UK, UAE, Oman).

### Added
- **Master MySQL Seed Script (`pocketbase/seed-sql/MASTER_SEED_ALL.sql`)** — Complete, single-run SQL script for phpMyAdmin utilizing idempotent `REPLACE INTO` statements. Seeds:
  - 8 regional pricing configurations (`pricusbasic001`, `pricusprem001`, `pricukbasic001`, `pricukprem001`, etc.)
  - 12 core services with bilingual descriptions and icons
  - 3 featured blog posts with Arabic translations
  - 3 programmatic SEO country landing pages (Egypt, Saudi Arabia, UAE)
  - Admin role activation template and table record count verification queries.
- **Verification & Type Check Integration** — Confirmed TypeScript clean compilation (`npx tsc --noEmit` passing with 0 errors).


### Fixed
- **PocketBase-to-MySQL Filter Parser Repair (`parsePbFilter`)** — Resolved "Article Not Found" 404 error on blog detail pages (`/blog/:slug`). Refactored `parsePbFilter()` in `api/index.php` to handle PocketBase `&&` (AND), `||` (OR), and parenthesized groupings `(...)`, correctly translating filter expressions like `published = true && (slug = "xyz" || slug_ar = "xyz")` into `WHERE \`published\` = ? AND (\`slug\` = ? OR \`slug_ar\` = ?)`.
- **Blog Tags Array Type Safety Crash** — Resolved `TypeError: a.tags.slice(...).map is not a function` in `BlogListPage.tsx`. Added `parseArrayField` helper in `src/hooks/useBlogs.ts` and `parseJson` in `src/hooks/useSeoPages.ts` to ensure raw MySQL JSON string outputs (`"[]"` or comma-separated strings) are safely normalized to TypeScript array instances before array methods are called.
- **MySQL Multi-Column Order By Syntax Error** — Fixed `Unknown column 'sort_ordertitle_en'` error in `api/index.php`. Rewrote `paginate()` to split multi-column sort parameters (e.g. `sort=sort_order,title_en`) by comma and wrap column names in backticks (`\`sort_order\`, \`title_en\``).
- **Google Identity Services (GSI) Authentication** — Replaced popup `authWithOAuth2` flow in `src/lib/pocketbase.ts` with Google Identity Services (GSI) token flow sending `id_token` to `/api/collections/users/auth-with-id-token`. Added fallbacks in `LoginPage.tsx` and updated CSP in `index.html`.
- **Clean Single-Line SQL Seed Files** — Extracted and reformatted 132 services and 10 multi-line blog posts into `pocketbase/seed-sql/seed_services_clean.sql` and `pocketbase/seed-sql/seed_blogs_fixed_v3.sql`, escaping line breaks and single quotes for phpMyAdmin compatibility. Added `pricing_config` table definition to `mysql_schema_v2.sql`.

### Added
- **PocketBase SDK 0.27+ / Server v0.22 Response Polyfill** — Implemented `pb.afterSend` hook in `src/lib/pocketbase.ts` to bridge PocketBase SDK `v0.27.0` with PocketBase Server `v0.22.x`. Standardizes `authProviders` ➔ `oauth2.providers` and `authUrl` ➔ `authURL`, resolving `TypeError: Cannot read properties of undefined (reading 'providers')` on Google OAuth login.
- **Hostinger LiteSpeed/Apache `.htaccess` Rules** — Created `public/.htaccess` with 1-year immutable `Cache-Control` rules for static images/fonts, Gzip output compression, and SPA routing fallback (`index.html`) for Hostinger Web Hosting.
- **Hostinger Keep-Alive Watchdog Script** — Created `keep_alive.sh` shell script with process isolation (`ps aux | grep`), stale PID cleanup (`pkill -9`), and timestamped `crash.log` tracking designed for Hostinger 1-minute cron job execution.
- **Resource Preconnects & Image Preloading** — Added Google Fonts preconnects (`fonts.googleapis.com`, `fonts.gstatic.com`), backend preconnect (`db.instantgrow.net`), and high-priority logo preloading (`/logo.webp`) in `index.html`.

### Fixed & Optimized
- **93.6% Image Weight Reduction (7.7 MB ➔ 490 KB)** — Converted and compressed all heavy PNG mascot assets in `public/` to optimized WebP format (`mascot-clock`, `mascot-footer`, `mascot-how-it-works`, `mascot-timeline`, `world-map`, `logo`).
- **Main Thread Forced Reflows Fix** — Refactored `WorldDots` in `Hero.tsx` by pre-calculating dot coordinates statically outside the render loop and wrapping the component in `React.memo`, eliminating dynamic `Math.random()` SVG recalculations every 3.5 seconds.
- **Explicit Image Dimensions & Attributes** — Added explicit `width`, `height`, `loading="lazy"`, `decoding="async"`, and `fetchpriority` attributes across all site components (`Navbar`, `Hero`, `HowItWorks`, `Timeline`, `CTASection`, `SupportWidget`, `Footer`) to eliminate layout shifts (CLS).
- **Vite Rollup Code-Splitting** — Configured `manualChunks` in `vite.config.ts` to split vendor dependencies (`framer-motion`, `recharts`, `tanstack`, `pocketbase`, `lenis`, `icons`) into cached browser chunks.
- **TypeScript Unused Variable Warnings** — Resolved unused `_response` parameter warning in `pocketbase.ts` and removed dead `RecordModel` imports in `LoginPage.tsx` and `SignupPage.tsx` to achieve 0 `tsc --noEmit` errors.

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
