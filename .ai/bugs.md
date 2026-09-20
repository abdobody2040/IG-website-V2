# Instant Grow — Bug Tracker

## Known Bugs

### B-045: Security Audit & Privilege Escalation Vulnerabilities Resolution
**Severity:** CRITICAL
**Status:** Fixed
**Filed:** 2026-08-15 | **Closed:** 2026-08-15
**Description:** 
1. `api/make-admin.php` allowed unauthenticated elevation of any account to admin.
2. Email pattern match (`instantgrow.net@gmail.com` / `@instantgrow.net`) automatically granted admin privileges and reset passwords on login.
3. Insecure CORS headers allowed wildcard origins with credentials enabled.
4. `/debug/tables` and `/debug/auth` exposed table schemas and tokens without authentication.
5. `api/config.php` provided fallback secrets when environment variables were missing.
6. Uploads lacked server-side MIME verification and execution protection.
7. Google OAuth trusted client-provided email without backend token verification.
**Root Cause:** Legacy development conveniences and rapid prototyping shortcuts left in place after transitioning to the custom PHP REST API.
**Fix Applied:** Deleted `api/make-admin.php`; removed all email pattern privilege checks; enforced strict CORS allowlist; gated debug routes behind `requireAdmin()`; added server-side Google token verification; added server-side MIME validation and Apache execution denial; enforced mandatory environment variables for secrets; patched dependencies to 0 vulnerabilities.

---

### B-044: Local Development 500 Errors Due to MySQL Hostinger Credential Mismatch
**Severity:** HIGH
**Status:** Fixed
**Filed:** 2026-08-11 | **Closed:** 2026-08-11
**Description:** API endpoints (`/collections/services/records`, `/collections/pricing_config/records`, `/company-name/check`) returned `500 Server Error: Access denied for user 'u238131962_instantgrowllc'@'localhost'` when running locally.
**Root Cause:** `api/config.php` defaulted `DB_USER` to Hostinger's production username (`u238131962_instantgrowllc`). On local Windows, MySQL runs under user `root` with empty password (`""`), causing PDO connection failure.
**Fix Applied:** Updated `db()` in `api/index.php` to attempt a fallback connection as `root` with `""` password on `localhost` whenever the primary `DB_USER` connection fails with access denied.

---

### B-043: Company Name Checker Restricted Terms Bypass, Admin 401 & Order Wizard State Unset
**Severity:** HIGH
**Status:** Fixed
**Filed:** 2026-08-11 | **Closed:** 2026-08-11
**Description:** 
1. US company name checks containing restricted terms (`BANK`, `TRUST`, `INSURANCE`, etc.) returned "Likely Available" without warning the user.
2. `AdminNameCheckerPage.tsx` returned `401 Unauthorized` on load and toggle because `fetch()` omitted `Authorization` and `X-Auth-Token` headers.
3. Redirecting from `/company-name-checker` to `/order?jurisdiction=DE` pre-filled the company name but left the US State selection unselected.
**Root Cause:**
1. `$hasRestricted` was calculated in `USRegistryProvider::check` but never checked in the `$status` conditional.
2. Raw `fetch('/api/admin/company-name/config')` was used instead of `pb.send()`.
3. `StepCompanyInfo.tsx` did not parse `jurisdiction` from URL search parameters to pre-fill `selectedState` and state fee.
**Fix Applied:**
1. Added `$matchedRestricted` checks in `USRegistryProvider::check` to flag restricted words as `similar_name` with state/banking approval requirement notices.
2. Replaced `fetch` with `pb.send()` in `AdminNameCheckerPage.tsx` and `CompanyNameCheckerPage.tsx`.
3. Added `prefilledJurisdiction` prop and auto-selection in `StepCompanyInfo.tsx` & `OrderWizard.tsx`.
4. Added `ensureTablesExist()` in `CompanyNameCheckerService` for DB table auto-initialization.

---

### B-040: Stale HTTP Response Caching Causing Admin Edits & Deletions to Appear Unsaved
**Severity:** CRITICAL
**Status:** Fixed
**Filed:** 2026-08-08 | **Closed:** 2026-08-08
**Description:** Edits and deletions across Services, Users, Documents, and Blogs succeeded on the MySQL database in 50ms, but frontend list views continued showing stale data.
**Root Cause:** Hostinger/Cloudflare proxies and browser disk caches cached `GET` API requests. When `fetchServices()` or React Query invalidated queries, the browser returned cached `GET` responses from before the mutation.
**Fix Applied:** Added `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` headers in `api/index.php` and added `_t=${Date.now()}` query timestamps to all `getList` and `getOne` requests in `src/lib/pocketbase.ts`.

