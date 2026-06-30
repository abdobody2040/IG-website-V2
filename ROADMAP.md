# Instant Grow Production Roadmap

This roadmap lists the remaining work needed to turn the current application into a production-ready system.

## Current Status

- Frontend runs locally with Vite at `http://127.0.0.1:3000/`.
- Main product surfaces already exist: landing page, auth pages, order wizard, client portal, admin panel, documents, payments, settings, and bilingual EN/AR UI.
- `npm audit` currently reports `0 vulnerabilities`.
- Production integrations are not fully connected yet because local environment values are placeholders.

## Phase 1: Supabase Foundation

Priority: Critical

Goal: Make authentication, profiles, orders, companies, documents, payments, and admin data work against a real database.

Tasks:

- Create a production Supabase project.
- Run `supabase/schema.sql` in the Supabase SQL Editor.
- Run `supabase/migrations/20260424_add_order_customer_columns.sql`.
- Run `supabase/migrations/20260503_add_update_last_sign_in_rpc.sql`.
- Create a real `.env.local` or deployment environment with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Create the first admin account safely.
- Verify Row Level Security policies with both client and admin users.
- Create a `documents` Supabase Storage bucket if Cloudflare R2 is not used.

Done when:

- Client signup/login works.
- Admin login works.
- Client dashboard loads only that client's data.
- Admin dashboard loads all operational data.
- No protected route is accessible to the wrong user role.

## Phase 2: Serverless Functions

Priority: Critical

Goal: Deploy all backend functions and remove any non-production SDK usage.

Tasks:

- Completed: removed the remaining `@blinkdotnew/sdk` import from `functions/create-checkout/index.ts`.
- Use Supabase-compatible server-side code where database access is needed.
- Deploy:
  - `functions/create-checkout/index.ts`
  - `functions/stripe-webhook/index.ts`
  - `functions/submit-contact/index.ts`
  - `functions/delete-user/index.ts`
- Configure server-side secrets:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `ALLOWED_ORIGIN`
  - `RESEND_API_KEY`, if email is enabled
- Set client-side function URLs:
  - `VITE_CHECKOUT_ENDPOINT`
  - `VITE_CONTACT_ENDPOINT`
  - `VITE_DELETE_USER_ENDPOINT`

Done when:

- Checkout function creates valid Stripe Checkout sessions.
- Stripe webhook verifies signatures and writes orders/payments correctly.
- Contact form submits successfully.
- Admin delete-user action removes both profile and auth user.
- Functions reject invalid origins and invalid requests.

## Phase 3: Payments

Priority: Critical

Goal: Complete the full paid order lifecycle.

Tasks:

- Configure Stripe products/prices or dynamic Checkout line items.
- Configure webhook endpoint for `checkout.session.completed`.
- Test formation package payments.
- Test add-on service payments.
- Confirm duplicate webhook events do not create duplicate orders.
- Confirm failed/cancelled payment UX.
- Confirm payment records appear in admin and client portals.
- Decide refund workflow and admin notes policy.

Done when:

- A real payment creates the correct order, payment record, and company record.
- Client can see payment history.
- Admin can see revenue and payment status.
- Webhook idempotency works.

## Phase 4: Documents And Storage

Priority: High

Goal: Make legal document upload, storage, and client delivery production-safe.

Tasks:

- Choose final storage provider:
  - Supabase Storage for simplicity.
  - Cloudflare R2 for production file hosting.
- If using R2, deploy an upload proxy Worker and set `VITE_R2_UPLOAD_ENDPOINT`.
- Enforce file size and MIME type limits.
- Confirm document uploads from admin pages.
- Confirm clients can view/download only their own documents.
- Decide whether document URLs should be public, signed, or proxied.
- Add operational naming rules for uploaded documents.

Done when:

- Admin can upload documents to a client/company/order.
- Client sees the uploaded document in the portal.
- Unauthorized users cannot access another client's documents.

## Phase 4B: Renewals And Compliance Tracking

Priority: High

Goal: Track the dates that matter after company formation, so clients can see upcoming renewals and admins can manage compliance work.

Completed:

- Added company-level renewal and compliance fields:
  - `renewal_due_date`
  - `annual_report_due_date`
  - `tax_filing_due_date`
  - `registered_agent_renewal_date`
  - `compliance_status`
  - `compliance_notes`
- Added Supabase migration `20260522_add_company_compliance_dates.sql`.
- Added client dashboard "Next Renewal" snapshot.
- Added client company "Renewals & Compliance" card.
- Added admin company edit controls for renewal dates and compliance status.

