# Instant Grow — Architecture Decisions

## ADR-001: Supabase as Backend (SUPERCEDED)

**Title:** [SUPERCEDED by ADR-010] Use Supabase (Auth + PostgreSQL + RLS) as primary backend

**Status:** SUPERCEDED — Migrated to PocketBase (local/self-hosted SQLite backend) as detailed in ADR-010. Former benefits and trade-offs are kept for historical context.

**Why Chosen:**
- Provided auth, database, storage, and edge functions in one platform
- Row-Level Security enabled fine-grained access control without backend code
- PostgreSQL is production-grade and scales well
- Generous free tier for development
- Built-in auth with multiple providers (Google OAuth)
- Real-time subscriptions available when needed

**Alternatives Considered:**
- Firebase: Lock-in, limited SQL, expensive at scale
- Custom Node.js backend: More control but requires separate deployment and maintenance
- AWS Amplify: More complex setup, higher cost

**Pros:**
- Rapid development speed
- RLS eliminates need for separate API server for CRUD
- Good documentation and community
- Managed infrastructure (no server maintenance)

**Cons:**
- Vendor lock-in (but can migrate PostgreSQL out)
- auth.users not accessible from client (anon key restriction)
- Edge Functions are Deno-only (not Node.js)

**Future Implications:**
- Migrated successfully to PocketBase (SQLite) to lower cost to $0 and simplify local development.

---

## ADR-002: TanStack Router + TanStack Query

**Title:** Use TanStack Router for routing and TanStack Query for data fetching

**Why Chosen:**
- Type-safe routing with path parameters
- Built-in route-level code splitting support
- Query caching, deduplication, and background refetching
- Good TypeScript integration

**Alternatives Considered:**
- React Router: Less type safety, no built-in code splitting
- SWR: Similar to TanStack Query but less feature-rich
- Redux: Overkill for this application's state needs

**Pros:**
- Excellent developer experience with TypeScript
- Automatic cache invalidation
- Route-based code splitting for performance
- Active maintenance and community

**Cons:**
- Additional bundle size (~15KB gzipped for both)
- Learning curve for TanStack Router's file-based routing alternative

**Future Implications:**
- Easy to add SSR/SSG if needed (TanStack Router supports it)
- Query keys pattern scales well for complex data dependencies

---

## ADR-003: Tailwind CSS with CSS Variables

**Title:** Tailwind CSS with HSL-based CSS variables for theming

**Why Chosen:**
- Rapid UI development with utility classes
- CSS variables enable runtime theme switching (dark mode)
- HSL color space allows easy color manipulation
- Small production bundle (purging unused styles)

**Alternatives Considered:**
- CSS Modules: More verbose, no design token system
- Styled Components: Runtime CSS-in-JS overhead
- Bootstrap: Heavier, harder to customize

**Pros:**
- Fast development iteration
- Dark mode support via `.dark` class
- Consistent design tokens
- Great developer tools

**Cons:**
- Verbose HTML (utility class explosion)
- Learning curve for custom theme values

**Future Implications:**
- Easy to add new themes (just new CSS variable values)
- Component libraries (shadcn/ui) compatible with this approach

---

## ADR-004: Row-Level Security for Authorization

**Title:** Use PostgreSQL Row-Level Security for all authorization