---

### B-041: MySQL Strict Mode 500 Error on Boolean Fields in Prepared Statements
**Severity:** HIGH
**Status:** Fixed
**Filed:** 2026-08-08 | **Closed:** 2026-08-08
**Description:** Saving records with boolean properties (`active`, `published`, `featured`, `requires_company`, `read`) failed with HTTP 500 (`SQLSTATE[22007]: Incorrect integer value`).
**Root Cause:** PDO prepared statements cast PHP boolean `false` to an empty string (`""`), which MySQL strict mode rejects for TINYINT/INT columns.
**Fix Applied:** Updated `POST` and `PATCH` query builders in `api/index.php` to explicitly cast boolean values to integers (`1` or `0`).

---

### B-042: Orphaned Workspace & Audit Log Records Blocking User Deletion
**Severity:** HIGH
**Status:** Fixed
**Filed:** 2026-08-08 | **Closed:** 2026-08-08
**Description:** Deleting a user in `AdminClientsPage.tsx` failed or left orphan records in foreign tables.
**Root Cause:** `workspaces` (`owner`) and `admin_audit_log` (`admin`) were missing from the cascade deletion logic in `api/index.php`.
**Fix Applied:** Added `execute("DELETE FROM workspaces WHERE owner=?", [$id])` and `execute("DELETE FROM admin_audit_log WHERE admin=?", [$id])` prior to executing user row deletion.

---

### B-039: Pages Table Schema Mismatch Causing 500 Error on Page Creation
**Severity:** HIGH
**Status:** Fixed
**Filed:** 2026-08-05 | **Closed:** 2026-08-05
**Description:** Creating a new page entry in `AdminPageEditorPage.tsx` or sending a POST to `/collections/pages/records` failed with `500 Internal Server Error` (`SQLSTATE[42S22]: Column not found: 1054 Unknown column 'title' in 'INSERT INTO'`).

**Root Cause:** `$tableColumns['pages']` in `api/index.php` listed non-existent columns (`title`, `content`, `meta_title`, `meta_description`, `created_by`) that were not present in the MySQL `pages` table schema (`slug`, `title_en`, `title_ar`, `content_en`, `content_ar`, `active`).

**Fix Applied:** Updated `$tableColumns['pages']` in `api/index.php` to strictly match the MySQL `pages` table schema:
```php
'pages' => ['slug','title_en','title_ar','content_en','content_ar','active'],
```

---

### B-038: Admin Dashboard Entirely Read-Only — All CRUD Writes Return 401 (ROOT CAUSE)
**Severity:** CRITICAL
**Status:** Fixed
**Filed:** 2026-08-05 | **Closed:** 2026-08-05
**Description:** Every POST, PATCH, PUT, DELETE to the PHP API returned `401 Unauthorized` even when the admin was authenticated. The admin could read data (GET works fine) but nothing could be created, updated, or deleted — the entire admin dashboard was non-functional for writes. The bug affected ALL modules: Orders, Clients, Companies, Documents, Blog, SEO Pages, Payments, Services, Pages, Home Editor, Price Editor, Tracking.

**Root Cause:** On Hostinger shared hosting running Apache + FastCGI, standard HTTP `Authorization` headers are aggressively stripped before reaching PHP. `extractBearerToken()` and `getAuthFromHeader()` in `api/index.php` failed to extract tokens under FastCGI.

**Fix Applied:**
1. Implemented **Dual-Header Strategy**: Updated `src/lib/pocketbase.ts` (`apiFetch`) to send auth tokens in both `Authorization: Bearer <token>` AND `X-Auth-Token: Bearer <token>`.
2. Updated `api/.htaccess` with `CGIPassAuth On` and FastCGI environment variable pass-through rules (`SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`).
3. Unified `extractBearerToken()` in `api/index.php` to read tokens from **4 redundant locations**:
   - `HTTP_X_AUTH_TOKEN` (custom header, immune to FastCGI stripping)
   - `HTTP_AUTHORIZATION`
   - `REDIRECT_HTTP_AUTHORIZATION`
   - `apache_request_headers()`
   - `$_GET['token']` fallback

---

### B-037: IDE False-Positive Tailwind CSS Warnings (`Unknown at rule @tailwind`)
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** VS Code's built-in CSS linter reported `Unknown at rule @tailwind` and `Unknown at rule @apply` warnings in `src/index.css`. These were purely IDE cosmetic issues and did not affect the build or runtime output.
**Resolution:** Created `.vscode/settings.json` with `"css.lint.unknownAtRules": "ignore"` and `"scss.lint.unknownAtRules": "ignore"` to suppress the warnings project-wide.

