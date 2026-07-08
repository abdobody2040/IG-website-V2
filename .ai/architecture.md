# Instant Grow — Architecture Documentation

## Frontend Architecture

### Component Tree
```
main.tsx
├── QueryClientProvider
│   ├── HotToaster
│   └── App.tsx
│       └── RouterProvider
│           └── LanguageProvider (root route wrapper)
│               ├── Landing Page Components
│               │   ├── Navbar (Services flyout + Book a Call dropdown)
│               │   ├── Hero (with 3D globe via React Three Fiber)
│               │   ├── HowItWorks
│               │   ├── Features
│               │   ├── Pricing
│               │   ├── ComparisonTable (6-column redesign with BEST VALUE highlight)
│               │   ├── Reviews
│               │   ├── FAQ (accordion)
│               │   ├── CTASection
│               │   └── Footer
│               ├── Auth Pages
│               │   ├── LoginPage (email/password + Google OAuth)
│               │   ├── SignupPage (registration + password strength, invite token)
│               │   ├── ForgotPasswordPage (request password reset via PocketBase)
│               │   ├── ResetPasswordPage (confirm password reset via PocketBase token)
│               │   └── AuthCallbackPage (OAuth handler)
│               ├── Services Routes
│               │   ├── ServicesPage (8-category SaaS grid + search bar)
│               │   ├── ServiceCategoryPage (category detail with sticky sidebar + service cards)
│               │   └── ServiceDetailPage (full service page: JSON-LD, sticky checkout, FAQ, process, requirements)
│               ├── OrderWizard (6-step multi-step form, lazy loaded)
│               │   ├── Step 1: Jurisdiction (US LLC / UK LTD)
│               │   ├── Step 2: State selection (US only)
│               │   ├── Step 3: Package (Basic/Premium)
│               │   ├── Step 4: Members/Managers
│               │   ├── Step 5: Business Details
│               │   ├── Step 6: Add-ons
│               │   └── Review & Pay (Stripe redirect)
│               ├── Shell (responsive sidebar layout, lazy loaded)
│               │   ├── Client Layout (sidebar + NotificationCenter + SupportWidget)
│               │   │   ├── ClientDashboardPage (useComplianceReminders)
│               │   │   ├── ClientOrdersPage (uses OrderCard)
│               │   │   ├── ClientCompanyPage
│               │   │   ├── ClientDocumentsPage
│               │   │   ├── ClientServicesPage (uses OrderModal)
│               │   │   ├── ClientPaymentsPage
│               │   │   ├── ClientMailInboxPage
│               │   │   ├── ClientNotificationsPage
│               │   │   ├── ClientVerificationsPage
│               │   │   └── ClientSettingsPage
│               │   └── Admin Layout (sidebar + NotificationCenter)
│               │       ├── AdminOverviewPage
│               │       ├── AdminDashboardPage
│               │       ├── AdminOrdersPage (DeleteConfirmModal, CSV export)
│               │       ├── AdminClientsPage (DeleteConfirmModal, CSV export, InviteClientModal)
│               │       ├── AdminClientDetailPage (split, ~410 lines)
│               │       ├── AdminCompaniesPage (compliance filter: Overdue/Due Soon/Compliant/No Dates)
│               │       ├── AdminDocumentsPage (DeleteConfirmModal)
│               │       ├── AdminPaymentsPage (DeleteConfirmModal, CSV export)
│               │       ├── AdminAnalyticsPage (CSV export, charts)
│               │       ├── AdminBlogsPage + AdminBlogEditorPage
│               │       ├── AdminSeoPagesPage + AdminSeoEditorPage
│               │       ├── AdminServicesPage (CRUD for services collection)
│               │       ├── AdminPagesPage + AdminPageEditorPage (CMS for dynamic pages)
│               │       ├── AdminHomeEditorPage
│               │       ├── AdminPriceEditorPage
│               │       └── AdminSettingsPage
│               ├── Blog Routes
│               │   ├── BlogListPage (featured articles, tag filter, search)
│               │   └── BlogDetailPage (cover image, meta, markdown rendering, share)
│               ├── SEO Country Routes
│               │   ├── SeoCountryListPage (country search, card grid)
│               │   └── SeoCountryPage (hero, pain points, benefits, banking, taxes, FAQ, CTA)
│               ├── Admin SEO Routes
│               │   ├── AdminSeoPagesPage (list, search, filter, delete)
│               │   └── AdminSeoEditorPage (create/edit with JSON field editors)
│               ├── Static Pages
│               │   ├── PrivacyPolicyPage, TermsPage, DisclaimerPage
│               │   ├── RefundPage, AccessibilityPage, KycAmlPage
│               │   └── CustomDynamicPage (/p/$slug — CMS-managed)
│               ├── ContactPage
│               └── SitemapPage (/sitemap.xml)
```

