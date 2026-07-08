# Instant Grow – Full Application Documentation

> LLC & LTD company formation service. Built with **Vite + React + TypeScript + Tailwind CSS**, backed by **PocketBase** (auth + database), **Cloudflare R2** (file storage), **Stripe** (payments), and **Resend** (transactional email).

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Routes & Pages](#routes--pages)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Hooks Reference](#hooks-reference)
- [Serverless Functions](#serverless-functions)
- [Internationalization (i18n)](#internationalization-i18n)
- [Styling](#styling)
- [Supabase Setup](#supabase-setup)
- [Stripe Setup](#stripe-setup)
- [Cloudflare R2 Setup](#cloudflare-r2-setup)
- [Email Setup (Resend)](#email-setup-resend)
- [Deployment](#deployment)
- [Test / Demo Accounts](#test--demo-accounts)
- [Linting & Type Checking](#linting--type-checking)
- [Known Limitations](#known-limitations)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/abdobody2040/swyftform-clone.git
cd swyftform-clone

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env   # or create .env manually (see Environment Variables below)

# 4. Start dev server
npm run dev
# → App runs at http://localhost:3000

# 5. Build for production
npm run build
# → Output in ./dist
```

---

## Tech Stack

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Framework        | React 18 (via Vite 7)                                        |
| Language         | TypeScript 5.9                                                |
| Routing          | `@tanstack/react-router`                                     |
| State / Fetching | `@tanstack/react-query`                                      |
| Forms            | `react-hook-form` + `zod` validation                         |
| Styling          | Tailwind CSS 3.3 + `tailwindcss-animate` + `clsx`/`twMerge`  |
| Icons            | `lucide-react`                                                |
| Charts           | `recharts`                                                    |
| Animation        | `framer-motion`                                               |
| 3D               | `@react-three/fiber` + `@react-three/drei`                   |
| Toasts           | `react-hot-toast`                                             |
| Drag-and-Drop    | `@dnd-kit/core`                                               |
| Auth + Database  | PocketBase (`pocketbase` SDK)                                  |
| File Storage     | Cloudflare R2 (with PocketBase Storage fallback)              |
| Payments         | Stripe (Checkout Sessions)                                    |
| Email            | Resend (via HTTP API)                                         |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ── Required ──────────────────────────────────────────────
VITE_PB_URL=http://127.0.0.1:8090

# ── Optional (features degrade gracefully without these) ──
VITE_CHECKOUT_ENDPOINT=https://create-checkout.your-subdomain.workers.dev
VITE_R2_UPLOAD_ENDPOINT=https://upload-validator.your-subdomain.workers.dev
VITE_EMAIL_ENDPOINT=https://send-email.your-subdomain.workers.dev
```

| Variable                   | Required | Description                                                                 |
|----------------------------|----------|-----------------------------------------------------------------------------|
| `VITE_PB_URL`              | Yes      | Your PocketBase project API URL                                             |
| `VITE_CHECKOUT_ENDPOINT`   | No       | URL to the Stripe checkout serverless function                              |
| `VITE_R2_UPLOAD_ENDPOINT`  | No       | URL to Cloudflare R2 upload proxy. Falls back to PocketBase storage if absent|
| `VITE_EMAIL_ENDPOINT`      | No       | URL to email sending endpoint (Resend). Emails are skipped if absent        |

The serverless functions (`functions/`) also need these server-side env vars:

| Variable                 | Where                | Description                           |
|--------------------------|----------------------|---------------------------------------|
| `STRIPE_SECRET_KEY`      | Cloudflare Worker    | Stripe secret key                    |
| `STRIPE_WEBHOOK_SECRET`  | Stripe Webhook Worker | Webhook signing secret               |
| `PB_URL`                 | Cloudflare Workers   | PocketBase project URL                |
| `PB_ADMIN_EMAIL`         | Cloudflare Workers   | PocketBase superuser/admin email      |
| `PB_ADMIN_PASSWORD`      | Cloudflare Workers   | PocketBase superuser/admin password   |
| `ALLOWED_ORIGIN`         | Cloudflare Workers   | Production frontend origin for CORS  |
| `RESEND_API_KEY`         | Email Worker         | Resend API key (free tier available)  |

---

## Project Structure

```
swyftform-clone/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies & scripts
├── vite.config.ts                      # Vite config (port 3000, path alias @/)
├── tsconfig.json                       # TypeScript config (target ES2020, path alias @/*)
├── tsconfig.node.json                  # TS config for Vite node context
├── tailwind.config.cjs                 # Tailwind CSS config (custom colors, animations, fonts)
├── postcss.config.cjs                  # PostCSS (Tailwind + Autoprefixer)
├── .gitignore
├── .env                                # Environment variables (not committed)
│
├── public/                             # Static assets (served as-is)
│   ├── _redirects                      # SPA redirect rule for Netlify/Cloudflare Pages
│   ├── favicon.svg
│   ├── logo.png                        # Instant Grow logo
│   └── vite.svg
│
├── pocketbase/
│   └── pb_schema.json                  # PocketBase schema definitions
│
├── functions/                          # Cloudflare Workers serverless logic
│   ├── create-checkout/
│   │   └── index.ts                    # Stripe Checkout Session creation (formation + add-on)
│   └── stripe-webhook/
│       └── index.ts                    # Stripe webhook handler (creates orders, payments, companies)
│
└── src/
    ├── main.tsx                        # React entry: QueryClient, Toaster, App
    ├── App.tsx                         # RouterProvider wrapper
    ├── router.tsx                      # All route definitions (TanStack Router)
    ├── Shell.tsx                       # Mobile-responsive sidebar layout component
    ├── index.css                       # Global CSS + Tailwind directives + CSS variables
    ├── App.css                         # Additional app styles
    ├── style.css                       # Extra style sheet
    │
    ├── lib/
    │   ├── pocketbase.ts               # PocketBase client initialization
    │   └── utils.ts                    # cn() utility (clsx + twMerge)
    │
    ├── types/
    │   └── db.ts                       # TypeScript interfaces: Order, Company, Document, Payment, User, OrderUpdate
    │
    ├── i18n/
    │   ├── LanguageContext.tsx          # React context for language (EN/AR) with RTL support
    │   └── translations.ts            # All translation strings (English + Arabic)
    │
    ├── hooks/
    │   ├── useAuth.ts                  # Auth state hook (PocketBase session + syncLastSignIn)
    │   ├── useRequireAuth.ts           # Auth guard hooks (useRequireAuth, useRequireAdmin)
    │   ├── useOrders.ts                # Fetch user's orders from PocketBase
    │   ├── useCompanies.ts             # Fetch user's companies from PocketBase
    │   ├── useDocuments.ts             # Fetch user's documents from PocketBase
    │   ├── useDocumentUpload.ts        # Upload files to R2 or PocketBase Storage + create DB record
    │   ├── useServiceCheckout.ts       # Add-on service Stripe checkout
    │   ├── useEmailNotifications.ts    # Email notification functions (order confirmation, status updates, etc.)
    │   └── useAdminData.ts             # Admin hooks: useAllOrders, useAllUsers, useAllCompanies, useAllDocuments, useAllPayments
    │
    ├── components/
    │   ├── Navbar.tsx                  # Landing page navigation bar
    │   ├── Hero.tsx                    # Hero section with CTA
    │   ├── HowItWorks.tsx              # "How It Works" section
    │   ├── Features.tsx                # Features grid section
    │   ├── Pricing.tsx                 # Pricing plans section
    │   ├── Reviews.tsx                 # Customer reviews/testimonials
    │   ├── FAQ.tsx                     # FAQ accordion section
    │   ├── CTASection.tsx              # Call-to-action banner
    │   ├── Footer.tsx                  # Site footer
    │   └── admin/
    │       ├── ClientRow.tsx           # Admin client list row component
    │       ├── OrderRow.tsx            # Admin order list row component
    │       ├── StatusBadge.tsx         # Status badge (pending, completed, etc.)
    │       ├── TableSkeleton.tsx       # Loading skeleton for tables
    │       └── UpdateStatusModal.tsx   # Modal for updating order status
    │
    └── pages/
        ├── ContactPage.tsx             # Contact form page
        ├── SetupPage.tsx               # Setup/seed page (creates demo accounts)
        │
        ├── auth/
        │   ├── LoginPage.tsx           # Email/password + Google OAuth login
        │   ├── SignupPage.tsx           # Registration page (name, email, password, Google)
        │   ├── AuthCallbackPage.tsx     # OAuth callback → resolves user role → redirects to admin or client dashboard
        │   ├── AuthInput.tsx           # Styled input component for auth forms
        │   └── AuthPanel.tsx           # Shared auth page panel/container
        │
        ├── order/
        │   ├── OrderWizard.tsx         # 6-step order form (Company Info → Members → Package → Add-ons → Account → Review & Pay)
        │   ├── OrderSuccess.tsx        # Post-payment success page
        │   └── OrderSuccessPage.tsx    # Alternative success page
        │
        ├── client/                     # Client portal (requires auth)
        │   ├── ClientLayout.tsx        # Client dashboard sidebar layout
        │   ├── ClientDashboardPage.tsx # Client overview/dashboard
        │   ├── ClientOrdersPage.tsx    # Client's orders list
        │   ├── ClientCompanyPage.tsx   # Client's company details
        │   ├── ClientDocumentsPage.tsx # Client's documents
        │   ├── ClientServicesPage.tsx  # Add-on services marketplace
        │   ├── ClientPaymentsPage.tsx  # Client's payment history
        │   ├── ClientMailInboxPage.tsx # Client's mail inbox
        │   ├── ClientVerificationsPage.tsx # Client's verification status
        │   ├── ClientSettingsPage.tsx  # Client profile settings
        │   ├── CompanyPage.tsx         # Company detail view
        │   ├── DashboardPage.tsx       # Dashboard variant
        │   ├── DocumentsPage.tsx       # Documents variant
        │   ├── OrdersPage.tsx          # Orders variant
        │   ├── OrderDetailDrawer.tsx   # Slide-out order detail panel
        │   ├── ServicesPage.tsx        # Services variant
        │   ├── StatusBadge.tsx         # Client status badge
        │   └── statusUtils.ts          # Status display utilities
        │
        └── admin/                      # Admin panel (requires admin role)
            ├── AdminLayout.tsx         # Admin sidebar layout
            ├── AdminOverviewPage.tsx   # Admin overview/home
            ├── AdminDashboardPage.tsx  # Admin dashboard with stats
            ├── AdminOrdersPage.tsx     # All orders management
            ├── AdminClientsPage.tsx    # All clients management
            ├── AdminClientDetailPage.tsx # Individual client detail
            ├── AdminCompaniesPage.tsx  # All companies management
            ├── AdminDocumentsPage.tsx  # All documents management
            ├── AdminPaymentsPage.tsx   # All payments management
            ├── AdminAnalyticsPage.tsx  # Analytics dashboard (charts)
            └── AdminSettingsPage.tsx   # Admin notification settings
```

---

## Routes & Pages

| Path                      | Page                     | Auth Required | Description                              |
|---------------------------|--------------------------|:------------:|------------------------------------------|
| `/`                       | Landing Page             | No           | Marketing page (Hero, Pricing, FAQ, etc.)|
| `/auth/login`             | LoginPage                | No           | Email/password + Google OAuth login      |
| `/auth/signup`            | SignupPage               | No           | Registration form + Google signup        |
| `/auth/callback`          | AuthCallbackPage         | No           | OAuth redirect handler → role routing    |
| `/contact`                | ContactPage              | No           | Contact form                             |
| `/order`                  | OrderWizard              | No           | 6-step LLC formation order wizard        |
| `/order/success`          | OrderSuccess             | No           | Post-payment success confirmation        |
| `/setup`                  | SetupPage                | No           | Demo account setup / seeding page        |
| `/client/dashboard`       | ClientDashboardPage      | Yes          | Client overview dashboard                |
| `/client/orders`          | ClientOrdersPage         | Yes          | Client's order list                      |
| `/client/company`         | ClientCompanyPage        | Yes          | Client's company details                 |
| `/client/documents`       | ClientDocumentsPage      | Yes          | Client's uploaded documents              |
| `/client/services`        | ClientServicesPage       | Yes          | Add-on services marketplace              |
| `/client/payments`        | ClientPaymentsPage       | Yes          | Payment history                          |
| `/client/mail-inbox`      | ClientMailInboxPage      | Yes          | Client mail inbox                        |
| `/client/verifications`   | ClientVerificationsPage  | Yes          | Verification status page                 |
| `/client/settings`        | ClientSettingsPage       | Yes          | Profile settings                         |
| `/admin`                  | AdminOverviewPage        | Admin        | Admin home/overview                      |
| `/admin/dashboard`        | AdminDashboardPage       | Admin        | Admin stats dashboard                    |
| `/admin/orders`           | AdminOrdersPage          | Admin        | Manage all orders                        |
| `/admin/clients`          | AdminClientsPage         | Admin        | Manage all clients                       |
| `/admin/clients/$userId`  | AdminClientDetailPage    | Admin        | Individual client detail                 |
| `/admin/companies`        | AdminCompaniesPage       | Admin        | Manage all companies                     |
| `/admin/documents`        | AdminDocumentsPage       | Admin        | Manage all documents                     |
| `/admin/payments`         | AdminPaymentsPage        | Admin        | Manage all payments                      |
| `/admin/analytics`        | AdminAnalyticsPage       | Admin        | Analytics charts                         |
| `/admin/settings`         | AdminSettingsPage        | Admin        | Notification preferences                 |

---

## Database Schema

The full SQL schema is in `supabase/schema.sql`. Run it in the Supabase SQL editor to set up all tables.

### Tables

#### `profiles` (extends `auth.users`)
| Column       | Type         | Default       | Notes                                |
|-------------|-------------|---------------|--------------------------------------|
| id          | uuid (PK)   | —             | References `auth.users(id)`          |
| email       | text        | —             |                                      |
| display_name| text        | —             |                                      |
| avatar_url  | text        | —             |                                      |
| phone       | text        | —             |                                      |
| role        | text        | `'client'`    | `'client'` or `'admin'`             |
| created_at  | timestamptz | `now()`       |                                      |
| updated_at  | timestamptz | `now()`       |                                      |

A trigger (`on_auth_user_created`) auto-creates a profile row when a user signs up.

#### `orders`
| Column        | Type          | Default      |
|--------------|--------------|--------------|
| id           | uuid (PK)    | `gen_random_uuid()` |
| user_id      | uuid (FK → profiles) | — |
| order_number | text         | NOT NULL     |
| package_name | text         | NOT NULL     |
| company_name | text         | NOT NULL     |
| company_state| text         | `''`         |
| company_type | text         | `'LLC'`      |
| status       | text         | `'pending'`  |
| amount       | numeric(10,2)| `0`          |
| currency     | text         | `'USD'`      |
| notes        | text         | `''`         |
| created_at   | timestamptz  | `now()`      |
| updated_at   | timestamptz  | `now()`      |

#### `order_updates` (status history)
| Column     | Type      | Default           |
|-----------|----------|-------------------|
| id        | uuid (PK)| `gen_random_uuid()`|
| order_id  | uuid (FK → orders) | —    |
| status    | text     | NOT NULL           |
| message   | text     | `''`               |
| created_by| text     | `'system'`         |
| created_at| timestamptz | `now()`         |

#### `companies`
| Column          | Type      | Default            |
|----------------|----------|---------------------|
| id             | uuid (PK)| `gen_random_uuid()` |
| user_id        | uuid (FK → profiles) | —  |
| order_id       | uuid (FK → orders)   | —  |
| company_name   | text     | NOT NULL            |
| company_type   | text     | `'LLC'`             |
| state          | text     | `''`                |
| ein_number     | text     | `''`                |
| formation_date | text     | `''`                |
| registered_agent| text    | `''`                |
| status         | text     | `'pending'`         |
| created_at     | timestamptz | `now()`          |
| updated_at     | timestamptz | `now()`          |

#### `documents`
| Column     | Type      | Default             |
|-----------|----------|----------------------|
| id        | uuid (PK)| `gen_random_uuid()`  |
| user_id   | uuid (FK → profiles)| —    |
| order_id  | uuid     | —                    |
| company_id| uuid     | —                    |
| name      | text     | NOT NULL             |
| doc_type  | text     | `'other'`            |
| file_url  | text     | `''`                 |
| status    | text     | `'pending'`          |
| created_at| timestamptz | `now()`           |
| updated_at| timestamptz | `now()`           |

#### `payments`
| Column                   | Type          | Default             |
|--------------------------|--------------|----------------------|
| id                       | uuid (PK)    | `gen_random_uuid()`  |
| user_id                  | uuid (FK → profiles) | —      |
| order_id                 | uuid (FK → orders)   | —      |
| service                  | text         | `''`                 |
| invoice_id               | text         | `''`                 |
| amount                   | numeric(10,2)| `0`                  |
| currency                 | text         | `'USD'`              |
| status                   | text         | `'pending'`          |
| stripe_payment_intent_id | text         | `''`                 |
| stripe_session_id        | text         | `''`                 |
| notes                    | text         | `''`                 |
| created_at               | timestamptz  | `now()`              |
| updated_at               | timestamptz  | `now()`              |

#### `contact_messages`
| Column    | Type        | Default            |
|----------|------------|---------------------|
| id       | uuid (PK)  | `gen_random_uuid()` |
| name     | text       | NOT NULL            |
| email    | text       | NOT NULL            |
| subject  | text       | `''`                |
| message  | text       | `''`                |
| phone    | text       | `''`                |
| status   | text       | `'unread'`          |
| created_at| timestamptz| `now()`            |

#### `notification_preferences`
| Column               | Type      | Default   |
|---------------------|----------|-----------|
| id                  | uuid (PK)| `gen_random_uuid()` |
| user_id             | uuid (FK, unique) | —  |
| role                | text     | `'client'` |
| email_notifications | integer  | `1`        |
| order_placed        | integer  | `0`        |
| order_status_changed| integer  | `1`        |
| document_ready      | integer  | `0`        |
| payment_received    | integer  | `0`        |
| weekly_summary      | integer  | `0`        |
| admin_new_order     | integer  | `1`        |
| admin_payment_failed| integer  | `1`        |
| admin_status_changed| integer  | `0`        |

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Profiles**: Users read/update own; admins read/update/delete all
- **Orders**: Users read/insert own; admins full access
- **Companies**: Users read own; admins full access
- **Documents**: Users read/insert own; admins full access
- **Payments**: Users read own; admins full access
- **Order Updates**: Users read own (via order ownership); admins full access
- **Contact Messages**: Anyone can insert; admins can read
- **Notification Preferences**: Users manage own

---

## Authentication

Authentication uses **PocketBase Auth** with two methods:

1. **Email/Password** — Standard signup/login through `/auth/signup` and `/auth/login`
2. **Google OAuth** — "Continue with Google" button on both login and signup pages

### Auth Flow

```
User clicks Google OAuth
  → PocketBase redirects to Google provider
  → Google callback returns to /auth/callback
  → AuthCallbackPage resolves user details and role from PocketBase
  → Admin → /admin
  → Client → /client/dashboard
```

### Auth Hooks

| Hook              | File                        | Purpose                                    |
|-------------------|-----------------------------|---------------------------------------------|
| `useAuth()`       | `src/hooks/useAuth.ts`      | Returns `{ user, isLoading, isAuthenticated }`. Synchronizes and stores auth state. |
| `useRequireAuth()`| `src/hooks/useRequireAuth.ts`| Auth guard: redirects to `/auth/login` if not authenticated. |
| `useRequireAdmin()`| `src/hooks/useRequireAuth.ts`| Admin guard: redirects non-admins to `/client/dashboard`. |

### Google OAuth Configuration (PocketBase Dashboard)

1. Go to **Settings → Auth providers → Google** in your PocketBase Admin panel.
2. Add your Google OAuth Client ID and Client Secret (obtained from Google Cloud Console).
3. Set the authorized redirect URI to: `http://localhost:8090/api/oauth2-redirect` or your production PocketBase equivalent.
4. Enable the Google provider.

---

## Hooks Reference

| Hook                    | File                              | Description                                                |
|-------------------------|-----------------------------------|------------------------------------------------------------|
| `useAuth`               | `src/hooks/useAuth.ts`            | Auth state: user, isLoading, isAuthenticated               |
| `useRequireAuth`        | `src/hooks/useRequireAuth.ts`     | Redirect to login if not authenticated                     |
| `useRequireAdmin`       | `src/hooks/useRequireAuth.ts`     | Redirect if not admin                                      |
| `useOrders`             | `src/hooks/useOrders.ts`          | Fetch orders for a user                                    |
| `useCompanies`          | `src/hooks/useCompanies.ts`       | Fetch companies for a user                                 |
| `useDocuments`          | `src/hooks/useDocuments.ts`       | Fetch documents for a user                                 |
| `useDocumentUpload`     | `src/hooks/useDocumentUpload.ts`  | Upload files to R2/PocketBase Storage + create DB record   |
| `useServiceCheckout`    | `src/hooks/useServiceCheckout.ts` | Initiate Stripe Checkout for add-on services               |
| `useEmailNotifications` | `src/hooks/useEmailNotifications.ts` | Send transactional emails (order, status, payment, etc.) |
| `useAllOrders`          | `src/hooks/useAdminData.ts`       | Admin: fetch all orders                                    |
| `useAllUsers`           | `src/hooks/useAdminData.ts`       | Admin: fetch all user profiles                             |
| `useAllCompanies`       | `src/hooks/useAdminData.ts`       | Admin: fetch all companies                                 |
| `useAllDocuments`       | `src/hooks/useAdminData.ts`       | Admin: fetch all documents                                 |
| `useAllPayments`        | `src/hooks/useAdminData.ts`       | Admin: fetch all payments                                  |

---

## Serverless Functions

Located in `functions/`, designed as **Cloudflare Workers** (deployable to Cloudflare Edge).

### `functions/create-checkout/index.ts`

Creates Stripe Checkout Sessions. Supports two modes:

- **`mode: "formation"`** — Company formation order. Creates a checkout with company metadata (name, state, type, plan).
- **`mode: "addon"`** — Add-on service purchase. Creates a checkout for individual services.

**Server-side env vars**: `STRIPE_SECRET_KEY`, `ALLOWED_ORIGIN`

### `functions/stripe-webhook/index.ts`

Handles Stripe `checkout.session.completed` webhook events:

- Creates `orders`, `payments`, and `companies` records in the database
- Creates `order_updates` status history entries
- Supports both formation and add-on payment types

**Server-side env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGIN`

---

## Internationalization (i18n)

The app supports **English (EN)** and **Arabic (AR)** with full RTL layout support.

| File                         | Purpose                                           |
|------------------------------|---------------------------------------------------|
| `src/i18n/LanguageContext.tsx`| React context providing `lang`, `t`, `toggleLang`, `isRTL` |
| `src/i18n/translations.ts`  | All translation strings for both languages         |

### How it works

1. `LanguageProvider` wraps the entire app (defined in `router.tsx` root route)
2. Language is saved to `localStorage` (`ig-lang` key)
3. `document.documentElement.dir` is set to `rtl` for Arabic
4. Use `useLang()` hook in any component to access translations

```tsx
import { useLang } from '@/i18n/LanguageContext'

function MyComponent() {
  const { t, toggleLang, isRTL } = useLang()
  return <h1>{t.hero.title}</h1>
}
```

### Toggle Button

A language toggle button appears in the Navbar and order page header, switching between EN and AR.

---

## Styling

| File                    | Purpose                                          |
|------------------------|---------------------------------------------------|
| `tailwind.config.cjs`  | Custom theme: colors (HSL variables), fonts (Inter, Sora), animations, border radius |
| `postcss.config.cjs`   | PostCSS: Tailwind + Autoprefixer                  |
| `src/index.css`        | CSS variables, Tailwind directives, global styles  |
| `src/App.css`          | Additional app-level styles                        |
| `src/style.css`        | Extra styles                                       |

### Design System

- **Fonts**: Inter (body), Sora (headings)
- **Colors**: HSL-based CSS variables (primary, secondary, muted, accent, destructive, etc.)
- **Dark mode**: Configured via `.dark` class (`darkMode: ["class"]`) but not actively used
- **Animations**: `fade-in`, `slide-up`, `accordion-down`, `accordion-up`
- **Path alias**: `@/` maps to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)

---

## PocketBase Setup

### 1. Run PocketBase locally

1. Download PocketBase from [pocketbase.io](https://pocketbase.io) or run the pre-installed executable in the `pocketbase/` directory.
2. Start the local server: `./pocketbase serve` (runs on `http://127.0.0.1:8090` by default).

### 2. Schema and Migrations

1. Collection configurations are defined in `pocketbase/pb_schema.json` and are applied via migrations in `pocketbase/pb_migrations/`.
2. Access the Admin UI at `http://127.0.0.1:8090/_/` to inspect collections, users, and logs.

### 3. Seeding Database

Run the seeding script to populate services, blogs, SEO country pages, and mock client/admin users:

```bash
npm run db:seed
```

---

## Stripe Setup

### 1. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**

### 2. Deploy Checkout Function

Deploy `functions/create-checkout/index.ts` as a Supabase Edge Function or Cloudflare Worker with `STRIPE_SECRET_KEY` and `ALLOWED_ORIGIN` as env vars.

### 3. Set Up Webhook

1. In Stripe Dashboard → Webhooks, create an endpoint pointing to your deployed `stripe-webhook` function
2. Listen for event: `checkout.session.completed`
3. Copy the **Webhook Signing Secret** and set as `STRIPE_WEBHOOK_SECRET`

### 4. Set Client Environment

Set `VITE_CHECKOUT_ENDPOINT` in your `.env` to the deployed checkout function URL.

---

## Cloudflare R2 Setup

### Option A: Cloudflare R2 (recommended for production)

1. Create an R2 bucket in your Cloudflare dashboard
2. Deploy a Cloudflare Worker as an upload proxy that:
   - Accepts `POST` with `FormData` (fields: `file`, `path`)
   - Uploads to your R2 bucket
   - Returns `{ url: "https://..." }`
3. Set `VITE_R2_UPLOAD_ENDPOINT` to the Worker URL

### Option B: Supabase Storage (simpler, built-in)

If `VITE_R2_UPLOAD_ENDPOINT` is not set, the app automatically falls back to Supabase Storage. Just create a `documents` bucket (see Supabase Setup above).

---

## Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Get your API key from the Resend dashboard
3. Deploy an email endpoint (Edge Function / Worker) that:
   - Accepts `POST` with `{ to, subject, html, text }`
   - Sends via Resend API
4. Set `VITE_EMAIL_ENDPOINT` in your `.env`

If `VITE_EMAIL_ENDPOINT` is not configured, email notifications are silently skipped (logged to console).

### Email Templates

The app sends these notification emails (defined in `src/hooks/useEmailNotifications.ts`):

| Email                        | Recipient        | Trigger                          |
|------------------------------|-----------------|----------------------------------|
| Order Confirmation           | Client + Admin  | After successful payment         |
| Order Status Update          | Client          | When admin changes order status  |
| Admin New Order Alert        | Admin           | New order placed                 |
| Payment Confirmation         | Client          | Payment received                 |
| Payment Failed               | Client + Admin  | Payment failure                  |
| Document Ready               | Client          | Document becomes available       |
| Contact Form Submission      | Admin           | Contact form submitted           |
| Welcome Email                | Client          | New user registration            |

---

## Deployment

### Static Frontend (Recommended)

The app builds to static files and can be hosted on any static hosting service.

```bash
npm run build
# Output: ./dist/
```

#### Netlify

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The `public/_redirects` file handles SPA routing automatically

#### Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add a `_redirects` rule for SPA: `/* /index.html 200` (already present)

#### Vercel

1. Import the project from GitHub
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

### Environment Variables for Deployment

Set the same environment variables from the [Environment Variables](#environment-variables) section in your hosting provider's dashboard.

### Serverless Functions Deployment

Serverless functions are deployed as Cloudflare Workers using Wrangler.

```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Deploy each worker
cd functions/create-checkout && npx wrangler deploy
cd ../stripe-webhook && npx wrangler deploy
cd ../submit-contact && npx wrangler deploy
cd ../delete-user && npx wrangler deploy

# 3. Configure secrets on Cloudflare Dashboard or via Wrangler
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put PB_URL
npx wrangler secret put PB_ADMIN_EMAIL
npx wrangler secret put PB_ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ALLOWED_ORIGIN
```

---

## Test / Demo Accounts

The `/setup` page creates demo accounts for testing:

| Role   | Email                     | Password        | Dashboard           |
|--------|--------------------------|-----------------|---------------------|
| Admin  | admin@instantgrow.net    | Admin@2025!     | `/admin`            |
| Client | client@instantgrow.net   | Client@2025!    | `/client/dashboard` |

> **Important**: These are for development/demo only. Remove or change them before deploying to production.

---

## Linting & Type Checking

```bash
# Full lint (types + ESLint + Stylelint + CSS var check)
npm run lint

# Individual checks
npm run lint:types       # TypeScript type checking (tsc --noEmit)
npm run lint:js          # ESLint
npm run lint:css         # Stylelint
npm run check:css-vars   # Verify CSS variables match between tailwind.config and index.css
npm run check:css-classes # Check CSS class usage
```

---

## Known Limitations

1. **Self-hosted database VMs**: Since PocketBase uses SQLite, it requires running as a persistent process on a VM or VPS.
2. **Database scaling limits**: SQLite performs all writes sequentially, which means it cannot scale horizontally to multiple write nodes. However, for Instant Grow's typical formation volumes, SQLite is more than fast enough.