Remaining:

- Run the new migration on the live Supabase database.
- Add automated reminders before due dates.
- Add admin filters for due soon and overdue companies.
- Add notification emails for renewal reminders.

## Phase 5: Email And Notifications

Priority: High

Goal: Send transactional emails reliably.

Tasks:

- Create a Resend account and verify sending domain.
- Build or deploy the email endpoint expected by `VITE_EMAIL_ENDPOINT`.
- Connect templates from `src/hooks/useEmailNotifications.ts`.
- Send emails for:
  - Welcome email
  - Order confirmation
  - New order admin alert
  - Payment confirmation
  - Payment failure
  - Order status update
  - Document ready
  - Contact form submission
- Respect notification preferences.
- Add logging for failed sends.

Done when:

- Emails send in production from a verified domain.
- Admin and client notifications match preference settings.
- Failed email attempts do not break core user flows.

## Phase 6: Auth And Account Completion

Priority: High

Goal: Complete expected account-management flows.

Tasks:

- Add password reset request page.
- Add password update page after reset link.
- Configure Google OAuth for production redirect URLs.
- Sync email verification status from Supabase Auth into profiles.
- Sync or expose last sign-in data through a secure server-side function.
- Review `/setup` behavior and remove or restrict demo account creation before launch.
- Add account deletion or support-request flow if required by policy.

Done when:

- Users can reset passwords without admin help.
- Admin can see accurate email verification and last sign-in status.
- Demo credentials cannot be used in production.

## Phase 7: Product Workflow QA

Priority: High

Goal: Validate all important business workflows end to end.

Tasks:

- Test landing page CTAs.
- Test Arabic and English across all main pages.
- Test mobile layout for landing, order wizard, client portal, and admin portal.
- Test full order wizard for:
  - US LLC Basic
  - US LLC Premium
  - UK LTD Basic
  - UK LTD Premium
  - Add-ons
- Test admin order status updates.
- Test client order timeline.
- Test company records.
- Test payment filters and analytics.
- Test document filters and upload errors.
- Test contact form with and without Turnstile.

Done when:

- All primary flows work without console errors.
- Users can complete an order without manual intervention.
- Admin can manage the resulting order through completion.

## Phase 8: Security Hardening

Priority: High

Goal: Reduce production risk before launch.

Tasks:

- Re-run `npm audit`.
- Review RLS policies manually.
- Confirm service role key is never exposed to frontend.
- Set strict `ALLOWED_ORIGIN` on functions.
- Enable Turnstile on contact form if spam is a concern.
- Confirm security headers in `public/_headers`.
- Confirm HTTPS-only deployment.
- Remove debug logs that expose user data.
- Review file upload access rules.
- Review admin-only operations.

Done when:

- `npm audit` reports `0 vulnerabilities`.
- No secrets are committed.
- Admin-only operations cannot be called by clients.
- Function CORS and webhook signature checks are enforced.

## Phase 9: Performance And Polish

Priority: Medium

Goal: Improve production user experience after core functionality is stable.

Tasks:

- Address the current production build warning about large JavaScript chunks.
- Add route-level code splitting.
- Lazy-load heavy admin/client pages.
- Lazy-load 3D or chart libraries where possible.
- Review loading states and empty states.
- Improve error messages for missing backend configuration.
- Review copy, pricing, testimonials, and legal disclaimers.
- Add SEO metadata and social share previews.

Done when:

- Initial page load is acceptably fast.
- Heavy dashboard code does not load on the landing page.
- UX feels polished on desktop and mobile.

## Phase 10: Production Launch

Priority: Critical

Goal: Deploy the finished system on a real domain.

Tasks:

- Choose hosting provider:
  - Cloudflare Pages
  - Vercel
  - Netlify
- Configure build command: `npm run build`.
- Configure output directory: `dist`.
- Add all production environment variables.
- Connect production domain.
- Configure Supabase auth redirect URLs.
- Configure Stripe webhook production URL.
- Run a full live-mode smoke test.
- Create backup and monitoring routine.
- Document admin operating procedures.

Done when:

- Real users can visit the production domain.
- Signup, payment, dashboard, admin, documents, and emails work in production.
- Admin has a clear process for handling orders from purchase to completion.

## Recommended Next Sprint

1. Connect a real Supabase project.
2. Deploy checkout and webhook functions.
3. Complete one successful Stripe test payment.
4. Verify the resulting order appears in both client and admin portals.
