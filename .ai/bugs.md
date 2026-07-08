# Instant Grow — Bug Tracker

## Known Bugs

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