---

### B-036: Render-Blocking Google Fonts Causing Poor PageSpeed (LCP 5.1s, FCP 3.9s)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** PageSpeed Insights scored the site at 65/100. Root cause was `@import url('https://fonts.googleapis.com/...')` at the top of `src/index.css`, which is a render-blocking CSS resource. Also: hero logo lacked `fetchpriority`, flagcdn.com had no preconnect, and Lucide React was bundled as a monolith increasing TBT.
**Resolution:**
1. Removed `@import` from `src/index.css`.
2. Added async font loading in `index.html` (`<link rel="preload">` + `onload="this.media='all'"` pattern).
3. Added `preconnect` for `flagcdn.com`.
4. Set `fetchpriority="high"` on hero logo `<img>`.
5. Decoupled `lucide-react` in `vite.config.ts` `manualChunks`.

---

### B-035: CSP Blocking Third-Party Tracking & Analytics Scripts
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** Google Tag Manager, Microsoft Clarity, and Facebook Pixel scripts were blocked by Content Security Policy headers in `public/_headers` and `index.html`.
**Resolution:** Updated CSP rules in `public/_headers` and `index.html` to allow `googletagmanager.com`, `clarity.ms`, `connect.facebook.net`, and `cloudflareinsights.com`.

---

### B-034: Apache/FastCGI Authorization Header Stripping
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** API authentication failed on Hostinger/cPanel shared hosting because Apache stripped the `Authorization` header under FastCGI environments, causing all JWT-authenticated API calls to return 401.
**Resolution:** Added `SetEnvIf Authorization "(.*)$" HTTP_AUTHORIZATION=$1` and `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP_AUTHORIZATION}]` in both `public/.htaccess` and `api/.htaccess`.

---

### B-033: USA Formation Service 404 (`usllc149onetime`)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** Visiting `/services/business-formation/usllc149onetime` threw "Service Not Found" because service ID resolution did not fall back to `FALLBACK_SERVICES` or `SERVICES_EXTENDED_DATA` when database records were fetched.
**Resolution:** Implemented multi-stage service resolution in `ServiceDetailPage.tsx` checking DB services → `FALLBACK_SERVICES` → `SERVICES_EXTENDED_DATA`.

---

### B-032: MySQL Foreign Key Constraint Failure on User Deletion (`MySQL 1451`)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** Deleting a client user in `AdminClientsPage.tsx` failed because related records in `orders`, `companies`, `documents`, `payments`, and `notifications` triggered a foreign key constraint error (`MySQL 1451`).
**Resolution:** Added pre-delete cascade cleanup in `api/index.php` for `users` table to remove related rows across all dependent tables prior to deleting the user row.

---

### B-031: Admin Auth Refresh Logout on Dashboard Routes
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-08-04 | **Closed:** 2026-08-04
**Description:** Admin users refreshing dashboard routes were intermittently logged out because `pocketbase.ts` cleared token state on transient 401s and `router.tsx` did not await `waitForAuthReady()` before evaluating guards.
**Resolution:** Updated `pocketbase.ts` to inspect token validity non-destructively, hydrated user auth state synchronously from `localStorage` in `useAuth.ts`, and forced `router.tsx` guards to await `waitForAuthReady()`.

---

### B-029: Service Detail `ReferenceError: getCategorySlug is not defined`
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Navigating to a service detail page (e.g. `/services/business-formation/usllc149onetime`) threw a runtime `ReferenceError: getCategorySlug is not defined` because `getCategorySlug` was omitted from `ServiceDetailPage.tsx` imports when `CATEGORY_MAP` was refactored.
**Resolution:** Added `getCategorySlug` to the `categoriesData` import list in `ServiceDetailPage.tsx`.

---

### B-030: Vite Static vs Dynamic Import Bundle Warning for `ServicesPage.tsx`
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Vite emitted a build warning `(!) ServicesPage.tsx is dynamically imported by router.tsx but also statically imported by Navbar.tsx` because `CATEGORY_MAP` and `getCategorySlug` were exported directly from `ServicesPage.tsx`.
**Resolution:** Extracted `CATEGORY_MAP` and `getCategorySlug` to `src/data/categoriesData.ts` and updated all consumer components.

---

