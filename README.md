# Instant Grow

Automated LLC & LTD company formation platform for international entrepreneurs. Handles the full lifecycle from order placement through document filing, EIN/UTR processing, and ongoing compliance — so founders can focus on building their business.

Built with **React + TypeScript + Vite** on the frontend, **Supabase** for auth and database, **Stripe** for payments, **Cloudflare R2** for document storage, and **Deno Edge Functions** for serverless backend logic.

---

## Features

### For Clients
- **Multi-step formation wizard** — Choose jurisdiction (US LLC or UK LTD), select a state, pick a package (Basic or Premium), add members/managers, and checkout via Stripe
- **Client dashboard** — Track order status, view companies, download documents, manage payments
- **Document vault** — Secure access to Articles of Organization, EIN letters, operating agreements, and other formation documents
- **Add-on services** — Purchase additional services (Annual Reports, EIN amendments, registered agent renewals) post-formation
- **Mail inbox** — View forwarded mail from registered agent address
- **Bilingual UI** — Full English and Arabic translations with RTL layout support

### For Admins
- **Admin dashboard** — KPI cards (total clients, orders, revenue), recent orders, revenue charts
- **Order management** — Search, filter, edit status, view status history, delete orders
- **Client management** — View all users with roles, order counts, total spend; drill into client detail pages with orders, companies, documents, and payments
- **Document management** — Upload documents for clients via drag-and-drop with MIME type and file size validation (PDF, PNG, JPEG, WEBP, DOC, DOCX; max 10 MB)
- **Analytics** — Revenue over time, orders by status/package/region (all live Supabase data, no mock fallbacks)
- **Company management** — Track formed companies, statuses, EIN numbers, formation dates
- **Payment tracking** — Revenue metrics, payment status filters, Stripe integration
- **Settings** — Company info, email notification toggles (master switch, admin alerts, client notifications)

### Security
- Row-Level Security (RLS) on all 8 database tables
- Strong password policy (uppercase, lowercase, number, special character)
- File upload validation (10 MB limit + MIME type allowlist)
- Cloudflare Turnstile CAPTCHA on contact form (opt-in)
- CORS origin validation on Stripe webhooks
- Security headers (X-Frame-Options, HSTS, CSP, Referrer-Policy)
- Login error sanitization (no Supabase internals exposed)
- Webhook idempotency via `stripe_session_id` unique constraint
- Admin-only full user deletion (removes from both `profiles` and `auth.users`)
- Setup page blocked in production builds

See [SECURITY.md](./SECURITY.md) for the full audit report.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (via Vite 7) |
| Language | TypeScript 5.9 |
| Routing | TanStack Router |
| Data Fetching | TanStack Query (React Query) |
| Styling | Tailwind CSS 3.3 + tailwindcss-animate |
| Forms | React Hook Form + Zod validation |
| Auth & Database | Supabase (Auth + PostgreSQL + RLS) |
| Payments | Stripe Checkout + Webhooks |
| File Storage | Cloudflare R2 (primary) / Supabase Storage (fallback) |
| Email | Resend (transactional) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion |
| 3D Graphics | React Three Fiber + Drei |
| Toasts | react-hot-toast |
| i18n | Custom context-based (EN/AR with RTL) |

---

## Project Structure