### Data Flow
```
User Action → React Component → Custom Hook (useQuery/useMutation)
  → PocketBase SDK (pb) → PocketBase REST API → SQLite (local)
  → Response → Hook returns data → Component re-renders
```

### State Management
- **Server State:** TanStack Query (React Query) — all PocketBase queries
- **Auth State:** `useAuth` hook — reads `pb.authStore`, writes `last_sign_in` via `syncLastSignIn()`
- **UI State:** React `useState`/`useReducer` within components
- **Form State:** React Hook Form
- **i18n State:** `LanguageContext` (React Context + localStorage)
- **Query Keys:** `['orders', userId]`, `['companies', userId]`, `['documents', userId]`, `['admin', 'orders']`, etc.

## Backend Architecture

### PocketBase (Self-Hosted Backend)
```
┌───────────────────────────────────────────┐
│         PocketBase v0.22.22 (localhost:8090)         │
│  ┌────────────┬────────────┬────────────┐  │
│  │   Auth     │  SQLite DB  │  File Store │  │
│  │ (users col)│ (12+ tables)│ (pb_data/)  │  │
│  └────────────┴────────────┴────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Collection Rules (per-collection ACL)  │  │
│  │  role = 'admin' for admin-only writes    │  │
│  └──────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### PocketBase Collections
| Collection | Description |
|---|---|
| `users` | Auth users (email, role, last_sign_in, phone, avatar) |
| `orders` | Formation orders with status workflow |
| `order_updates` | Status history per order |
| `companies` | Formed companies with compliance dates |
| `documents` | Files linked to companies/orders |
| `payments` | Payment records (Stripe session, amount, status) |
| `notifications` | In-app notifications per user |
| `invitations` | Client invite tokens |
| `contact_messages` | Contact form submissions |
| `services` | Purchasable services (slug, category, price, icon) |
| `blogs` | Blog posts (slug, content, AR/EN, featured) |
| `countries_seo_pages` | Programmatic SEO country guides |
| `pricing_config` | Dynamic pricing for formation packages |
| `pages` | CMS-managed dynamic public pages |
| `audit_logs` | Admin action audit trail |

### New Hooks
- `useBlogs` — full CRUD for blog posts (list, getBySlug, create, update, delete)
- `useSeoPages` — full CRUD for SEO country pages (list, getBySlug, create, update, delete with JSON field parsing)

### New Routes (TanStack Router)
- `/blog` — public blog list (BlogListPage)
- `/blog/$slug` — public blog detail (BlogDetailPage)
- `/admin/blogs` — admin blog management (AdminBlogsPage)
- `/admin/blogs/$id/edit` — admin blog editor (AdminBlogEditorPage)
- `/us-company` — country SEO list (SeoCountryListPage)
- `/us-company/$slug` — dynamic country SEO page (SeoCountryPage)
- `/admin/seo` — admin SEO page list (AdminSeoPagesPage)
- `/admin/seo/$id/edit` — admin SEO page editor (AdminSeoEditorPage)
- `/sitemap.xml` — sitemap XML (SitemapPage, document.write in dev; static dist/sitemap.xml in production via build script)

### Cal.com Integration
- Navbar: green "Book a Call" dropdown with 15min (`/15min`) and 30min (`/30min`) meeting types
- CTASection: meeting booking section with outlined 15min + solid green 30min buttons
- Base URL: `https://cal.com/instant-grow-llc`
- EN/AR translations in `translations.ts`

### Order Dev Mode
- When `VITE_CHECKOUT_ENDPOINT` is not set, `OrderWizard.onSubmit` creates orders directly via PocketBase `orders` collection
- Navigates to `/order/success` with `orderNumber`, `plan`, `company` search params

### Edge Functions (Cloudflare Workers)
```
functions/create-checkout/index.ts
  POST /functions/v1/create-checkout
  Auth: optional (Bearer token)
  Validates: successUrl, cancelUrl, amount
  Modes: formation, addon
  Creates: Stripe Checkout Session → returns URL

functions/stripe-webhook/index.ts
  POST /functions/v1/stripe-webhook
  Auth: Stripe webhook signature
  Handles: checkout.session.completed
  Creates: order, payment, company, order_update
  Idempotent: checks stripe_session_id uniqueness

functions/submit-contact/index.ts
  POST /functions/v1/submit-contact
  Validates: name, email, message
  CAPTCHA: optional Turnstile verification
  Inserts: contact_messages (via PocketBase API)

functions/delete-user/index.ts
  POST /functions/v1/delete-user
  Auth: Bearer token + admin role check
  Flow: nullify FKs → delete profile → delete auth user
  Prevents: self-deletion
```

