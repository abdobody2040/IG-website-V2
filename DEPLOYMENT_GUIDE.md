# 🚀 Complete Deployment Guide — Instant Grow Platform

> 💡 **Who is this guide for?** This step-by-step guide explains how to deploy the entire **Instant Grow** platform to production on **Hostinger Web Hosting**, **MySQL**, and **Cloudflare Workers**.

---

## 🧩 System Architecture Overview

```
┌─────────────────────────┐       ┌──────────────────────────┐       ┌────────────────────────┐
│  1. REACT FRONTEND      │       │  2. PHP REST API & DB    │       │  3. EDGE WORKERS       │
│  (SPA in public_html)   │ ────► │  (Hostinger FastCGI +    │ ────► │  (Cloudflare Workers)  │
│  instantgrow.net        │       │   MySQL Database)        │       │  Stripe / Webhooks     │
└─────────────────────────┘       └──────────────────────────┘       └────────────────────────┘
```

1. **Frontend (React 19 / Vite):** Single Page Application hosted in `public_html/`.
2. **Backend API (`api/index.php`):** High-performance PDO REST API with JWT authentication, role guards, server-side Google token verification, and MySQL integration.
3. **Database (MySQL):** Hostinger MySQL database managed via phpMyAdmin.
4. **Cloudflare Workers:** Serverless edge functions handling Stripe Checkout sessions and webhooks.

---

## 📋 Phase 1: Accounts & Credentials Checklist

Gather the following credentials before beginning deployment:

### 1. Hostinger Hosting
- Web Hosting plan (Premium, Business, or Cloud).
- Domain connected (`instantgrow.net` or your custom domain) with SSL enabled.

### 2. Stripe (Payments)
- Live API Secret Key: `sk_live_...`
- Webhook Signing Secret: `whsec_...` (generated in Phase 5).

### 3. Resend (Transactional Emails)
- API Key from [resend.com](https://resend.com): `re_...`
- Verified sending domain (e.g., `instantgrow.net`).

### 4. Google OAuth 2.0 (Google Sign-In)
- Client ID from Google Cloud Console: `...apps.googleusercontent.com`
- Authorized JavaScript Origins: `https://instantgrow.net`, `https://www.instantgrow.net`
- Authorized Redirect URIs: `https://instantgrow.net`

### 5. Cloudflare Account
- Free account on [cloudflare.com](https://cloudflare.com) for edge workers.

---

## 🗄️ Phase 2: Database Setup on Hostinger (MySQL)

### Step 2.1: Create MySQL Database in hPanel
1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Databases** ➔ **MySQL Databases**.
3. Create a new database:
   - **Database Name:** e.g., `u238131962_instantgrow`
   - **Database Username:** e.g., `u238131962_admin`
   - **Password:** Strong generated password.
4. Save the Database Name, User, and Password.

### Step 2.2: Import Schema & Seed Data via phpMyAdmin
1. In Hostinger hPanel under **MySQL Databases**, click **Enter phpMyAdmin** next to your database.
2. Click the **Import** tab in the top navigation bar.
3. Import the SQL files in the following order:
   1. **`pocketbase/seed-sql/mysql_schema_v2.sql`** (Creates all 16 tables, columns, and indexes)
   2. **`pocketbase/seed-sql/MASTER_SEED_ALL.sql`** (Populates pricing plans, 50+ services, blog posts, and country SEO guides)
   3. **`pocketbase/seed-sql/seed_f6s_perks.sql`** (Populates 824 member perks & founder deals)
4. Confirm all tables are created cleanly (`users`, `orders`, `companies`, `documents`, `payments`, `services`, `blogs`, `perks`, `pricing_config`, etc.).

---

## ⚙️ Phase 3: Backend API Configuration (`/api`)

### Step 3.1: Set Environment Variables in Hostinger hPanel
Go to **Advanced** ➔ **PHP Configuration** ➔ **Environment Variables** (or configure via Apache / `.htaccess`):

| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `DB_HOST` | Database Host | `localhost` |
| `DB_NAME` | Database Name | `u238131962_instantgrow` |
| `DB_USER` | Database User | `u238131962_admin` |
| `DB_PASS` | Database Password | `YourSecurePassword!` |
| `JWT_SECRET` | Secret key for signing user JWTs (Required) | Generate 64-char random hex string |
| `ADMIN_SECRET` | Shared secret for Cloudflare webhooks (Required) | Generate 64-char random hex string |
| `RESEND_API_KEY` | Resend API Key for emails | `re_123456789...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for token validation | `748421095690-...apps.googleusercontent.com` |
| `APP_URL` | Frontend URL | `https://instantgrow.net` |
| `API_URL` | Backend API URL | `https://instantgrow.net/api` |
| `DEBUG_MODE` | Detailed error reporting (Disable in production) | `0` or `false` |

> 🔒 **Security Notice:** `api/config.php` has zero hardcoded secret fallbacks. If `JWT_SECRET` or `ADMIN_SECRET` are missing, the API will deliberately return a `500 Server misconfiguration` error.

---

## 🌐 Phase 4: Frontend Build & Deployment

### Step 4.1: Configure Environment Variables
Create or verify `.env.production` or `.env.local` on your local machine:

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=748421095690-am0lfmkfdh1qfu7j0e8t6v6f4jmhottj.apps.googleusercontent.com
VITE_CHECKOUT_ENDPOINT=https://create-checkout.your-subdomain.workers.dev
```

### Step 4.2: Build the Production Bundle
In your local project terminal, run:

```bash
npm run build
```

This will run TypeScript checks, pre-render dynamic OG preview images, compile the React SPA into `dist/`, and generate `dist/sitemap.xml`.

### Step 4.3: Upload Files to Hostinger File Manager
1. Open **Hostinger hPanel** ➔ **File Manager** ➔ open `public_html/`.
2. Delete any default placeholder files (`default.php`, etc.).
3. Upload all contents of your local **`dist/`** folder directly into `public_html/`:
   - `assets/`
   - `index.html`
   - `favicon.ico`
   - `sitemap.xml`
   - `robots.txt`
   - `_headers`
4. Upload the **`api/`** directory into `public_html/api/`:
   - `api/index.php`
   - `api/config.php`
   - `api/.htaccess`
   - `api/uploads/` (ensure directory permissions are `755`)

### Step 4.4: Verify `.htaccess` Routing & FastCGI Headers
Ensure `public_html/.htaccess` contains SPA rewrite rules and Authorization header preservation:

```apache
RewriteEngine On
RewriteBase /

# Preserve Authorization Header for FastCGI
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP_AUTHORIZATION}]

