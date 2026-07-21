# Instant Grow — Bug Tracker

## Known Bugs

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



