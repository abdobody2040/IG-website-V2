# Instant Grow — Task Tracker

## Roadmap

### Phase 1: Foundation (Critical)
- [x] Create Supabase project
- [x] Run schema.sql (all tables, RLS, triggers)
- [x] Run customer columns migration
- [x] Run last_sign_in RPC migration
- [x] Run compliance dates migration
- [x] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

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
- [x] Supabase Storage fallback
- [x] Admin document management UI
- [x] Client document viewing

### Phase 4B: Compliance Tracking (High)
- [x] Add compliance fields to companies table
- [x] Migration: 20260522_add_company_compliance_dates.sql
- [x] Client dashboard "Next Renewal" snapshot
- [x] Client company "Renewals & Compliance" card
- [x] Admin company edit controls for compliance
- [x] useComplianceReminders hook (upcoming/overdue checks)
- [ ] Automated email reminders before due dates
- [ ] Admin filters for due-soon/overdue companies

### Phase 5: Email & Notifications (High)
- [x] Email notification hooks (useEmailNotifications.ts)
- [x] Email template builder
- [x] Order confirmation emails (client + admin)
- [x] Status update emails
- [x] Document ready emails
- [x] Contact form notification emails
- [x] In-app notification system (NotificationCenter, useNotifications, ClientNotificationsPage)
- [x] Real-time order subscriptions (useOrderRealtime)
- [ ] Deploy Resend email endpoint
- [ ] Configure notification preference toggles

### Phase 6: Auth & Account Completion (High)
- [x] Email/password login
- [x] Google OAuth
- [x] Password strength validation
- [x] Role-based routing (client/admin)
- [x] Auth guards (useRequireAuth, useRequireAdmin)
- [ ] Password reset flow
- [ ] Email verification sync
- [ ] Last sign-in sync (RPC created, trigger not updated)

### Phase 7: Product Workflow QA (High)
- [ ] Test landing page CTAs
- [ ] Test Arabic and English across all pages
- [ ] Test mobile layout
- [ ] Test full order wizard (US LLC Basic, Premium, UK LTD)
- [ ] Test add-on services
- [ ] Test admin order status updates
- [ ] Test payment filters and analytics
- [ ] Test document upload errors

### Phase 8: Security Hardening (High)
- [x] Full security audit (14 findings fixed)
- [x] CSP headers
- [x] File upload validation
- [x] CORS origin validation
- [x] Stripe webhook signature verification
- [x] Auth tokens on external API calls
- [x] Password strength policy
- [x] Login error sanitization
- [ ] Enable HTTPS-only deployment
- [ ] Review RLS policies manually
- [ ] Remove SetupPage before production

- [x] SEO metadata via DOM injection (setPageMeta, injectJsonLd, injectBreadcrumb)

### Phase 10: Content & Marketing (Medium)
- [x] Blog section (public + admin CRUD)
- [x] Programmatic SEO country pages (admin CRUD + dynamic public pages)
- [x] Cal.com booking integration (navbar + CTA)
- [x] Sitemap XML (dev route + build-time generation)
- [ ] Social media sharing images for blog posts
- [ ] Schema markup for landing page

### Phase 11: Production Launch (Critical)
- [ ] Choose hosting provider
- [ ] Configure build command and output
- [ ] Add production environment variables
- [ ] Configure Supabase auth redirect URLs
- [ ] Configure Stripe webhook production URL
- [ ] Run full live smoke test
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
- [ ] Convert manual mapper functions to typed Supabase queries
- [ ] Add error boundaries around all page components
- [ ] Standardize API error handling across all hooks
- [ ] Remove `SetupPage` or restrict further
- [ ] Fix `last_sign_in` trigger to respect bypass flag
- [ ] Add proper loading skeletons for all pages

### Optimization
- [x] Route-level code splitting with lazyImport (25+ routes)
- [x] Lazy load Recharts on analytics pages
- [x] Lazy load React Three Fiber on hero (via OrderWizard lazy loading)
- [x] Bundle optimization (manualChunks for recharts, date-fns, react-hook-form, framer-motion, supabase)
- [ ] Add pagination to admin data queries (currently limit 100/500)
- [ ] Add Supabase connection pooling for production
- [ ] Implement caching layer for frequently accessed data

### Feature Requests
- [x] In-app notifications (NotificationCenter, real-time subscriptions)
- [x] CSV/Excel export (useExportCsv on admin pages)
- [x] Admin audit log (audit_logs table, useAdminAuditLog hook)
- [ ] Automated compliance email reminders
- [ ] Bulk document upload
- [ ] API tokens for external integrations
- [ ] Webhook for order status changes
- [ ] Multi-tenant support

### Bugs
See `bugs.md` for detailed bug tracking.

## Current Sprint

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
