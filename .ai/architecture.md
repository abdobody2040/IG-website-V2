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
│               │   ├── Navbar
│               │   ├── Hero (with 3D globe via React Three Fiber)
│               │   ├── HowItWorks
│               │   ├── Features
│               │   ├── Pricing
│               │   ├── Reviews
│               │   ├── FAQ (accordion)
│               │   ├── CTASection
│               │   └── Footer
│               ├── Auth Pages
│               │   ├── LoginPage (email/password + Google OAuth)
│               │   ├── SignupPage (registration + password strength, invite token)
│               │   └── AuthCallbackPage (OAuth handler)
│               ├── OrderWizard (6-step multi-step form, lazy loaded)
│               │   ├── Step 1: Jurisdiction (US LLC / UK LTD)
│               │   ├── Step 2: State selection (US only)
│               │   ├── Step 3: Package (Basic/Premium)
│               │   ├── Step 4: Members/Managers
│               │   ├── Step 5: Business Details
│               │   ├── Step 6: Add-ons
│               │   └── Review & Pay (Stripe redirect)
│               ├── Shell (responsive sidebar layout, lazy loaded)
│               │   ├── Client Layout (sidebar + NotificationCenter)
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
│               │       ├── AdminCompaniesPage (DeleteConfirmModal)
│               │       ├── AdminDocumentsPage (DeleteConfirmModal)
│               │       ├── AdminPaymentsPage (DeleteConfirmModal, CSV export)
│               │       ├── AdminAnalyticsPage (CSV export, charts)
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
│               └── ContactPage
│
│               ## Sitemap
│               - Route: /sitemap.xml (TanStack Router, document.write fallback in dev)
│               - Build script: scripts/generate-sitemap.cjs (queries Supabase, writes dist/sitemap.xml)
```

### Data Flow
```
User Action → React Component → Custom Hook (useQuery/useMutation)
  → Supabase Client → Supabase API → PostgreSQL
  → Response → Hook returns data → Component re-renders
```

### State Management
- **Server State:** TanStack Query (React Query) — all Supabase queries
- **Auth State:** useAuth hook (Supabase session + profile role)
- **UI State:** React useState/useReducer within components
- **Form State:** React Hook Form
- **i18n State:** LanguageContext (React Context + localStorage)
- **Query Keys:** `['orders', userId]`, `['companies', userId]`, `['documents', userId]`, `['admin', 'orders']`, etc.

## Backend Architecture

### Supabase (Managed Backend)
```
┌─────────────────────────────────────────┐
│              Supabase Project            │
│  ┌──────────┬───────────┬────────────┐  │
│  │   Auth   │PostgreSQL │   Storage  │  │
│  │(users)   │(8 tables) │(documents) │  │
│  └──────────┴───────────┴────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Row-Level Security (all tables)   │  │
│  │  + is_admin() SECURITY DEFINER     │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

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
- When `VITE_CHECKOUT_ENDPOINT` is not set, `OrderWizard.onSubmit` creates orders directly via Supabase `orders.insert`
- Navigates to `/order/success` with `orderNumber`, `plan`, `company` search params

### Edge Functions (Deno)
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
  Inserts: contact_messages (via service role)

functions/delete-user/index.ts
  POST /functions/v1/delete-user
  Auth: Bearer token + admin role check
  Flow: nullify FKs → delete profile → delete auth.user
  Prevents: self-deletion
```

### API Flow
```
Frontend → Supabase Client (RLS enforced)
  → Tables: profiles, orders, companies, documents, payments, etc.

Frontend → Edge Functions (via fetch)
  → create-checkout → Stripe API
  → submit-contact → Supabase (service role)
  → delete-user → Supabase Admin API

Stripe → Edge Function (webhook)
  → stripe-webhook → Supabase (service role)
```

### Auth Flow
```
Email/Password:
  1. User submits credentials to Supabase Auth
  2. Supabase validates → returns session
  3. onAuthStateChange triggers → fetch profile role
  4. useRequireAuth/useRequireAdmin guards redirect
- **Admin Layout Route:** Admin pages are now nested under `adminLayoutRoute` which persists the sidebar layout component via `<Outlet />`, ensuring navigation between admin pages does not trigger full-page reloads.

### Data & Scripts
- **Arabic SEO Expansion Script:** `expand_arabic_blogs.js` provides an automated mechanism to consume English blogs, prompt the Gemini AI model to expand and localize them, and save the raw Arabic HTML output directly into the `blogs` PocketBase collection.

Google OAuth:
  1. User clicks "Continue with Google"
  2. Supabase redirects to Google
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
auth.users (managed by Supabase)
  └── profiles (1:1, extends with role, display_name, etc.)
       ├── orders (1:N)
       │    ├── order_updates (1:N, status history)
       │    └── payments (1:N)
       ├── companies (1:N)
       │    └── documents (1:N)
       ├── documents (1:N)
       ├── payments (1:N)
       ├── contact_messages (1:N)
       └── notification_preferences (1:1)
```

## Deployment Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Cloudflare  │     │    Supabase      │     │    Stripe    │
│  Pages /     │────>│  ┌────────────┐ │────>│  (Payments)  │
│  Netlify     │     │  │PostgreSQL  │ │     └──────────────┘
│  (Static     │     │  │+ RLS       │ │
│   SPA)       │     │  └────────────┘ │     ┌──────────────┐
│              │     │  ┌────────────┐ │────>│  Resend      │
└──────────────┘     │  │Edge Funcs  │ │     │  (Email)     │
                     │  │(Deno)      │ │     └──────────────┘
                     │  └────────────┘ │
                     │  ┌────────────┐ │     ┌──────────────┐
                     │  │ Storage    │ │────>│  Cloudflare  │
                     │  │(fallback)  │ │     │  R2 (files)  │
                     │  └────────────┘ │     └──────────────┘
                     └──────────────────┘
```

## Scaling Strategy

- **Horizontal:** Static SPA scales infinitely on CDN
- **Database:** Supabase PostgreSQL handles growth (connection pooling, read replicas available)
- **Edge Functions:** Deno scales automatically on Supabase
- **File Storage:** R2 is S3-compatible, infinite scaling
- **API Rate Limiting:** Configure in Supabase Auth → Rate Limits
- **Caching:** Add Redis/Memcached layer for frequently accessed data

## Observability Architecture

- **Logging:** Edge Functions use `console.log/error` (available in Supabase logs)
- **Frontend Errors:** Consider Sentry or LogRocket
- **Analytics:** Supabase has built-in analytics, or deploy PostHog/Plausible
- **Uptime:** Better Uptime, Checkly, or Pingdom
- **Alerting:** Configure in monitoring provider