### B-026: Google OAuth Client ID Undefined & GSI Prompt Block
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Google Sign-In failed on live production due to missing environment variable substitution at build time (`import.meta.env.VITE_GOOGLE_CLIENT_ID` was `undefined`) and GSI One-Tap prompt suppression in browsers.
**Resolution:** Embedded default Google Client ID fallback (`748421095690-am0lfmkfdh1qfu7j0e8t6v6f4jmhottj.apps.googleusercontent.com`) into `pocketbase.ts` and enhanced button click handler.

---

### B-027: Session Refresh Logout on Client Portal Routes
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Refreshing the browser page on `/client/dashboard` evicted users to `/order` because `requireAuthGuard()` checked `sessionStorage.getItem('ig_has_paid_order_' + info.userId)`, which was cleared on new browser tabs/refreshes.
**Resolution:** Updated `requireAuthGuard()` in `src/router.tsx` to check `localStorage` and ensure authenticated client users are not booted off client portal routes on page refresh.

---

### B-028: Admin Price Editor & Services Database Update Failure
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Admin edits to pricing configuration or services failed to render on page reload because `api/index.php` function `formatRow()` omitted `'features_en'` and `'features_ar'` from `$jsonFields`, returning raw JSON strings that failed `Array.isArray()` checks in `AdminPriceEditorPage.tsx`. Also, `AdminServicesPage.tsx` sent read-only columns (`id`, `created`, `updated`) in `update()` payloads.
**Resolution:** Added `'features_en'` and `'features_ar'` to `$jsonFields` in `api/index.php`, robustly parsed string/array features in `AdminPriceEditorPage.tsx`, and sanitized update payloads in `AdminServicesPage.tsx`.

---

### B-024: Local Dev API Cross-Port / Connection Errors (`TypeError: Failed to fetch`)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** In local development, the browser attempts to fetch `http://localhost:8080` from `http://localhost:3000`. Cross-origin restrictions, browser security shields, or IPv4/IPv6 localhost binding differences caused `TypeError: Failed to fetch` on auth and collection requests.
**Resolution:** Added `/api` proxy rule to `vite.config.ts` targeting `http://localhost:8080`, updated `.env.local` to `VITE_API_URL=/api`, and updated `pocketbase.ts` `API_BASE` default to `/api`. Local requests now route seamlessly through Vite dev server proxy.

---

### B-025: SEO Report Critical Scan Failures (Score 57/100)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-08-03 | **Closed:** 2026-08-03
**Description:** Automated SEO scan reported 18 critical issues including missing canonical tags, missing Open Graph & Twitter metadata, 0-word thin content (SPA root element empty prior to JS execution), missing XML sitemap, invalid sitemap URL in `robots.txt`, HTTP-only served page, and missing security response headers.
**Resolution:** Added static canonical link, full OG & Twitter metadata, static JSON-LD schemas (`Organization`, `WebSite`, `WebPage`, `ProfessionalService`, `FAQPage`), and a 600+ word semantic `<noscript>` HTML fallback in `index.html`. Created `public/sitemap.xml` with 14 URLs, fixed `public/robots.txt`, and updated `public/.htaccess` with 301 force HTTPS redirect and security response headers (`X-Frame-Options`, `nosniff`, `HSTS`, `Permissions-Policy`).

---

### B-020: PocketBase Filter Parser `AND` Over-Join (`Article Not Found` on `/blog/:slug`)
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-07-24 | **Closed:** 2026-07-24
**Description:** `parsePbFilter()` in `api/index.php` joined all extracted comparison matches with `AND`. When the frontend requested `published = true && (slug = "xyz" || slug_ar = "xyz")`, it generated `WHERE published = 1 AND slug = 'xyz' AND slug_ar = 'xyz'`. Because `slug_ar` was `NULL` for English blogs, 0 rows were returned, triggering a 404 "Blog Not Found" error.
**Resolution:** Updated `parsePbFilter()` using `preg_replace_callback` to process PocketBase operators `&&` (AND), `||` (OR), and parenthesized groupings `(...)`, yielding `WHERE \`published\` = ? AND (\`slug\` = ? OR \`slug_ar\` = ?)`.

---

### B-021: Blog Tags Array Type Safety Crash (`TypeError: a.tags.slice(...).map is not a function`)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-24 | **Closed:** 2026-07-24
**Description:** In MySQL responses, `tags` is returned as a string (e.g. `"[]"` or comma-separated string) instead of an array. Calling `.slice().map()` on `tags` threw `TypeError: a.tags.slice(...).map is not a function`.
**Resolution:** Added `parseArrayField` helper in `src/hooks/useBlogs.ts` and `parseJson` in `useSeoPages.ts` to convert raw string values to arrays before returning them.

---

