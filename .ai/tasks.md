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
- [x] Review RLS policies manually (confirmed secure, all collections owner-locked or admin-restricted)
- [x] Remove SetupPage before production (confirmed deleted, B-006 closed)

- [x] SEO metadata via DOM injection (setPageMeta, injectJsonLd, injectBreadcrumb)

### Phase 10: Content & Marketing (Medium)
- [x] Blog section (public + admin CRUD)
- [x] Programmatic SEO country pages (admin CRUD + dynamic public pages)
- [x] Cal.com booking integration (navbar + CTA)
- [x] Sitemap XML (dev route + build-time generation)
- [ ] Social media sharing images for blog posts
- [x] Schema markup for landing page (FAQPage and ItemList schemas injected)

### Phase 11: Production Launch (Critical)
- [ ] Choose hosting provider
- [ ] Configure build command and output
- [ ] Add production environment variables
- [ ] Configure PocketBase auth redirect URLs
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