**Why Chosen:**
- Eliminates need for separate authorization middleware
- Security is enforced at the database level (can't be bypassed)
- Single source of truth for access control
- SECURITY DEFINER function for admin checks avoids recursion

**Alternatives Considered:**
- Custom middleware in Edge Functions: More complex, additional latency
- Application-level checks: Can be bypassed, duplicate logic

**Pros:**
- Defense in depth (database-level enforcement)
- Simplifies frontend code (no manual permission checks)
- Performance (database handles filtering)

**Cons:**
- Complex policies can be hard to debug
- Testing RLS policies requires integration tests

**Future Implications:**
- Adding new tables requires RLS policy creation
- Role changes (e.g., adding moderator role) require policy updates

---

## ADR-005: Stripe Checkout Sessions

**Title:** Use Stripe Checkout Sessions for payments

**Why Chosen:**
- Stripe handles PCI compliance, card storage, and payment UI
- Checkout Sessions are hosted by Stripe (no custom payment form needed)
- Webhook integration for server-side order creation
- Built-in support for promotions, taxes, and multiple payment methods

**Alternatives Considered:**
- Stripe Elements: More custom UI but PCI SAQ A compliance needed
- PayPal: Different API, less integration with the stack
- Custom payment processing: Massive compliance overhead

**Pros:**
- Fast integration
- PCI-compliant out of the box
- Reliable webhook delivery
- Test mode for development

**Cons:**
- Users leave the site during checkout
- Limited control over checkout UI
- Stripe takes processing fees

**Future Implications:**
- Easy to add subscriptions or payment methods
- Webhook pattern can handle refunds and disputes

---

## ADR-006: Custom i18n (Context-based)

**Title:** Custom React Context-based internationalization

**Why Chosen:**
- Lightweight compared to i18next/react-i18next
- Full control over translation structure
- RTL support built into the context
- No additional bundle size

**Alternatives Considered:**
- i18next: More features but heavier bundle
- react-intl: Good but opinionated
- Intl API: Limited for custom translation needs

**Pros:**
- Simple implementation (~40 lines for context)
- Type-safe translation keys
- localStorage persistence for language preference
- Automatic RTL direction switching

**Cons:**
- No built-in pluralization or interpolation (DIY)
- Translation file can grow large
- No community tooling (extraction, management)

**Future Implications:**
- Easy to add more languages (add object to translations.ts)
- Could migrate to i18next if more features needed

---

## ADR-007: Edge Functions for Serverless Logic (SUPERCEDED)

**Title:** Use Cloudflare Workers for serverless backend (replaces Deno Supabase Edge Functions)

**Why Chosen:**
- Cloudflare Workers are globally distributed with zero cold starts.
- Fully compatible with Node.js modules and standard web APIs.
- Co-located with Cloudflare R2 storage for fast operations.
- Free tier is very generous (100k requests/day).

**Alternatives Considered:**
- Supabase Edge Functions (Deno): Migrated away when migrating to PocketBase.
- AWS Lambda: High cold starts, complex setup.

**Pros:**
- Exceptional edge performance.
- Easy deployment via Wrangler CLI.
- No cold starts.

**Cons:**
- Separate deployment required (handled via Wrangler/Cloudflare Pages).

**Future Implications:**
- Serverless Workers are easily maintainable and cheap/free at current scale.

---

## ADR-008: Dual Storage (R2 + PocketBase Storage)

**Title:** Cloudflare R2 as primary storage, PocketBase Storage as fallback

**Why Chosen:**
- R2 is S3-compatible, has no egress fees, and has a global CDN.
- PocketBase Storage provides a built-in fallback using the local SQLite db / filesystem without any third-party cloud configuration.
- Abstracted behind useDocumentUpload hook and upload-validator endpoint.

**Alternatives Considered:**
- AWS S3: High egress fees.
- PocketBase Storage only: OK for local/dev, but R2 is preferred in production to offload file serving from the VPS.

**Pros:**
- Cost-effective at scale.
- No egress fees with R2.
- Local development works completely offline using PocketBase storage fallback.

**Cons:**
- R2 requires a Worker proxy for client uploads.

**Future Implications:**
- Easy to swap storage backends behind the client upload abstraction.

---

## ADR-009: Telegram Bot for Monitoring

**Title:** Use Telegram Bot for production monitoring and alerts

**Why Chosen:**
- Free and simple to set up
- Real-time notifications
- No additional monitoring service cost
- Can be extended to handle admin commands

**Alternatives Considered:**
- Slack/Email: Requires account setup for each recipient
- SMS: Expensive at scale
- PagerDuty: Overkill for this application

**Pros:**
- Instant delivery
- Cross-platform (mobile + desktop)
- Bot API is simple and well-documented

**Cons:**
- Requires internet connection
- Not a full observability platform
- Manual setup of bot token

**Future Implications:**
- Can be extended for automated alerts, scheduled reports, and admin commands
- Easy to add to CI/CD pipeline for deployment notifications

---

## ADR-010: Migration to PocketBase and Cloudflare Workers

**Title:** Replace Supabase with PocketBase and migrate Supabase Edge Functions to Cloudflare Workers

**Why Chosen:**
- Provides a completely free, zero-config, SQLite-backed local option for database and authentication.
- PocketBase's single-binary deployment reduces hosting complexity and cloud costs to $0.
- PocketBase offers built-in admin UI, simple client SDK, and real-time subscription mechanisms.
- Keeps backend logic clean and decoupled by hosting all server-side functions (Stripe webhooks, checkout sessions, upload validation) on Cloudflare Workers.

**Alternatives Considered:**
- SQLite only (custom Express backend): Requires writing database handlers, CRUD endpoints, and custom authentication systems manually.
- Postgres/Supabase self-hosted: High CPU/memory footprint, complex Docker compose configurations.

**Pros:**
- Complete local offline dev capabilities and no monthly database/auth hosting fees.
- Zero-lockin: PocketBase schema can be exported/imported as standard JSON.
- High-performance: Cloudflare Workers are globally distributed with zero cold starts.

**Cons:**
- PocketBase requires running a persistent executable process (`pocketbase.exe` serve) locally or on a VPS.
- SQLite is limited to single-write concurrency (mitigated by PocketBase's internal locking and fast file write performance).

**Future Implications:**
- Scaling can be achieved by running PocketBase on any low-cost VPS (e.g. Hetzner, DigitalOcean) with automated daily SQLite backups.
- Local tests can run without hitting cloud rate-limits.

---

## ADR-011: Database-Level Stripe Sync Hooks

**Title:** Sync PocketBase services to Stripe via database-level JSVM event hooks

**Why Chosen:**
- Whenever admins modify or create services in the PocketBase Admin panel, changes must reflect on Stripe immediately to ensure consistency.
- Doing this via database-level hooks guarantees synchronization regardless of the client (REST API, direct Go/admin interface, or seed scripts).
- Eliminates manual sync efforts and keeps Stripe inventory and pricing metadata 100% aligned.

**Alternatives Considered:**
- Synchronize from the frontend (Vite React app): Relies on client network stability, bypasses backend security, and risks incomplete transactions.
- Periodic cron jobs to sync: Leads to state divergence between database and Stripe, causing checkout errors for newly added services.

**Pros:**
- Complete atomicity: Database changes and Stripe updates happen in the same lifecycle transaction.
- Scoped strictly to the `services` collection to prevent side effects on other collections.
- Safe fallback handles cases when Stripe secret key is not in environment without crashing local development or seeding.

**Cons:**
- Increases database model save latency slightly due to blocking Stripe API calls (mitigated by fast HTTP request handlers).
- Relies on isolated Goja context execution where global functions must be scoped locally inside each event callback.


