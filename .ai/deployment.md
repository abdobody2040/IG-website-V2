# Instant Grow — Deployment Strategy

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│  LIVE: https://instantgrow.net                │
│  Hostinger Shared Hosting (public_html/)       │
│  ┌──────────────────────────────────────────┐ │
│  │  dist/ (Vite build output → dist.zip)         │ │
│  │  ├── index.html                              │ │
│  │  ├── assets/*.js / *.css                      │ │
│  │  ├── api/index.php (PHP 8.2 REST API)         │ │
│  │  ├── api/config.php (PDO MySQL credentials)   │ │
│  │  └── .htaccess / _redirects                   │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              MySQL Database (Hostinger)        │
│  DB: u238131962_instantgrowllc                  │
│  ├── users / orders / companies / documents       │
│  ├── payments / notifications / blogs            │
│  ├── pricing_config / services / pages           │
│  └── countries_seo_pages / tracking_*            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              External Services                 │
│  ├── Stripe (Payments + Webhooks)              │
│  ├── Resend (Transactional Email)              │
│  ├── Cloudflare R2 (File Storage - primary)    │
│  └── Cloudflare Workers (create-checkout, etc) │
└──────────────────────────────────────────────┘
```
│  ┌──────────────────────────────────────────┐ │
│  │  dist/ (Vite build output)                │ │
│  │  ├── index.html                           │ │
│  │  ├── assets/*.js                          │ │
│  │  ├── assets/*.css                         │ │
│  │  └── _headers / _redirects                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              PocketBase Backend              │
│  ├── SQLite database (8 collections + rules)  │
│  ├── Auth (email/password + Google OAuth)      │
│  ├── Storage (local file storage - fallback)  │
│  └── Hooks (pb_hooks/ JavaScript)             │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              External Services                 │
│  ├── Stripe (Payments + Webhooks)              │

## Hostinger Production Deployment (Active Architecture)

### Step 1: Build Frontend
```bash
npm run build
# Output: ./dist/ and ./dist.zip
```

### Step 2: Upload Frontend to Hostinger
1. Open **Hostinger hPanel → File Manager → public_html/**
2. Delete old `assets/` folder inside `public_html/`
3. Upload `dist.zip` to `public_html/`
4. Extract it in-place (all files land at `public_html/` root)
5. Ensure `index.html`, `assets/`, `.htaccess`, `sitemap.xml`, `robots.txt` are at `public_html/` root

### Step 3: Upload Backend API
1. Upload `api/index.php` to `public_html/api/index.php`
2. Upload `api/config.php` to `public_html/api/config.php`
3. Upload `api/.htaccess` to `public_html/api/.htaccess`
4. Verify: `https://instantgrow.net/api/health` returns `{"status":"ok"}`

### Step 4: MySQL Database (first-time or after schema changes)
1. Open **Hostinger hPanel → Databases → phpMyAdmin**
2. Select database `u238131962_instantgrowllc`
3. Run `pocketbase/seed-sql/mysql_schema_v2.sql` (creates all tables)
4. Run `pocketbase/seed-sql/seed_services_clean.sql` (132 services)
5. Run `pocketbase/seed-sql/seed_blogs_fixed_v3.sql` (blog posts)
6. To add admin user: run `pocketbase/seed-sql/make_admin.sql` (sets role='admin' for `instantgrow.net@gmail.com`)

### Step 5: Verify Admin Login
- Go to `https://instantgrow.net/auth/login`
- Login with `admin@instantgrow.net`
- Confirm admin dashboard loads and all CRUD operations work

## Frontend Deployment

### Build Command
```bash
npm run build
# Output: ./dist/
```

### Cloudflare Pages
1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables in Cloudflare dashboard
5. SPA routing handled by `public/_redirects`

### Netlify
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. SPA routing handled by `public/_redirects`
5. Security headers from `public/_headers`

### Vercel
1. Import GitHub project
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

## Environment Variables

### Frontend (Client-Side via Vite)
Set before building or in hosting provider dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | Yes | PHP API URL (`https://instantgrow.net/api` in production, `/api` in dev proxy) |
| VITE_CHECKOUT_ENDPOINT | No | Stripe checkout Cloudflare Worker URL |
| VITE_R2_UPLOAD_ENDPOINT | No | Cloudflare R2 upload proxy URL |
| VITE_EMAIL_ENDPOINT | No | Email sending Worker URL |
| VITE_TURNSTILE_SITE_KEY | No | Cloudflare Turnstile site key |

### Cloudflare Workers (Server-Side)
Set via `npx wrangler secret put`:

| Variable | Required | Description |
|----------|----------|-------------|
| PB_URL | Yes | PocketBase API URL |
| PB_ADMIN_EMAIL | Yes | PocketBase superuser/admin email |
| PB_ADMIN_PASSWORD | Yes | PocketBase superuser/admin password |
| STRIPE_SECRET_KEY | Yes | Stripe Secret Key |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe Webhook Signing Secret |
| ALLOWED_ORIGIN | Yes | Allowed CORS origin (production frontend URL) |
| RESEND_API_KEY | Yes (for email) | Resend API Key |

## Edge Function Deployment
## Serverless Functions Deployment

Serverless functions are deployed as Cloudflare Workers using Wrangler.

```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Deploy each worker
cd functions/create-checkout && npx wrangler deploy
cd ../stripe-webhook && npx wrangler deploy
cd ../submit-contact && npx wrangler deploy
cd ../delete-user && npx wrangler deploy
cd ../upload-validator && npx wrangler deploy

# 3. Configure secrets on Cloudflare Dashboard or via Wrangler
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put PB_URL
npx wrangler secret put PB_ADMIN_EMAIL
npx wrangler secret put PB_ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ALLOWED_ORIGIN
```

## CI/CD Pipeline (Recommended)

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      # Deploy to Cloudflare Pages
      - run: npx wrangler pages deploy dist/ --project-name=instant-grow
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Rollback Strategy

1. **Frontend:** Revert Git commit → redeploy via CI/CD (Cloudflare Pages / Netlify)
2. **Database:** Restore PocketBase SQLite database from a previous automated backup (stored in `pb_data/backups/`)
3. **Serverless Functions:** Redeploy previous Worker script version via Wrangler or Cloudflare Dashboard
4. **Stripe:** Verify webhook delivery status or update endpoint URL if pointing to a different worker

## Release Process

1. Create release branch: `release/vX.Y.Z`
2. Run full test suite (`npm run test` / `npm run test:e2e`)
3. Update version in `package.json`
4. Deploy to staging environment
5. Run smoke tests
6. Deploy to production
7. Tag release: `git tag vX.Y.Z && git push --tags`
8. Update .ai/changelog.md

## Monitoring After Deployment

1. Verify security headers via curl/securityheaders.com
2. Test auth flow (signup, login, OAuth)
3. Test payment flow (create checkout, webhook callback)
4. Test document upload
5. Verify Worker execution logs in Cloudflare Dashboard (real-time stream or Logpush)
6. Check Stripe webhook delivery status and log response codes