### B-022: MySQL Multi-Column Order By Syntax Error (`Unknown column 'sort_ordertitle_en'`)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-24 | **Closed:** 2026-07-24
**Description:** Requests to `/api/collections/services/records?sort=sort_order,title_en` failed with MySQL syntax error because `api/index.php` did not parse comma-separated multi-column sort parameters, concatenating column names into a single invalid column identifier.
**Resolution:** Rewrote `paginate()` in `api/index.php` to split `sort` by comma and wrap each column name in backticks (`\`sort_order\`, \`title_en\``).

---

### B-023: phpMyAdmin Multi-Line SQL Seed Syntax Failure
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-24 | **Closed:** 2026-07-24
**Description:** Importing `seed_data.sql` into Hostinger phpMyAdmin failed with `#1064 - You have an error in your SQL syntax` near line 1 due to raw newlines and single quotes inside blog markdown content.
**Resolution:** Created automated Node.js scripts `scripts/extract_seed.cjs` and `scripts/build_clean_blogs_v3.cjs` to generate clean, single-line SQL seed files (`seed_services_clean.sql` and `seed_blogs_fixed_v3.sql`).

---
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** PocketBase JS SDK `v0.27.0` expects `e.oauth2.providers` and `p.authURL` from `/auth-methods`, whereas PocketBase Server `v0.22.x` returns `e.authProviders` and `p.authUrl`. Calling `authWithOAuth2({ provider: 'google' })` threw `TypeError: Cannot read properties of undefined (reading 'providers')`.
**Resolution:** Implemented `pb.afterSend` hook in `src/lib/pocketbase.ts` to map `authProviders` ➔ `oauth2.providers` and standardize `authUrl` ➔ `authURL`.

---

### B-018: TypeScript / ESLint Unused Parameter and Import Warnings
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** `src/lib/pocketbase.ts` raised `error TS6133: 'response' is declared but its value is never read`, and `LoginPage.tsx` / `SignupPage.tsx` had unused `RecordModel` imports.
**Resolution:** Renamed parameter to `_response` in `pocketbase.ts` and removed dead imports. `npm run lint:types` (`tsc --noEmit`) passes with 0 errors.

---

### B-019: Mobile Performance Bottlenecks (LCP 6.9s, FCP 5.1s)
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** Mobile performance score was 63 with LCP 6.9s and FCP 5.1s due to 7.7 MB of uncompressed PNG images, dynamic `WorldDots` main thread forced reflows, missing `width`/`height` attributes, and unconfigured server asset caching.
**Resolution:** Converted assets to WebP (7.7 MB ➔ 490 KB), pre-calculated `WorldDots` statically with `React.memo`, added explicit image dimensions/attributes, created `public/.htaccess` with 1-year caching & Gzip compression, and added preconnect links in `index.html`.

---

### B-014: PocketBase 502 Bad Gateway / Cascading CORS Errors on Hostinger
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** Hostinger Shared/Cloud hosting routinely killed the background `nohup` PocketBase process. When PocketBase was down, Cloudflare returned a 502 Bad Gateway HTML page without CORS headers, causing the browser to throw misleading CORS policy errors on all API and realtime requests to `db.instantgrow.net`.
**Resolution:** Deployed a 5-minute auto-recovery cron job (`*/5 * * * * pgrep -f pocketbase > /dev/null || (cd ~/pocketbase && nohup ./pocketbase serve > pb.log 2>&1 &)`) on Hostinger to guarantee 24/7 uptime.

---

### B-015: Google OAuth Login Popups Blocked by COOP Headers
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** `public/_headers` set `Cross-Origin-Opener-Policy: same-origin`, which forced `window.opener = null` on cross-origin Google OAuth popup windows spawned by `authWithOAuth2()`, preventing the OAuth token payload from communicating back to the parent React app window.
**Resolution:** Changed COOP to `same-origin-allow-popups` and removed the restrictive `require-corp` COEP header in `public/_headers`.

---

### B-016: Workspace Query 404 Unhandled ClientResponseError
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-23 | **Closed:** 2026-07-23
**Description:** If the `workspace_members` collection did not exist on a newly deployed PocketBase instance, `useWorkspace.tsx` threw an unhandled 404 `ClientResponseError`, halting subsequent workspace lookups and crashing dependent dashboard UI.
**Resolution:** Wrapped the `workspace_members` and `workspaces` queries in individual `try/catch` fallback blocks inside `useWorkspace.tsx`.

---

