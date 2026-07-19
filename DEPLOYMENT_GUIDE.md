# Instant Grow — Production Deployment Guide

This guide outlines all the necessary steps to deploy the **Instant Grow** platform (frontend, serverless functions, database, and payment synchronization) to a production environment.

---

## Architecture Overview

```mermaid
graph TD
    Client[Browser LTR/RTL Client] -->|Static Hosting| Frontend[Vite Frontend]
    Client -->|HTTP Calls| Workers[Cloudflare Workers Edge API]
    Workers -->|DB Queries| PocketBase[PocketBase Database Service]
    PocketBase -->|SQLite| Data[(Persistent Disk /pb/pb_data)]
    Workers -->|Transactional Email| Resend[Resend API]
    Workers -->|Payments| Stripe[Stripe API]
    PocketBase -->|Webhooks & Sync| Stripe
```

---

## Pre-requisites

Gather the following accounts, credentials, and CLI tools before starting:

### 1. External Service Accounts & Keys
- **Stripe Account**: For payment processing. You will need:
  - Live Secret Key (`sk_live_...`) or Test Secret Key (`sk_test_...`).
- **Resend Account**: For sending transactional emails. You will need:
  - Resend API Key (`re_...`).
  - A verified domain in Resend to send emails from (e.g., `instantgrow.net`).
- **Cloudflare Account**: For hosting serverless Workers and optionally the frontend.

### 2. Required CLI Tools
- **Node.js** (v18 or higher)
- **Wrangler CLI** (for Cloudflare Workers):
  ```bash
  npm install -g wrangler
  ```
