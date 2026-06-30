# Instant Grow — Deployment Strategy

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│           Static Hosting Provider             │
│  (Cloudflare Pages / Netlify / Vercel)         │
│  ┌──────────────────────────────────────────┐ │
│  │  dist/ (Vite build output)                │ │
│  │  ├── index.html                           │ │
│  │  ├── assets/*.js                          │ │
│  │  ├── assets/*.css                         │ │
│  │  └── _headers / _redirects                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              Supabase Project                  │
│  ├── PostgreSQL (8 tables + RLS)              │
│  ├── Auth (email/password + Google OAuth)      │
│  ├── Storage (documents bucket - fallback)     │
│  └── Edge Functions (Deno)                     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              External Services                 │
│  ├── Stripe (Payments + Webhooks)              │
│  ├── Resend (Transactional Email)              │
│  └── Cloudflare R2 (File Storage - primary)    │
└──────────────────────────────────────────────┘
```

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

### Frontend (Client-Side)
Must be set in hosting provider dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_SUPABASE_URL | Yes | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anon/public key |
| VITE_CHECKOUT_ENDPOINT | No | Stripe checkout Edge Function URL |
| VITE_R2_UPLOAD_ENDPOINT | No | Cloudflare R2 upload proxy URL |
| VITE_EMAIL_ENDPOINT | No | Email sending endpoint URL |
| VITE_TURNSTILE_SITE_KEY | No | Cloudflare Turnstile site key |
| VITE_CONTACT_ENDPOINT | No | Contact form Edge Function URL |
| VITE_DELETE_USER_ENDPOINT | No | Delete user Edge Function URL |

### Edge Functions (Server-Side)
Set via `supabase secrets set`:

| Variable | Required | Functions |
|----------|----------|-----------|
| SUPABASE_URL | Yes | All |
| SUPABASE_SERVICE_ROLE_KEY | Yes | stripe-webhook, submit-contact, delete-user |
| STRIPE_SECRET_KEY | Yes | create-checkout, stripe-webhook |
| STRIPE_WEBHOOK_SECRET | Yes | stripe-webhook |
| ALLOWED_ORIGIN | Yes | All (CORS) |
| RESEND_API_KEY | No | submit-contact (if email forwarding added) |
| TURNSTILE_SECRET_KEY | No | submit-contact |

## Edge Function Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy submit-contact
supabase functions deploy delete-user

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set ALLOWED_ORIGIN=https://your-domain.com
supabase secrets set TURNSTILE_SECRET_KEY=0x4AAAA...
supabase secrets set RESEND_API_KEY=re_...
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

1. **Frontend:** Revert Git commit → redeploy via CI/CD
2. **Database:** Use Supabase "Database Branching" or restore from backup
3. **Edge Functions:** Redeploy previous version via `supabase functions deploy`
4. **Stripe:** Configure webhook endpoint to point at previous function URL

## Release Process

1. Create release branch: `release/vX.Y.Z`
2. Run full test suite
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
5. Verify Edge Function logs in Supabase dashboard
6. Check Stripe webhook delivery status