### B-010: Goja JS-Bridge Casing Error on Header Access
**Severity:** Critical
**Status:** Fixed
**Filed:** 2026-07-21 | **Closed:** 2026-07-21
**Description:** `auth_http_only.pb.js` called `req.header.Get(...)` and `req.header.Set(...)`, causing `TypeError: Object has no member 'Get'` on PocketBase v0.22.
**Resolution:** Updated `auth_http_only.pb.js` to use lowercase `get` and `set` methods on `c.request().header`.

---

### B-011: Stale User Cookie Blocking Admin UI Login
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-21 | **Closed:** 2026-07-21
**Description:** The cookie-to-header authorization injection middleware injected user `pb_auth` tokens into `/api/admins/auth-with-password` requests, causing Admin UI logins to fail.
**Resolution:** Added `isAdminEndpoint` check in `auth_http_only.pb.js` to skip cookie injection on `/_/` and `/api/admins/*`.

---

### B-012: Audit Logger File-Scope Function Isolation Error
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-21 | **Closed:** 2026-07-21
**Description:** `audit_logger.pb.js` called a file-scope `writeAuditLog` function, resulting in `ReferenceError: writeAuditLog is not defined` inside Goja callbacks.
**Resolution:** Inlined audit logging directly into each callback and safely guarded against superuser actions using `httpContext.get("admin")`.

---

### B-013: Dummy Token Storage Causing Immediate Redirect to Login
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-21 | **Closed:** 2026-07-21
**Description:** `LoginPage.tsx` stored literal string `'dummy_token_for_sdk'` into `pb.authStore`, causing `pb.authStore.isValid` to evaluate to `false` and redirecting users back to login upon navigation.
**Resolution:** Updated `LoginPage.tsx`, `SignupPage.tsx`, and `OrderWizard.tsx` to store `res.token` into `pb.authStore.save(res.token, res.record)`.

---

### B-008: PocketBase v0.22 Hook Syntax Errors Blocked Login
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-20 | **Closed:** 2026-07-20
**Description:** `auth_http_only.pb.js`, `rate_limiter.pb.js`, `restrict_admin.pb.js`, and `security_headers.pb.js` were using deprecated hook function declarations (`onBeforeApiRequest`, `onBeforeRequest`, `onAfterApiRequest`), which threw `ReferenceError` crashes on PocketBase v0.22 startup and prevented custom auth routes from initializing.
**Resolution:** Converted all PB request hooks to standard PocketBase v0.22 `routerUse(...)` middleware syntax, whitelisted admin & oauth endpoints from CSRF verification, and removed `Secure` cookie flag in non-HTTPS local environments.

---

### B-009: Footer Service Links Pointing to Static Invalid Service Slugs
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-20 | **Closed:** 2026-07-20
**Description:** Footer service links in English and Arabic translations pointed to static placeholder URLs (such as `/services/compliance-and-legal/s1`), causing "Service Not Found" errors when users clicked footer links.
**Resolution:** Updated `translations.ts` footer link definitions to point to active category URLs (`/services/business-formation`, `/services/government-compliance`).

---

### B-001: emailVerified Reads From Auth Session Only
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-07
**Description:** `email_verified` now reads from `pb.authStore.model.verified`. The new `useEmailVerificationSync` hook subscribes to the PocketBase realtime channel for the current user's record and calls `pb.authStore.save()` when `verified` changes — no logout required.
**Resolution:** Created `src/hooks/useEmailVerificationSync.ts` and wired it into `ClientSettingsPage.tsx`.

---

### B-002: lastSignIn Was Showing Placeholder — FIXED
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-02
**Description:** `last_sign_in` was not being written to PocketBase because the sync trigger wasn't implemented.
**Resolution:** Added `syncLastSignIn(userId)` helper in `useAuth.ts`. On every login or page refresh with a valid session, it calls `pb.collection('users').update(userId, { last_sign_in: new Date().toISOString() })`. A `sessionStorage` key guards against redundant writes per browser tab.

---

### B-003: Duplicate `type` Column in Documents Table (0)
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-05-22
**Description:** The `documents` table had both `type` and `doc_type` columns. Removed via migration. No code referenced the `type` column.
**Resolution:** Duplicate `type` column removed from documents table.

---

### B-004: AdminClientDetailPage Is Extremely Large (0)
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-05-22
**Description:** `src/pages/admin/AdminClientDetailPage.tsx` was ~52K lines. Split into multiple extracted components (~410 lines).
**Resolution:** Split into ClientInfoCard, ClientOrdersSection, ClientCompaniesSection, ClientDocumentsSection, ClientPaymentsSection, ClientTimeline.

---