```
swyftform-clone/
├── functions/                    # Deno Edge Functions (deployed to Supabase)
│   ├── create-checkout/          #   Stripe checkout session creation
│   ├── stripe-webhook/           #   Stripe payment webhook handler
│   ├── submit-contact/           #   Contact form with CAPTCHA verification
│   └── delete-user/              #   Admin user deletion (auth + profile)
│
├── supabase/
│   ├── schema.sql                # Full database schema + RLS policies
│   └── migrations/               # Incremental schema changes
│
├── src/
│   ├── main.tsx                  # App entry point (React + QueryClient + Toaster)
│   ├── router.tsx                # TanStack Router — all route definitions
│   ├── Shell.tsx                 # Layout shell with sidebar navigation
│   │
│   ├── components/               # Shared UI components
│   │   ├── Navbar.tsx            #   Landing page navbar
│   │   ├── Hero.tsx              #   Landing hero section with 3D globe
│   │   ├── Pricing.tsx           #   Pricing cards (US/UK, Basic/Premium)
│   │   ├── Features.tsx          #   Feature grid
│   │   ├── HowItWorks.tsx        #   3-step process section
│   │   ├── Reviews.tsx           #   Customer testimonials
│   │   ├── FAQ.tsx               #   Accordion FAQ section
│   │   ├── CTASection.tsx        #   Call-to-action banner
│   │   ├── Footer.tsx            #   Site footer
│   │   ├── TurnstileWidget.tsx   #   Cloudflare Turnstile CAPTCHA
│   │   └── admin/
│   │       └── UpdateStatusModal.tsx  # Order status update modal
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx     #   Login (email/password + Google OAuth)
│   │   │   ├── SignupPage.tsx    #   Registration with password strength
│   │   │   └── AuthCallbackPage.tsx  # OAuth callback handler
│   │   │
│   │   ├── order/
│   │   │   ├── OrderWizard.tsx   #   Multi-step formation wizard (1103 lines)
│   │   │   ├── OrderSuccess.tsx  #   Post-payment success page
│   │   │   └── OrderSuccessPage.tsx  # Alternative success layout
│   │   │
│   │   ├── client/               # Client portal (authenticated)
│   │   │   ├── ClientDashboardPage.tsx
│   │   │   ├── ClientOrdersPage.tsx
│   │   │   ├── ClientCompanyPage.tsx
│   │   │   ├── ClientDocumentsPage.tsx
│   │   │   ├── ClientServicesPage.tsx    # Add-on service marketplace
│   │   │   ├── ClientPaymentsPage.tsx
│   │   │   ├── ClientMailInboxPage.tsx
│   │   │   ├── ClientVerificationsPage.tsx
│   │   │   ├── ClientSettingsPage.tsx
│   │   │   └── ClientLayout.tsx          # Sidebar layout
│   │   │
│   │   ├── admin/                # Admin panel (role: admin)
│   │   │   ├── AdminDashboardPage.tsx    # KPIs + revenue chart
│   │   │   ├── AdminOverviewPage.tsx     # Quick stats
│   │   │   ├── AdminOrdersPage.tsx       # Order CRUD
│   │   │   ├── AdminClientsPage.tsx      # User management
│   │   │   ├── AdminClientDetailPage.tsx # Client drill-down (52K lines)
│   │   │   ├── AdminCompaniesPage.tsx    # Company management
│   │   │   ├── AdminDocumentsPage.tsx    # Document management
│   │   │   ├── AdminPaymentsPage.tsx     # Payment tracking
│   │   │   ├── AdminAnalyticsPage.tsx    # Charts + breakdowns
│   │   │   ├── AdminSettingsPage.tsx     # App configuration
│   │   │   └── AdminLayout.tsx           # Admin sidebar layout
│   │   │
│   │   ├── ContactPage.tsx       # Contact form (with optional CAPTCHA)
│   │   └── SetupPage.tsx         # Initial admin setup (dev-only)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            #   Auth state + role resolution
│   │   ├── useRequireAuth.ts     #   Route guard (redirects unauthenticated)
│   │   ├── useAdminData.ts       #   Admin dashboard data queries
│   │   ├── useOrders.ts          #   Order CRUD operations
│   │   ├── useCompanies.ts       #   Company queries
│   │   ├── useDocuments.ts       #   Document queries
│   │   ├── useDocumentUpload.ts  #   File upload (R2 or Supabase Storage)
│   │   ├── useServiceCheckout.ts #   Add-on service Stripe checkout
│   │   └── useEmailNotifications.ts  # Email sending via Resend
│   │
│   ├── i18n/                     # Internationalization
│   │   ├── translations.ts       #   EN/AR translation strings (765 lines)
│   │   └── LanguageContext.tsx    #   Language provider + RTL support
│   │
│   ├── lib/
│   │   └── supabase.ts           #   Supabase client initialization
│   │
│   └── types/
│       └── db.ts                 #   TypeScript interfaces for all DB tables
│
├── public/
│   └── _headers                  # Security headers (Netlify/Cloudflare Pages)
│
├── .env.example                  # Environment variable template
├── DOCUMENTATION.md              # Detailed technical documentation
├── SECURITY.md                   # Security audit report
├── tailwind.config.cjs           # Tailwind configuration
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** (included with Node)
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Stripe** account for payments (optional for local dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/abdobody2040/swyftform-clone.git
cd swyftform-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key (see below)

# Start development server
npm run dev
# → App runs at http://localhost:3000
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required — Supabase connection
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional — Stripe checkout (needed for payments)
VITE_CHECKOUT_ENDPOINT=https://your-project.supabase.co/functions/v1/create-checkout

# Optional — Cloudflare R2 file upload (falls back to Supabase Storage)
VITE_R2_UPLOAD_ENDPOINT=

# Optional — Email via Resend
VITE_EMAIL_ENDPOINT=

# Optional — Cloudflare Turnstile CAPTCHA for contact form
VITE_TURNSTILE_SITE_KEY=

# Optional — Contact form server-side CAPTCHA verification
VITE_CONTACT_ENDPOINT=

# Optional — Full user deletion (auth + profile)
VITE_DELETE_USER_ENDPOINT=
```

### Database Setup

Run the schema in your **Supabase SQL Editor**:

1. Execute `supabase/schema.sql` — creates all tables, triggers, RLS policies
2. Execute `supabase/migrations/20260424_add_order_customer_columns.sql` — adds PII columns to orders
3. Execute `supabase/migrations/20260503_add_update_last_sign_in_rpc.sql` — adds last sign-in tracking

### Creating an Admin Account

1. Sign up through the app normally
2. Go to **Supabase Dashboard → Table Editor → profiles**
3. Find your user row and change `role` from `client` to `admin`
4. Sign out and sign back in — you'll be redirected to `/admin`

---

## Database Schema

