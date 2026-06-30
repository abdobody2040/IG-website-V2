# Instant Grow — Product Requirements Document

## 1. Product Overview

**Product Name:** Instant Grow
**Tagline:** Form Your LLC Fast
**Description:** Automated LLC & LTD company formation platform for international entrepreneurs. Handles the full lifecycle from order placement through document filing, EIN/UTR processing, and ongoing compliance tracking.

## 2. Target Audience

- International entrepreneurs who want to register US LLCs
- Non-US residents forming Delaware, Wyoming, New Mexico, or other state LLCs
- UK entrepreneurs forming LTD companies
- Digital nomads and remote business owners
- Anyone needing registered agent services

## 3. User Personas

### Primary: International Founder
- **Name:** Ahmed
- **Location:** Dubai, UAE
- **Goal:** Form a US LLC to accept payments from US clients
- **Pain Points:** Confusing process, expensive intermediaries, language barriers
- **Needs:** Arabic/English UI, clear pricing, fast processing, document delivery

### Secondary: Admin/Ops Manager
- **Name:** Sarah
- **Role:** Operations at Instant Grow
- **Goal:** Process orders efficiently, manage documents, track compliance
- **Pain Points:** Manual data entry, scattered information, missed deadlines
- **Needs:** Dashboard visibility, order management, client communication tools

## 4. Core Features

### 4.1 Company Formation
- Multi-step order wizard (Jurisdiction → State → Package → Members → Details → Add-ons → Pay)
- US LLC formation (all 50 states)
- UK LTD formation
- Basic and Premium packages
- Add-on services (Website, Logo, Express Filing)

### 4.2 Client Portal
- Dashboard with order status overview
- Order tracking with status history timeline
- Company details with compliance dates
- Secure document vault
- Payment history
- Mail inbox (registered agent mail forwarding)
- Add-on services marketplace
- Profile settings

### 4.3 Admin Panel
- Dashboard with KPIs (total clients, orders, revenue)
- Order management (search, filter, edit status, status history)
- Client management (list, detail with orders/companies/documents/payments)
- Company management (status, EIN, formation dates, compliance)
- Document management (upload, download, categorize)
- Payment tracking (filter by status, revenue metrics)
- Analytics (revenue over time, orders by status/package/region)
- Settings (company info, notification toggles)

### 4.4 Payments
- Stripe Checkout integration
- Formation package payments
- Add-on service payments
- Webhook handler (idempotent, creates records on successful payment)
- Payment history for clients and admins

### 4.5 Document Management
- Upload legal documents (PDF, PNG, JPEG, WEBP, DOC, DOCX)
- Max file size: 10 MB
- Storage: Cloudflare R2 (primary) / Supabase Storage (fallback)
- Admin upload for clients
- Client document viewing/download

### 4.6 Email Notifications
- Order confirmation (client + admin)
- Order status updates
- Document ready notification
- Payment confirmations
- Contact form notifications
- Resend integration (with graceful fallback)

### 4.7 Compliance Tracking
- Renewal due dates
- Annual report due dates
- Tax filing due dates
- Registered agent renewal dates
- Compliance status tracking
- Admin edit controls for compliance dates

### 4.8 Internationalization
- Full English and Arabic UI
- RTL layout support
- Language toggle in navbar
- All pages translated

## 5. Non-Functional Requirements

### 5.1 Performance
- Initial bundle < 200 KB (gzipped)
- First Contentful Paint < 1.5s
- Lighthouse Performance Score > 90

### 5.2 Security
- Row-Level Security on all database tables
- Row-Level Security with admin role checks
- CSP headers with strict directives
- Stripe webhook signature verification
- File upload validation (size + type)
- Password strength policy
- No secrets in source code
- Login error sanitization

### 5.3 Availability
- 99.9% uptime target
- Static SPA on CDN
- Managed PostgreSQL (Supabase)
- Graceful degradation for optional services (email, R2, Turnstile)

### 5.4 Scalability
- Static frontend scales horizontally
- Database handles growth via Supabase (connection pooling, read replicas)
- Edge Functions auto-scale on Supabase
- File storage unlimited via R2

### 5.5 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- RTL support for Arabic

## 6. User Stories

### Formation Flow
```
As a visitor, I want to...
...see pricing clearly so I can compare packages
...start an order without creating an account
...choose between US LLC and UK LTD
...select my state and see state-specific fees
...add members/managers to my company
...review my order details before paying
...pay via credit card (Stripe)
...receive confirmation emails
...access my client dashboard after payment
```

### Admin Flow
```
As an admin, I want to...
...see all orders in one place with status filters
...update order status and add notes
...view client details including all their data
...upload documents for any client/order
...track company compliance dates
...view revenue and analytics charts
...manage notification settings
...delete users fully (profile + auth)
```

## 7. Success Metrics

- **Conversion Rate:** % of visitors who start → complete an order
- **Order Completion Rate:** % of paid orders completed by admin
- **Client Satisfaction:** Document delivery time, support response time
- **Revenue:** Formation packages + add-on services + renewals
- **Compliance:** % of companies with up-to-date compliance tracking

## 8. Competitive Landscape

### Direct Competitors
- LegalZoom (dominant, expensive)
- ZenBusiness (modern, affordable)
- IncFile (budget option)
- FirstBase (international-friendly)
- Bizee (formerly IncFile)

### Instant Grow Advantages
- Bilingual EN/AR (unique in market)
- International entrepreneur focus
- Modern UI/UX
- Transparent pricing
- Fast processing
- Compliance tracking built-in

## 9. Future Roadmap

### Post-MVP
- Password reset flow
- Email verification sync
- Last sign-in tracking
- Real-time order status updates
- Automated compliance email reminders
- Admin audit log
- Multi-tenant support
- API for partners/whitelabel
- Subscription-based pricing
- Mobile app (React Native)

### V2
- More jurisdictions (Canada, Singapore, UAE)
- Banking-as-a-service (Mercury, Brex integration)
- Tax filing automation
- EIN application automation
- Document e-signature
- AI-powered company name generation
