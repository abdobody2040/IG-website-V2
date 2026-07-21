# 🚀 Complete "Baby Steps" Deployment Guide for Non-Technical Users

> 💡 **Who is this guide for?** This guide is written in plain, step-by-step language so **anyone**—even without a programming or DevOps background—can deploy the **Instant Grow** platform to production using **Hostinger**, **Cloudflare**, and **PocketBase**.

---

## 🧩 Understand the 3 Main Parts of Your App

Before clicking anything, understand how your website works behind the scenes:

```
┌─────────────────────────┐       ┌──────────────────────────┐       ┌────────────────────────┐
│  1. THE WEBSITE         │       │  2. HELPER FUNCTIONS     │       │  3. THE DATABASE       │
│  (React Frontend)       │ ────► │  (Cloudflare Workers)    │ ────► │  (PocketBase Backend)  │
│  Hosted on: Hostinger   │       │  Handles Payments/Emails │       │  Stores Users & Orders │
└─────────────────────────┘       └──────────────────────────┘       └────────────────────────┘
```

1. **The Website (Frontend):** What visitors see when they open your domain (`https://instantgrow.net`). Hosted on **Hostinger** (Shared Web Hosting or VPS).
2. **The Database (Backend):** Holds user accounts, LLC/LTD company documents, and orders. Powered by **PocketBase**.
3. **The Helper Functions (Edge Workers):** Handles Stripe payments, Resend emails, and secure file uploads using **Cloudflare Workers**.

---

## 📋 Phase 1: Create Required Free Accounts & Gather Keys

Before deployment, create the following 4 accounts and save your keys in a secure text file:

