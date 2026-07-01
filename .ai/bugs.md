# Instant Grow — Bug Tracker

## Known Bugs

### B-001: emailVerified Always Shows 0 (0)
**Severity:** Medium
**Status:** Open
**Filed:** 2026-05-22
**Description:** The `email_verified` field in profiles always shows `false` because `auth.users.email_confirmed_at` is not synced to the profiles table. Supabase anon key cannot query `auth.users`.
**Impact:** Admin sees all users as unverified. Cannot distinguish verified from unverified users.
**Possible Fix:**
1. Edge Function that syncs `auth.users.email_confirmed_at` → `profiles.email_verified`
2. Trigger on `auth.users` that updates profiles on email confirmation
**Workaround:** Manual check in Supabase dashboard (auth.users table)

---

### B-002: lastSignIn Shows Placeholder (0)
**Severity:** Medium
**Status:** Open
**Filed:** 2026-05-22
**Description:** The `last_sign_in` field in profiles shows `"—"` or placeholder. The RPC `update_last_sign_in` exists but the trigger function on `profiles` has not been updated to respect the `app.bypass_profile_trigger` flag.
**Impact:** Admin cannot see when users last logged in.
**Possible Fix:**
1. Update the profiles trigger function to check the GUC flag
2. Or use a server-side function to capture sign-in events
**Reference:** `supabase/migrations/20260503_add_update_last_sign_in_rpc.sql` has instructions

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
**Status:** Open
**Filed:** 2026-05-22
**Description:** Admin hooks use `.limit(100)` or `.limit(500)` without pagination. As data grows, queries will slow down and timeout.
**Impact:** Performance degradation with >500 rows.
**Possible Fix:** Implement cursor-based or offset-based pagination with TanStack Query.

---

### B-006: SetupPage Contains Demo Credentials (0)
**Severity:** Medium
**Status:** Open (partially mitigated)
**Filed:** 2026-05-22
**Description:** `SetupPage.tsx` creates demo accounts with hardcoded credentials (`admin@instantgrow.net` / `Admin@2025!`). Currently guarded by `import.meta.env.PROD` check, but still exists in codebase.
**Impact:** If the PROD guard is accidentally removed, demo accounts could be created.
**Possible Fix:** Remove SetupPage entirely before production launch.

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
**Status:** Open
**Filed:** 2026-05-22
**Description:** File size and MIME type validation are only enforced in `useDocumentUpload.ts`. There is no server-side validation (neither in R2 Worker nor in Supabase Storage).
**Impact:** Determined users could bypass client checks and upload invalid files.
**Possible Fix:** Add server-side validation in the upload endpoint or storage rules.

---

### B-009: ContactMessage Has No user_id Sync (0)
**Severity:** Low
**Status:** Open
**Filed:** 2026-05-22
**Description:** When a logged-in user submits the contact form, `user_id` is not automatically populated (inserted via Edge Function without checking for authenticated session).
**Impact:** Contact messages from logged-in users are not linked to their profile.
**Possible Fix:** Edge Function should check auth token and set user_id if available.

---

### B-010: Admin Page Editor Validation Bypass (0)
**Severity:** Medium
**Status:** Fixed
**Filed:** 2026-07-01 | **Closed:** 2026-07-01
**Description:** The `<button>` for saving in `AdminPageEditorPage.tsx` used a raw `onClick={handleSave}` which called `e.preventDefault()`, entirely bypassing native HTML5 `required` field checks. When users omitted required fields like Arabic titles, PocketBase responded with a generic 400 validation error, producing unhelpful UI toast errors.
**Resolution:** Changed the save button to `type="submit"` linked to `form="page-editor-form"` and removed the raw `onClick` handler. HTML5 validation now runs client-side. Added manual slug uniqueness check on update.