# Route API requests to PHP backend
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# SPA Fallback for client-side React routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## ⚡ Phase 5: Cloudflare Edge Workers

Cloudflare Workers process Stripe checkout creation and webhook callbacks asynchronously.

### Step 5.1: Install Wrangler & Authenticate
```bash
npm install -g wrangler
npx wrangler login
```

### Step 5.2: Deploy `create-checkout` Worker
```bash
cd functions/create-checkout
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put API_URL          # e.g., https://instantgrow.net/api
npx wrangler secret put ADMIN_SECRET     # must match ADMIN_SECRET in PHP
npx wrangler deploy
```
Copy the published URL (e.g., `https://create-checkout.your-subdomain.workers.dev`). Set this as `VITE_CHECKOUT_ENDPOINT` in your frontend environment.

### Step 5.3: Deploy `stripe-webhook` Worker
```bash
cd ../stripe-webhook
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET  # From Stripe Dashboard (Phase 6)
npx wrangler secret put API_URL
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy
```
Copy the published URL (e.g., `https://stripe-webhook.your-subdomain.workers.dev`).

---

## 💳 Phase 6: Stripe Live Webhook Configuration

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com).
2. Navigate to **Developers** ➔ **Webhooks**.
3. Click **+ Add endpoint**.
4. **Endpoint URL:** Paste your Cloudflare `stripe-webhook` URL (`https://stripe-webhook.your-subdomain.workers.dev`).
5. **Events to send:** Select `checkout.session.completed`.
6. Click **Add endpoint**.
7. Under **Signing secret**, click **Reveal** and copy the `whsec_...` key.
8. Store this secret in your `stripe-webhook` worker:
   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

---

## ⏰ Phase 7: Automated Compliance Reminders (Daily Cron)

The platform includes an automated compliance reminder system (`scripts/send-compliance-reminders.mjs`) that notifies clients at **30 days**, **7 days**, and **1 day** before annual report or franchise tax deadlines.

### GitHub Actions Setup
Go to your GitHub repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**, and add the following repository secrets:

- `API_URL`: `https://instantgrow.net/api`
- `PB_ADMIN_EMAIL`: Master admin account email (e.g. `admin@instantgrow.net`)
- `PB_ADMIN_PASSWORD`: Master admin account password
- `RESEND_API_KEY`: `re_...`

The cron workflow (`.github/workflows/compliance-reminders.yml`) runs automatically every day at **09:00 UTC**.

---

## 🧪 Phase 8: Production Verification Checklist

Perform these tests on the live production URL:

- [ ] **Home Page & Language Switching:** Visit `https://instantgrow.net` and switch between Arabic and English. Confirm RTL/LTR alignments.
- [ ] **Direct URL Refresh:** Navigate to `https://instantgrow.net/services` and reload the page. Confirm no 404 error occurs.
- [ ] **First-Time Admin Bootstrap:** Register your primary administrator email on a freshly initialized database. Confirm initial administrator assignment.
- [ ] **Google OAuth Sign-In:** Click "Continue with Google" on `/login`. Verify Google OAuth modal opens, completes, and creates the user profile.
- [ ] **Order Formation Flow:** Complete Steps 1–6 in the Order Wizard (`/order`), choose a plan, and proceed to Stripe Checkout.
- [ ] **Member Perks Gate:** Visit `/client/perks` as an unverified user to check the preview state, then view with an active company to browse and search 824 perks.
- [ ] **Document Upload & MIME Check:** Upload a sample formation PDF in the Client Portal. Confirm the document is securely stored in `api/uploads/` with randomized naming.
- [ ] **Admin Dashboard Protection:** Verify `/admin` routes and `/api/debug/*` endpoints reject unauthenticated access with 401/403.

---

## 🆘 Troubleshooting & Common Fixes

| Issue | Root Cause | Solution |
|---|---|---|
| **500 Internal Server Error on API requests** | Missing environment variables in Hostinger | Set `JWT_SECRET` and `ADMIN_SECRET` in PHP configuration. Verify MySQL database credentials in `DB_USER`/`DB_PASS`. |
| **401 Unauthorized on page refresh in Admin** | FastCGI stripping `Authorization` header | Verify `SetEnvIf Authorization` rule is present in `public_html/.htaccess` and `api/.htaccess`. |
| **CORS blocked by browser** | Origin not in PHP allowlist | Confirm requests originate from `https://instantgrow.net` or `https://www.instantgrow.net`. Update `$_allowedOrigins` in `api/index.php` if using a staging subdomain. |
| **404 Not Found on refreshing React routes** | Missing SPA rewrite rule | Ensure `public_html/.htaccess` contains `RewriteRule . /index.html [L]`. |
| **Uploads failing** | Missing write permissions on `uploads/` | Ensure `public_html/api/uploads/` exists with folder permissions set to `755` (or `775`). |
