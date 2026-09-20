# Instant Grow — Deployment Strategy

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│  LIVE: https://instantgrow.net                │
│  Hostinger Shared Hosting (public_html/)       │
│  ┌──────────────────────────────────────────┐ │
│  │  dist/ (Vite build output)                │ │
│  │  ├── index.html                           │ │
│  │  ├── assets/*.js / *.css                  │ │
│  │  ├── api/index.php (PHP 8.2 REST API)     │ │
│  │  ├── api/config.php (PDO MySQL config)    │ │
│  │  ├── api/uploads/ (Local documents)       │ │
│  │  └── .htaccess / _headers                 │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              MySQL Database (Hostinger)        │
│  DB: u238131962_instantgrowllc               │
│  ├── users / orders / companies / documents   │
│  ├── payments / notifications / blogs        │
│  ├── pricing_config / services / pages       │
│  ├── perks (824 F6S deals)                   │
│  └── countries_seo_pages / tracking_*        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              External Services                 │
│  ├── Stripe (Payments + Webhooks)            │
│  ├── Resend (Transactional Email)            │
│  ├── Cloudflare R2 (File Storage - primary)  │
│  └── Cloudflare Workers (create-checkout)    │
└──────────────────────────────────────────────┘
```

---

## Hostinger Production Deployment Workflow

### Step 1: Build Frontend
```bash
npm run build
```
Generates `dist/` containing production assets, pre-rendered OG images, and `sitemap.xml`.

### Step 2: Upload Files to `public_html/`
- Contents of `dist/` placed directly in `public_html/`
- Directory `api/` placed in `public_html/api/`
- Ensure directory permissions for `public_html/api/uploads/` are `755`

### Step 3: MySQL Database Setup
1. Log in to Hostinger phpMyAdmin.
2. Import SQL seed files in order:
   - `pocketbase/seed-sql/mysql_schema_v2.sql`
   - `pocketbase/seed-sql/MASTER_SEED_ALL.sql`
   - `pocketbase/seed-sql/seed_f6s_perks.sql`

### Step 4: Configure PHP Environment Variables
In Hostinger hPanel ➔ **Advanced** ➔ **PHP Configuration** (or `.htaccess` / Apache SetEnv):

- `DB_HOST`: `localhost`
- `DB_NAME`: `u238131962_instantgrowllc`
- `DB_USER`: Hostinger MySQL username
- `DB_PASS`: Hostinger MySQL password
- `JWT_SECRET`: 64-character random key (Required for JWT signing)
- `ADMIN_SECRET`: 64-character random key (Required for Cloudflare webhook authorization)
- `RESEND_API_KEY`: `re_...`
- `GOOGLE_CLIENT_ID`: `748421095690-...apps.googleusercontent.com`
- `APP_URL`: `https://instantgrow.net`
- `API_URL`: `https://instantgrow.net/api`
- `DEBUG_MODE`: `0`

---

## Cloudflare Edge Workers

### 1. `create-checkout`
- **Location:** `functions/create-checkout/`
- **Secrets:** `STRIPE_SECRET_KEY`, `API_URL`, `ADMIN_SECRET`
- **Deployment:** `npx wrangler deploy`

### 2. `stripe-webhook`
- **Location:** `functions/stripe-webhook/`
- **Secrets:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `API_URL`, `ADMIN_SECRET`, `RESEND_API_KEY`
- **Deployment:** `npx wrangler deploy`

---

## Daily Compliance Reminders Cron

- **Script:** `scripts/send-compliance-reminders.mjs`
- **Schedule:** Daily at 09:00 UTC via `.github/workflows/compliance-reminders.yml`
- **GitHub Secrets:** `API_URL`, `PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD`, `RESEND_API_KEY`