- **Fly CLI** (if hosting PocketBase on Fly.io):
  - [Fly CLI Installation Guide](https://fly.io/docs/hands-on/install-cli/)

---

## Step 1: Deploy PocketBase Database

PocketBase holds all data (users, orders, companies, documents, payments). It requires a persistent disk mount since it uses SQLite.

### Option A: Deploying on Fly.io (Recommended)

1. Open your terminal and navigate to the `pocketbase/` directory:
   ```bash
   cd pocketbase
   ```
2. Log in to your Fly.io account:
   ```bash
   fly auth login
   ```
3. Launch the deployment configuration:
   ```bash
   fly launch
   ```
   *Note:* Follow the prompts to create the app. Fly.io will automatically parse [fly.toml](file:///g:/Vibe%20coding/IG%20website%20V2/pocketbase/fly.toml), build the [Dockerfile](file:///g:/Vibe%20coding/IG%20website%20V2/pocketbase/Dockerfile), allocate a persistent volume (`pb_data`), and attach it to `/pb/pb_data`.
4. Add your secrets to PocketBase (Stripe Sync Key + Database Encryption Key at rest):
   ```bash
   fly secrets set STRIPE_SECRET_KEY="sk_live_your_key"
   fly secrets set PB_ENCRYPTION_KEY="$(openssl rand -hex 32)"
   ```
   *Note:* Ensure you save the generated encryption key somewhere secure (e.g. your password manager).

### Option B: Deploying on a VPS (Docker)

1. Copy the `pocketbase/` folder to your server.
2. Build the Docker image:
   ```bash
   docker build -t pocketbase-prod -f pocketbase/Dockerfile pocketbase
   ```
3. Run the container with a persistent volume and encryption key:
   ```bash
   docker run -d \
     -p 80:8080 \
     -v pb_data:/pb/pb_data \
     -e STRIPE_SECRET_KEY="sk_live_your_key" \
     -e PB_ENCRYPTION_KEY="your-32-character-random-hex-key" \
     --name pocketbase-prod \
     pocketbase-prod
   ```

### 🔒 Securely Accessing the Admin Panel (Zero-Trust)
To prevent unauthorized access, the admin panel (`/_/`) is restricted by a backend hook and **blocked on the public domain**. You must tunnel to it locally to access it:

- **For Fly.io:**
  Run the proxy command in your terminal:
  ```bash
  fly proxy 8090:8080 -a instantgrow-pocketbase
  ```
- **For VPS (SSH Tunnel):**
  Establish a tunnel from your local machine:
  ```bash
  ssh -L 8090:127.0.0.1:8080 user@your-vps-ip
  ```

### ⚠️ Critical First-Boot Task
Immediately after establishing your secure tunnel:
1. Open your browser and navigate to **`http://127.0.0.1:8090/_/`**.
2. Create your **first admin superuser account** with a secure email and strong password.
3. Save these credentials securely; they are needed for serverless Workers and seeding scripts.

---

## Step 1B: Automated Daily Backups

The database is bundled with an online backup script `backup.sh` that takes safe snapshots while SQLite is running.

- **Manual Backup Trigger:**
  ```bash
  # Fly.io
  fly ssh console -a instantgrow-pocketbase -C "/pb/backup.sh"
  
  # VPS (Docker)
  docker exec -it pocketbase-prod /pb/backup.sh
  ```

- **Automated Cron Scheduling (VPS/Host):**
  Add a cron job to run the script daily at 2:00 AM:
  ```bash
  0 2 * * * docker exec pocketbase-prod /pb/backup.sh >> /var/log/pb-backup.log 2>&1
  ```


---

## Step 2: Configure and Deploy Cloudflare Workers

We have core edge functions in the `functions/` directory. Each needs to be configured with Wrangler.

### 1. Send Email Worker (`functions/send-email`)
Proxies transactional emails to the Resend API.
```bash
cd functions/send-email
# 1. Bind secrets
npx wrangler secret put RESEND_API_KEY      # Your Resend Key (re_...)
# 2. Deploy
npx wrangler deploy
```

### 2. Create Checkout Worker (`functions/create-checkout`)
Creates Stripe Checkout sessions.
```bash
cd ../create-checkout
# 1. Bind secrets
npx wrangler secret put STRIPE_SECRET_KEY   # Your Stripe Secret Key (sk_live_...)
npx wrangler secret put PB_ADMIN_EMAIL       # PocketBase Admin Email
npx wrangler secret put PB_ADMIN_PASSWORD    # PocketBase Admin Password
# 2. Deploy
npx wrangler deploy
```

### 3. Stripe Webhook Worker (`functions/stripe-webhook`)
Listens to Stripe events to update PocketBase order states.
```bash
cd ../stripe-webhook
# 1. Bind secrets
npx wrangler secret put STRIPE_SECRET_KEY   # Your Stripe Secret Key
npx wrangler secret put PB_ADMIN_EMAIL       # PocketBase Admin Email
npx wrangler secret put PB_ADMIN_PASSWORD    # PocketBase Admin Password
npx wrangler secret put RESEND_API_KEY      # Your Resend Key (for payment success emails)
```
*(Wait to deploy this worker until you get the webhook signing secret in Step 3!)*

---

## Step 3: Configure Stripe Webhook & Seeding

### 1. Add Webhook to Stripe
1. Log in to your **Stripe Dashboard** ➔ **Developers** ➔ **Webhooks**.
2. Click **Add Endpoint**.
3. In **Endpoint URL**, enter your deployed `stripe-webhook` worker URL (e.g. `https://stripe-webhook.your-subdomain.workers.dev`).
4. Select the event to listen to: `checkout.session.completed`.
5. Click **Add Endpoint**, then copy the **Signing Secret** (`whsec_...`).

### 2. Save Signing Secret and Deploy Webhook Worker
Go back to your terminal:
```bash
cd functions/stripe-webhook
# Save the secret you just copied
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Deploy
npx wrangler deploy
```

### 3. Sync Database Pricing with Stripe
Synchronize your packages and 50+ services into Stripe so they have matching live API pricing IDs:
1. Set environment variables on your local machine:
   ```powershell
   # Windows PowerShell
   $env:STRIPE_SECRET_KEY="sk_live_your_key"
   $env:PB_URL="https://your-pocketbase-domain.com"
   $env:PB_ADMIN_EMAIL="admin@yourdomain.com"
   $env:PB_ADMIN_PASSWORD="YourAdminPassword123!"
   
   # Linux / macOS Bash
   export STRIPE_SECRET_KEY="sk_live_your_key"
   export PB_URL="https://your-pocketbase-domain.com"
   export PB_ADMIN_EMAIL="admin@yourdomain.com"
   export PB_ADMIN_PASSWORD="YourAdminPassword123!"
   ```
2. Run the synchronization script:
   ```bash
   npm run db:sync-stripe
   ```
   *This creates products in Stripe and records their Stripe Price IDs back into PocketBase.*

---

## Step 4: Deploy Frontend Client

The frontend can be built and deployed to Netlify, Vercel, or Cloudflare Pages.

### 1. Configure Production Environment Variables
Set the following environment variables in your hosting provider's dashboard:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_PB_URL` | Your production PocketBase domain | `https://pb.instantgrow.net` |
| `VITE_CHECKOUT_ENDPOINT` | URL of deployed create-checkout Worker | `https://instantgrow-create-checkout.username.workers.dev` |
| `VITE_CONTACT_ENDPOINT` | URL of deployed submit-contact Worker | `https://instantgrow-submit-contact.username.workers.dev` |
| `VITE_DELETE_USER_ENDPOINT` | URL of deployed delete-user Worker | `https://instantgrow-delete-user.username.workers.dev` |
| `VITE_R2_UPLOAD_ENDPOINT` | URL of deployed upload-validator Worker | `https://instantgrow-upload-validator.username.workers.dev` |
| `VITE_EMAIL_ENDPOINT` | URL of deployed send-email Worker | `https://instantgrow-send-email.username.workers.dev` |
| `VITE_TURNSTILE_SITE_KEY` | Production Cloudflare Turnstile key (optional) | `0x4AAAAAA...` |

### 2. Run the Production Build Command
Configure the build settings in your provider's dashboard:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## Step 5: Post-Deployment Smoke Test

Perform a quick sanity check to ensure the production pipelines are working correctly:
1. Load the landing page and switch languages LTR ↔ RTL.
2. Navigate to `/order`, choose a formation plan, fill out details, and verify redirect to Stripe Checkout works.
3. Submit the Contact Form and verify the message appears under "Messages" in the Admin Dashboard.
4. Log in as an administrator to `https://your-pocketbase-domain.com/_/` and verify that all tables are migrated, seed data exists, and security rules are active.