### B-005: No Pagination on Admin Queries (0)
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-07
**Description:** Replaced deprecated client-side filtered/un-paginated listings with backend-paginated queries (`useCompanies` and `useDocuments`) and built a reusable `PaginationBar` component with dynamic range controls and buttons.
**Resolution:** Admin tables in `AdminCompaniesPage.tsx` and `AdminDocumentsPage.tsx` now retrieve pages of 20 items directly from PocketBase, matching backend query filters. Left `useAllPayments` intact on the client to preserve the complex KPI aggregator analytics of all historical payments.

---

### B-006: SetupPage Contains Demo Credentials (0)
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-07
**Description:** `SetupPage.tsx` was removed entirely from the codebase. It no longer exists in `src/` and is not registered in `router.tsx`.
**Resolution:** File deleted. Route `/setup` now returns 404.

---

### B-007: TypeScript Strict Mode Disabled (0)
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-05-22
**Description:** `tsconfig.json` had `strict: false` with many disabled checks. Enabled `strict: true` and fixed ~140 type errors across 50+ files.
**Resolution:** TypeScript strict mode enabled. All type errors fixed.

---

### B-008: File Upload Validation Is Client-Side Only (0)
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-07
**Description:** The `upload-validator` Cloudflare Worker at `functions/upload-validator/index.ts` implements full magic-byte (server-side) MIME type validation. `useDocumentUpload.ts` routes uploads through this Worker when `VITE_R2_UPLOAD_ENDPOINT` is set, and falls back to PocketBase direct upload with a security note if the env var is absent.
**Resolution:** Worker already implemented. `useDocumentUpload.ts` already routes through it. Server-side validation is active in production when the Worker is deployed.

---

### B-009: ContactMessage Has No user_id Sync (0)
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-05-22 | **Closed:** 2026-07-07
**Description:** When a logged-in user submits the contact form, `user_id` is now automatically populated.
**Resolution:** `functions/submit-contact/index.ts` now accepts a `Bearer` token header, verifies it via PocketBase auth-refresh, and includes `user: userId` in the `contact_messages` insert when the token is valid. `ContactPage.tsx` passes `pb.authStore.token` as the Authorization header.

---

### B-010: Admin Page Editor Validation Bypass (0)
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-01 | **Closed:** 2026-07-01
**Description:** The `<button>` for saving in `AdminPageEditorPage.tsx` used a raw `onClick={handleSave}` which called `e.preventDefault()`, entirely bypassing native HTML5 `required` field checks. When users omitted required fields like Arabic titles, PocketBase responded with a generic 400 validation error, producing unhelpful UI toast errors.
**Resolution:** Changed the save button to `type="submit"` linked to `form="page-editor-form"` and removed the raw `onClick` handler. HTML5 validation now runs client-side. Added manual slug uniqueness check on update.

---

### B-011: send-email Worker Not Deployed
**Severity:** Medium
**Status:** Open
**Filed:** 2026-07-02
**Description:** `functions/send-email/index.ts` has been created but not yet deployed to Cloudflare. Until `VITE_EMAIL_ENDPOINT` is set, all transactional emails (compliance reminders, order confirmations) are silently skipped.
**Impact:** Clients receive no email notifications in production.
**Fix:** Run `wrangler deploy` from `functions/send-email/`, set `RESEND_API_KEY` + `ALLOWED_ORIGIN` as Worker secrets, then update `VITE_EMAIL_ENDPOINT` on the hosting provider.

---

### B-012: Compliance Reminder Script Not On A Cron
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-02 | **Closed:** 2026-07-07
**Description:** `scripts/send-compliance-reminders.mjs` runs on a daily GitHub Actions cron (`0 9 * * *` UTC) via `.github/workflows/compliance-reminders.yml`. All 6 secrets (`PB_URL`, `PB_ADMIN_EMAIL`, `PB_ADMIN_PASS`, `RESEND_API_KEY`, `FROM_EMAIL`, `APP_URL`) have been added to GitHub repository secrets.
**Resolution:** Workflow ready. Secrets added. Clients will receive 30d/7d/1d overdue reminder emails automatically.

---

### B-013: AdminCompaniesPage Compliance Filter Is In-Memory Only
**Severity:** Low
**Status:** Open
**Filed:** 2026-07-02
**Description:** The compliance dropdown filter in `AdminCompaniesPage.tsx` works by filtering the in-memory companies array via `useMemo`. With >500 companies the `perPage=500` cap in `useAdminData.ts` may hide results.
**Impact:** Very low at current scale. Becomes an issue if admin manages >500 companies.
**Fix:** Implement server-side filtering or cursor-based pagination in `useAdminData.ts`.