### API Flow
```
Frontend → PocketBase Client (RLS / collection rules enforced)
  → Collections: users, workspaces, orders, companies, documents, payments, etc.

Frontend → Cloudflare Workers (via fetch)
  → create-checkout → Stripe API
  → submit-contact → PocketBase (using API / admin client)
  → delete-user → PocketBase Admin API

Stripe → Cloudflare Worker (webhook)
  → stripe-webhook → PocketBase (using API / admin client)
```

### Auth Flow
```
Email/Password:
  1. User submits credentials to PocketBase Auth
  2. PocketBase validates → returns session/token
  3. useAuth hooks read authState → fetch/store user details
  4. useRequireAuth/useRequireAdmin guards redirect
- **Admin Layout Route:** Admin pages are now nested under `adminLayoutRoute` which persists the sidebar layout component via `<Outlet />`, ensuring navigation between admin pages does not trigger full-page reloads.

### Data & Scripts
- **Arabic SEO Expansion Script:** `expand_arabic_blogs.js` provides an automated mechanism to consume English blogs, prompt the Gemini AI model to expand and localize them, and save the raw Arabic HTML output directly into the `blogs` PocketBase collection.

Google OAuth:
  1. User clicks "Continue with Google"
  2. PocketBase redirects to Google provider
  3. Google callback → /auth/callback
  4. AuthCallbackPage resolves role → redirects
     - admin → /admin
     - client → /client/dashboard
```

### RBAC Flow
```
Database level:
  RLS policies on all 8 tables
  - users: own rows only
  - admins: all rows (via is_admin() SECURITY DEFINER)
  - contact_messages: anonymous insert

Application level:
  useRequireAuth() → redirects to /auth/login if unauthenticated
  useRequireAdmin() → redirects to /client/dashboard if not admin
  Admin pages only accessible to admin role
```

## Database Architecture

### Entity Relationship
```
users (managed by PocketBase)
  ├── workspaces (1:N)
  │    ├── workspace_members (1:N)
  │    ├── orders (1:N)
  │    │    ├── order_updates (1:N, status history)
  │    │    └── payments (1:N)
  │    ├── companies (1:N)
  │    │    └── documents (1:N)
  │    ├── documents (1:N)
  │    └── payments (1:N)
  └── contact_messages (1:N)
```

## Deployment Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Cloudflare  │     │    PocketBase    │     │    Stripe    │
│  Pages /     │────>│  (SQLite DB      │────>│  (Payments)  │
│  Netlify     │     │   + Auth + RLS)  │     └──────────────┘
│  (Static     │     └────────┬─────────┘
│   SPA)       │              │               ┌──────────────┐
│              │     ┌────────▼─────────┐     │  Resend      │
└──────────────┘     │  Cloudflare      │────>│  (Email)     │
                     │  Workers         │     └──────────────┘
                     │  (Edge Funcs)    │
                     └────────┬─────────┘     ┌──────────────┐
                              │               │  Cloudflare  │
                              └──────────────>│  R2          │
                                              │  (Primary)   │
                                              └──────────────┘
```

## Scaling Strategy

- **Horizontal:** Static SPA scales infinitely on CDN.
- **Database:** PocketBase runs on a dedicated VPS or Cloud VM, which is extremely performant and cost-effective. Backup scripts handle daily SQLite snapshots.
- **Edge Functions:** Cloudflare Workers scale automatically with zero cold starts.
- **File Storage:** Cloudflare R2 is S3-compatible with infinite scaling and no egress fees.
- **API Rate Limiting:** Configured directly in PocketBase settings and Cloudflare Workers.

## Observability Architecture

- **Logging:** Cloudflare Workers use `console.log`/`console.error` (visible via wrangler tail or Cloudflare Dashboard). PocketBase records log history directly in the Admin Panel.
- **Frontend Errors:** Sentry or LogRocket.
- **Analytics:** Dashboard metrics generated from PocketBase database, or external tools like PostHog/Plausible.
- **Uptime:** Better Uptime, Checkly, or Uptime Robot.
- **Alerting:** Configured via monitoring providers or Discord/Telegram webhooks.
