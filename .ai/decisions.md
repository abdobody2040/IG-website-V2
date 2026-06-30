# Instant Grow — Architecture Decisions

## ADR-001: Supabase as Backend

**Title:** Use Supabase (Auth + PostgreSQL + RLS) as primary backend

**Why Chosen:**
- Provides auth, database, storage, and edge functions in one platform
- Row-Level Security enables fine-grained access control without backend code
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
- If migrating away, PostgreSQL schema is portable
- Real-time subscriptions can be enabled without architecture changes

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

## ADR-007: Edge Functions for Serverless Logic

**Title:** Use Supabase Edge Functions (Deno) for serverless backend

**Why Chosen:**
- Co-located with Supabase project
- Deno runtime is secure by default
- Fast cold starts compared to Node.js Lambda
- No additional infrastructure to manage

**Alternatives Considered:**
- Cloudflare Workers: Better edge distribution but different runtime
- AWS Lambda: More complex setup, slower cold starts
- Vercel Functions: Tied to Vercel deployment

**Pros:**
- Integrated with Supabase ecosystem
- TypeScript support natively
- Sub-millisecond cold starts
- Free tier available

**Cons:**
- Deno-specific APIs (not Node.js compatible)
- Limited package ecosystem compared to npm
- Debugging is more difficult than local Node.js

**Future Implications:**
- Functions are portable to other Deno hosts (Deno Deploy, Fly.io)
- Can be migrated to Cloudflare Workers with adaptation

---

## ADR-008: Dual Storage (R2 + Supabase Storage)

**Title:** Cloudflare R2 as primary storage, Supabase Storage as fallback

**Why Chosen:**
- R2 is S3-compatible, no egress fees, global CDN
- Supabase Storage provides built-in fallback with no additional setup
- Abstracted behind upload endpoint so switching is trivial

**Alternatives Considered:**
- AWS S3: Egress fees, more complex IAM setup
- Supabase Storage only: Limited to Supabase region
- Local filesystem: Not scalable

**Pros:**
- Cost-effective at scale (no egress fees)
- Global distribution via Cloudflare CDN
- Graceful degradation with fallback

**Cons:**
- Two systems to maintain
- R2 requires a Worker proxy for uploads

**Future Implications:**
- Easy to switch storage providers behind the upload abstraction
- R2 can serve as origin for Cloudflare Images transforms

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