Eight tables with Row-Level Security enabled on all of them:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **profiles** | User accounts (extends `auth.users`) | `role` (client/admin), `email`, `display_name`, `last_sign_in` |
| **orders** | Formation & service orders | `order_number`, `package_name`, `company_name`, `status`, `amount`, `stripe_session_id` |
| **order_updates** | Order status history | `order_id`, `status`, `message`, `created_by` |
| **companies** | Formed legal entities | `company_name`, `company_type` (LLC/LTD), `state`, `ein_number`, `formation_date` |
| **documents** | Legal documents & filings | `doc_type`, `file_url`, `file_name`, `status` |
| **payments** | Payment records | `invoice_id`, `amount`, `status`, `stripe_payment_id` |
| **contact_messages** | Contact form submissions | `name`, `email`, `subject`, `message` |
| **notification_preferences** | Email notification settings | Per-event toggles for clients and admins |

### RLS Policy Summary

- **Users** can only read/write their own rows
- **Admins** have full access to all tables (via `is_admin()` SECURITY DEFINER function)
- **Contact messages** allow anonymous inserts (public form)
- **Order updates** are visible to the order owner

---

## Order Formation Flow

The multi-step wizard (`OrderWizard.tsx`) guides users through company formation:

```
Step 1: Choose Jurisdiction
  └─ US LLC or UK LTD

Step 2: Select State (US only)
  └─ Popular: New Mexico ($0), Wyoming ($50), Delaware ($100)
  └─ All 50 states available

Step 3: Pick Package
  └─ Basic ($229 US / $379 UK) — Formation + Agent + EIN/UTR + Documents
  └─ Premium ($349 US / $499 UK) — Everything in Basic + Priority + Phone + Onboarding

Step 4: Add Members/Managers
  └─ Name, ownership %, role (Managing Member / Member / Manager)

Step 5: Business Details
  └─ Company name, business activity, contact info, address

Step 6: Add-ons (optional)
  └─ Website Design ($99), Logo Design ($49), Express Filing ($50)

Step 7: Review & Pay
  └─ Summary → Stripe Checkout → Success page
```

---

## Edge Functions

Four Deno Edge Functions deployed to Supabase:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `create-checkout` | `/functions/v1/create-checkout` | Creates Stripe checkout sessions for both formation orders and add-on services |
| `stripe-webhook` | `/functions/v1/stripe-webhook` | Handles `checkout.session.completed` events — creates orders, payments, companies, and initial documents in Supabase. Includes idempotency check via `stripe_session_id` |
| `submit-contact` | `/functions/v1/submit-contact` | Server-side contact form handler with Cloudflare Turnstile CAPTCHA verification |
| `delete-user` | `/functions/v1/delete-user` | Admin-only endpoint that fully deletes a user from both `profiles` table and `auth.users`, nullifying all FK references first |

---

## Internationalization

The app supports **English** and **Arabic** with full RTL layout:

- 765 lines of translation strings covering all UI text
- `LanguageProvider` context wraps the entire app
- Language toggle in the navbar
- RTL direction and font adjustments applied automatically
- Covers: landing page, order wizard, client dashboard, contact form

---

## Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build → ./dist
npm run preview      # Preview production build locally

npm run lint         # Run all linters (TypeScript + ESLint + Stylelint + CSS checks)
npm run lint:types   # TypeScript type checking only
npm run lint:js      # ESLint only
npm run lint:css     # Stylelint only
npm run check:css-vars     # Verify CSS variables match between Tailwind config and index.css
npm run check:css-classes  # Check for unused CSS classes
```

---

## Deployment

### Frontend (Static SPA)

Build and deploy the `dist/` folder to any static hosting:

```bash
npm run build
```

Compatible with:
- **Cloudflare Pages** — Uses `public/_headers` for security headers
- **Netlify** — Uses `public/_headers` for security headers
- **Vercel** — Works out of the box
- **Any static host** — Just serve the `dist/` directory

### Edge Functions

Deploy to Supabase:

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy submit-contact
supabase functions deploy delete-user
```

Required secrets on the Edge Functions:
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `ALLOWED_ORIGIN` — Your frontend domain (CORS)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret (for `submit-contact`)

---

## File Upload

Document uploads support two storage backends:

1. **Cloudflare R2** (primary) — Set `VITE_R2_UPLOAD_ENDPOINT` to your R2 proxy worker
2. **Supabase Storage** (fallback) — Create a `documents` bucket in Supabase Storage

Validation enforced on both client and server:
- **Max file size**: 10 MB
- **Allowed types**: PDF, PNG, JPEG, WEBP, DOC, DOCX
- **Drag-and-drop** interface with file preview in admin panel

---

## Security

The app has undergone a comprehensive security audit. All 14 findings have been fixed:

- 3 Critical (credentials in git, exposed setup page, weak passwords)
- 5 High (CORS wildcard, unauthenticated APIs, no upload validation, no security headers, error leaks)
- 4 Medium (no CAPTCHA, PII in notes column, incomplete user deletion, npm vulnerability)
- 2 Low (predictable order numbers, unused boilerplate)

See [SECURITY.md](./SECURITY.md) for the full report with details on each finding and fix.

---

## Documentation

For detailed technical documentation covering every hook, component, database table, and API endpoint, see [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## License

Private. All rights reserved.