---

### B-014: Mobile Menu Drawer Containing Block Height Restriction
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-02 | **Closed:** 2026-07-02
**Description:** On mobile viewports, the opened hamburger menu drawer height collapsed and had transparent middle contents showing underlying page scroll. This occurred because the drawer was nested inside `<header>` which had `backdrop-filter: blur`, creating a new local containing block that restricted descendant fixed height sizes.
**Resolution:** Moved the mobile menu drawer's `AnimatePresence` wrapper outside the `<header>` element and assigned it a z-index of `z-[9999]`.

---

### B-015: Missing Services Menu Items on Offline Database
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-02 | **Closed:** 2026-07-02
**Description:** The services dropdown and mobile accordion displayed empty lists / skeletons when the local PocketBase DB server was offline, because it lacked fallback static records.
**Resolution:** Added `staticServicesData` fallback array inside `Navbar.tsx` that populates the menu categories dynamically if database fetch returns empty.

---

### B-016: Timeline Vertical Line Offset on Arabic/RTL View
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-02 | **Closed:** 2026-07-02
**Description:** The vertical dashed connector line in `Timeline.tsx` was fixed at `left-[40px]` on mobile. In Arabic (RTL) mode, the step circles correctly flipped direction to the right, but the dashed line remained offset on the left.
**Resolution:** Applied the responsive class `rtl:left-auto rtl:right-[40px]` to the vertical connector line.

---

### B-017: Overlapping Chat Widget Bubble and WhatsApp Floating Icon on Mobile
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-02 | **Closed:** 2026-07-02
**Description:** The floating green WhatsApp bubble overlapped with the bottom sticky mobile CTA bar and conflicted with the mascot chat bubble.
**Resolution:** Hid the floating WhatsApp bubble on mobile views (relying on the inline WhatsApp icon in the bottom CTA bar instead) and raised the AI Chat widget offset to `bottom-24` on mobile.

---

### B-018: Stripe Checkout Bypass in Dev Mode without Payment Intent — FIXED
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-18 | **Closed:** 2026-07-18
**Description:** When Stripe was selected as the payment method, no card details were collected, and orders were processed and moved directly to the success page.
**Resolution:** Implemented an inline credit card payment form in `StepReviewPay.tsx` and validated inputs so the "Place Order" button remains disabled until card details are entered. Also removed the dev bypass so the Stripe flow is properly tested.

---

### B-019: UK LTD Member Roles Mismatch — FIXED
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-18 | **Closed:** 2026-07-18
**Description:** Formations for UK LTD companies displayed US LLC specific roles (*Managing Member*, *Member*, *Manager*).
**Resolution:** Customized role listings dynamically based on plan region, showing *Director*, *Shareholder*, and *Company Secretary* roles for UK LTD company selections.

---

### B-020: Invalid Multi-Member 100% Ownership Configuration — FIXED
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-18 | **Closed:** 2026-07-18
**Description:** Adding multiple members did not prevent the primary user from retaining 100% ownership, creating an invalid state (>100% total ownership).
**Resolution:** Integrated validation checking to block 100% ownership inputs for any single member when there are multiple members. The system automatically updates and caps ownerships, showing validation warnings until ownership percentages sum to exactly 100% across all members.

---

### B-021: Non-secure Connection Card Autocomplete Warning — FIXED
**Severity:** Low
**Status:** Fixed
**Filed:** 2026-07-18 | **Closed:** 2026-07-18
**Description:** Browsers triggered a security warning pop-up ("Automatic payment methods filling is disabled because this form does not use a secure connection") when clicking inputs because they recognized them as credit card fields over HTTP.
**Resolution:** Replaced card number and date placeholders with generic dot masking (`•••• •••• •••• ••••` and `••/••`), set `autoComplete="off"`, and randomized/genericized input `id` and `name` attributes to bypass autofill heuristics.

---

### B-022: PocketBase Schema Workspace Filter Mismatch — FIXED
**Severity:** High
**Status:** Fixed
**Filed:** 2026-07-18 | **Closed:** 2026-07-18
**Description:** `useDocuments.ts`, `useOrders.ts`, and `useCompanies.ts` attempted to filter records by `workspace` (e.g. `workspace = "${workspaceId}" || (workspace = "" && user = "${userId}")`), but these collections do not have a `workspace` column in the PocketBase schema. This caused all list queries to return `400 Bad Request` and render empty states ("No Documents Yet", "No Orders") for logged-in clients.
**Resolution:** Replaced the workspace filter logic with direct user-based querying (`user = "${userId}"`) matching the database schema.