### 1. Hostinger Account
- Sign up at [hostinger.com](https://hostinger.com).
- You will need a **Web Hosting Plan** (Premium/Business) OR a **VPS Plan** (for PocketBase).

### 2. Stripe Account (For Payments)
- Sign up at [stripe.com](https://stripe.com).
- Go to **Developers** ➔ **API Keys**.
- Copy your **Secret Key**: `sk_live_...` (or `sk_test_...` for testing).

### 3. Resend Account (For Sending Transactional Emails)
- Sign up at [resend.com](https://resend.com).
- Go to **API Keys** ➔ Click **Create API Key**.
- Copy your key: `re_...`

### 4. Cloudflare Account (For Free Workers & Domain Security)
- Sign up at [cloudflare.com](https://cloudflare.com).

---

## 🌐 Phase 2: Deploying the Website Frontend on Hostinger (hPanel)

This section shows you how to upload the website files to Hostinger's **hPanel** web hosting.

### Step 2.1: Build the Website Files on Your Machine
1. Open **Command Prompt** (Windows) or **Terminal** (Mac) in your project folder.
2. Run this command:
   ```bash
   npm run build
   ```
3. After 10-20 seconds, a folder named **`dist`** will be generated inside your project folder. This contains all your website's ready-to-use HTML, JS, and CSS files.

---

### Step 2.2: Upload Files to Hostinger File Manager

1. Log in to **Hostinger hPanel** ([hpanel.hostinger.com](https://hpanel.hostinger.com)).
2. Under **Websites**, click **Manage** next to your domain name.
3. In the left menu, search for **File Manager** and click **Access Files of your domain**.

4. Double-click the **`public_html`** folder to open it.
5. **Delete default files:** If there is a `default.php` or `index.html` file created by Hostinger, delete it.
6. **Upload your `dist` files:**
   - Open the **`dist`** folder on your computer.
   - Select **ALL files and subfolders** inside `dist` (e.g. `index.html`, `assets/`, `_headers`, etc.).
   - Drag and drop them directly into `public_html` in Hostinger File Manager.

---

### Step 2.3: Fix Page Refresh (Create `.htaccess` for React Routing)

Because React handles routing inside the browser, refreshing pages like `/order` or `/admin` on Hostinger will cause a "404 Not Found" error unless you add a `.htaccess` file.

1. In Hostinger File Manager inside **`public_html`**, click the **New File** icon (+).
2. Name the file: **`.htaccess`** (include the dot at the beginning).
3. Paste the following exact lines into `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. Click **Save & Close**.

---

## 🗄️ Phase 3: Deploying PocketBase Backend

PocketBase manages your database and user logins.

---

### Option A: Deploy PocketBase on Hostinger VPS (Recommended for Hostinger Users)

If you have a Hostinger VPS plan (KVM 1 or KVM 2 running Ubuntu 22.04/24.04):

#### 1. Connect to your Hostinger VPS Terminal
- In Hostinger hPanel, go to **VPS** ➔ Click **Web Terminal** (or SSH using PuTTY/Terminal).

#### 2. Download and Run PocketBase
Paste these commands one by one into the terminal:

```bash
# Create directory
mkdir -p /opt/pocketbase && cd /opt/pocketbase

# Download PocketBase Linux binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.20/pocketbase_0.22.20_linux_amd64.zip

# Unzip binary
unzip pocketbase_0.22.20_linux_amd64.zip
rm pocketbase_0.22.20_linux_amd64.zip

# Start PocketBase server in background
./pocketbase serve --http="0.0.0.0:8090"
```

---

### Option B: Deploy PocketBase on Fly.io (Zero VPS Management Option)

If you don't want to manage a VPS server manually, use **Fly.io** (free/cheap managed container host):

1. Open your local terminal in the project directory:
   ```bash
   cd pocketbase
   ```
2. Install Fly CLI and log in:
   ```bash
   fly auth login
   ```
3. Run launch command:
   ```bash
   fly launch
   ```
4. Follow the automatic prompts. Fly.io will configure the database and start PocketBase automatically.

---

### 🔑 Critical First-Boot Step: Create Superuser Admin
Once PocketBase is running:
1. Open your browser and go to your PocketBase URL (e.g. `http://YOUR-VPS-IP:8090/_/` or `https://your-pocketbase-app.fly.dev/_/`).
2. You will be greeted by the **Initial Admin Creation Screen**.
3. Set your **Admin Email** and **Strong Admin Password**.
4. Save these credentials securely in your password manager!

---

## ⚡ Phase 4: Deploying Cloudflare Workers (Edge Functions)

Cloudflare Workers handle payments, webhook verification, and email dispatch securely without exposing API keys to the browser.

### Step 4.1: Install Wrangler CLI
Open Command Prompt / Terminal on your computer and run:

```bash
npm install -g wrangler
npx wrangler login
```
*(A browser window will open — click **Authorize** to connect Wrangler to your free Cloudflare account).*

---

### Step 4.2: Deploy `send-email` Worker
1. In your terminal, navigate to:
   ```bash
   cd functions/send-email
   ```
2. Add your Resend secret key:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
   *(Paste your `re_...` key when prompted).*
3. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```
4. Copy the output URL (e.g., `https://send-email.yourdomain.workers.dev`).

---

### Step 4.3: Deploy `create-checkout` Worker
1. Navigate to:
   ```bash
   cd ../create-checkout
   ```
2. Add your secret keys:
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put PB_ADMIN_EMAIL
   npx wrangler secret put PB_ADMIN_PASSWORD
   ```
3. Deploy:
   ```bash
   npx wrangler deploy
   ```
4. Copy the output URL (e.g., `https://create-checkout.yourdomain.workers.dev`).

---

### Step 4.4: Deploy `stripe-webhook` Worker
1. Navigate to:
   ```bash
   cd ../stripe-webhook
   ```
2. Add your secret keys:
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put PB_ADMIN_EMAIL
   npx wrangler secret put PB_ADMIN_PASSWORD
   npx wrangler secret put RESEND_API_KEY
   ```
*(We will add `STRIPE_WEBHOOK_SECRET` in Phase 5 right after creating the Stripe endpoint).*

---

## 💳 Phase 5: Connecting Stripe Live Payments

### Step 5.1: Create Webhook Endpoint in Stripe
1. Log in to your **Stripe Dashboard** ([dashboard.stripe.com](https://dashboard.stripe.com)).
2. Toggle the top-right switch from **Test Mode** to **Live Mode** (or stay in Test Mode if testing).
3. In the left menu, click **Developers** ➔ **Webhooks**.
4. Click **+ Add Endpoint**.
5. Set **Endpoint URL**: Enter your deployed `stripe-webhook` Cloudflare worker URL:
   `https://stripe-webhook.yourdomain.workers.dev`
6. Under **Select events**, click **+ Select Events**, search for:
   `checkout.session.completed`
7. Click **Add events**, then click **Add Endpoint**.

---

### Step 5.2: Copy Webhook Signing Secret to Cloudflare
1. On the new Webhook page in Stripe, locate the section **Signing secret**.
2. Click **Reveal** and copy the key starting with `whsec_...`.
3. In your computer terminal (inside `functions/stripe-webhook`), run:
   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
4. Paste the `whsec_...` key when prompted.
5. Deploy the final worker:
   ```bash
   npx wrangler deploy
   ```

---

### Step 5.3: Sync Database Pricing with Stripe Products
Run the automated sync script to populate 50+ formation services and plans into Stripe:

1. In your project root folder, create/update `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   PB_URL=https://your-pocketbase-domain.com
   PB_ADMIN_EMAIL=your-admin-email@example.com
   PB_ADMIN_PASSWORD=your-admin-password
   ```
2. Run the sync command:
   ```bash
   npm run db:sync-stripe
   ```
3. You will see a green confirmation: `✅ Successfully synced all packages & services with Stripe!`

---

## 🧪 Phase 6: Final Verification ("Baby Steps" Checklist)

Follow this quick checklist to ensure your live website is 100% operational:

- [ ] **Website Loading:** Visit your domain `https://yourdomain.com` — the landing page should render instantly.
- [ ] **Language Toggle:** Click **العربية / English** in the top navbar — verify text alignment switches smoothly (LTR ↔ RTL).
- [ ] **Direct URL Navigation:** Refresh the page on `https://yourdomain.com/order` — verify it loads cleanly without a 404 error (proves `.htaccess` works).
- [ ] **Order Formation Wizard:** Go through Step 1 to Step 7 in the Formation Wizard, select a package, and click **Proceed to Checkout**. Verify you are redirected to Stripe Checkout cleanly.
- [ ] **Contact Form Submission:** Fill out the contact form on `https://yourdomain.com/contact`. Check your PocketBase Admin panel (`/_/`) under `contact_messages` collection to confirm the message arrived.
- [ ] **Admin Dashboard:** Sign in with an admin user account — verify real-time revenue charts and order lists load without errors.

---

## 🆘 Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **404 Not Found when refreshing subpages on Hostinger** | Missing `.htaccess` file | Create `.htaccess` inside Hostinger `public_html` with the rewrite rules from Step 2.3. |
| **Stripe Checkout redirects to an error page** | `VITE_CHECKOUT_ENDPOINT` missing or wrong worker URL | Ensure your `.env.local` contains the correct Cloudflare Worker URL and rebuild with `npm run build`. |
| **Emails are not received** | Unverified domain in Resend | Go to Resend Dashboard ➔ **Domains** ➔ Add DNS records to Hostinger DNS manager. |
| **PocketBase CORS Error** | CORS origin restricted | In PocketBase Admin ➔ **Settings** ➔ **Application**, set your production domain `https://yourdomain.com`. |

---

🎉 **Congratulations!** Your **Instant Grow** automated company formation platform is now live in production!
