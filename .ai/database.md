# Instant Grow — Database Engineering

> [!NOTE]
> **Migration Notice:** The database has been migrated from Supabase (PostgreSQL) to a locally run PocketBase (v0.22.22) backend using SQLite.
> The relations and field types described below are now defined inside [pb_schema.json](file:///g:/Vibe%20coding/IG%20website%20V2/pocketbase/pb_schema.json). All primary keys and relation fields are standard 15-character string IDs.

## Schema Overview

8 tables with Row-Level Security enabled on all. All tables are in the `public` schema.

## Entity Relationship Diagram

```
┌───────────────┐
│  auth.users   │  (managed by Supabase Auth)
└───────┬───────┘
        │ 1:1
┌───────▼──────────┐
│    profiles      │  extends auth.users with role, display_name, etc.
├──────────────────┤
│ id (PK, FK→auth) │
│ email            │
│ display_name     │
│ role (client|admin) │
│ last_sign_in     │
│ email_verified   │
│ phone            │
│ country          │
│ address          │
│ metadata (JSON)  │
└───────┬──────────┘
        │
        │ 1:N
┌───────▼──────────┐     ┌─────────────────────┐
│     orders       │─────│   order_updates      │
├──────────────────┤ 1:N ├─────────────────────┤
│ id (PK)          │     │ id (PK)             │
│ user_id (FK)     │     │ order_id (FK)       │
│ order_number (UQ)│     │ status              │
│ package_name     │     │ message             │
│ company_name     │     │ created_by          │
│ company_state    │     │ created_at          │
│ company_type     │     └─────────────────────┘
│ status           │
│ amount           │
│ currency         │
│ customer_name    │
│ customer_email   │
│ customer_phone   │
│ customer_country │
│ customer_address │
│ business_activity│
│ stripe_session_id (UQ)│
│ notes            │
│ created_at       │
│ updated_at       │
└───────┬──────────┘
        │
        │ 1:N
┌───────▼──────────┐
│    companies     │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ order_id (FK)    │
│ company_name     │
│ company_type     │
│ state            │
│ status           │
│ ein_number       │
│ formation_date   │
│ registered_agent │
│ renewal_due_date │
│ annual_report_due_date│
│ tax_filing_due_date   │
│ registered_agent_renewal_date│
│ compliance_status│
│ compliance_notes │
│ created_at       │
│ updated_at       │
└───────┬──────────┘
        │
        │ 1:N
┌───────▼──────────┐
│   documents      │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ order_id (FK)    │
│ company_id (FK)  │
│ name             │
│ type (duplicate) │
│ doc_type         │
│ file_url         │
│ file_name        │
│ status           │
│ notes            │
│ created_at       │
│ updated_at       │
└──────────────────┘

┌──────────────────┐     ┌─────────────────────────┐
│    payments      │     │ notification_preferences │
├──────────────────┤     ├─────────────────────────┤
│ id (PK)          │     │ id (PK)                 │
│ user_id (FK)     │     │ user_id (FK, UQ)        │
│ order_id (FK)    │     │ role                    │
│ invoice_id (UQ)  │     │ email_enabled           │
│ service          │     │ order_updates           │
│ amount           │     │ payment_updates         │
│ currency         │     │ document_updates        │
│ status           │     │ marketing_emails        │
│ stripe_payment_id│     │ order_placed            │
│ notes            │     │ order_status_changed    │
│ created_at       │     │ document_ready          │
│ updated_at       │     │ payment_received        │
└──────────────────┘     │ weekly_summary          │
                         │ admin_new_order         │
                         │ admin_payment_failed    │
                         │ admin_status_changed    │
                         │ email_notifications     │
                         │ created_at              │
                         │ updated_at              │
                         └─────────────────────────┘

┌──────────────────┐
│ contact_messages │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ name             │
│ email            │
│ subject          │
│ message          │
│ phone            │
│ status           │
│ created_at       │
└──────────────────┘
```

## Table Details

### profiles
- **Purpose:** Extends `auth.users` with application-specific fields
- **PK:** `id` (references `auth.users(id)`)
- **Key Fields:** `role` (client/admin), `email_verified`, `last_sign_in`
- **Triggers:** `on_auth_user_created` — auto-creates profile on signup
- **RLS:** Users read/update own; admins full access

### orders
- **Purpose:** Formation and add-on service orders
- **PK:** `id` (UUID v4)
- **Unique:** `order_number`, `stripe_session_id`
- **Status Enum:** pending, in_review, processing, documents_filed, ein_processing, completed, cancelled, in_progress
- **FK:** `user_id` → profiles(id)
- **RLS:** Users own rows; admins all

### order_updates
- **Purpose:** Status history/audit trail for orders
- **PK:** `id` (UUID v4)
- **FK:** `order_id` → orders(id) ON DELETE CASCADE
- **RLS:** Visible to order owner and admins

### companies
- **Purpose:** Formed legal entities
- **PK:** `id` (UUID v4)
- **FK:** `user_id` → profiles(id), `order_id` → orders(id)
- **Status:** pending, active, suspended, completed, dissolved
- **Compliance Status:** not_started, up_to_date, due_soon, overdue, completed
- **RLS:** Users own rows; admins all

### documents
- **Purpose:** Legal documents and filings
- **PK:** `id` (UUID v4)
- **FK:** `user_id` → profiles(id), `order_id` → orders(id), `company_id` → companies(id)
- **Status:** pending, ready, uploaded, approved, rejected
- **Note:** Has duplicate `type` and `doc_type` columns (tech debt)
- **RLS:** Users own rows; admins all

### payments
- **Purpose:** Payment records from Stripe
- **PK:** `id` (UUID v4)
- **Unique:** `invoice_id`
- **FK:** `user_id` → profiles(id), `order_id` → orders(id)
- **Status:** pending, paid, refunded, failed
- **RLS:** Users own rows; admins all

### contact_messages
- **Purpose:** Contact form submissions
- **PK:** `id` (UUID v4)
- **RLS:** Anyone can INSERT; admins can SELECT

### notification_preferences
- **Purpose:** Per-user email notification settings
- **PK:** `id` (UUID v4)
- **UQ:** `user_id`
- **FK:** `user_id` → profiles(id)
- **RLS:** Users manage own

### services
- **Purpose:** Pricing and configuration for landing/addon services
- **PK:** `id` (string 15)
- **Status:** active (bool)
- **RLS:** Admins can manage, public can view

### pages
- **Purpose:** Dynamic, localized generic pages
- **PK:** `id` (string 15)
- **Unique:** `slug`
- **Status:** active (bool)
- **RLS:** Admins can manage, public can view

## Relations Summary

| Table A | Relation | Table B | FK Column | On Delete |
|---------|----------|---------|-----------|-----------|
| profiles | 1:1 | auth.users | id | CASCADE |
| orders | N:1 | profiles | user_id | RESTRICT |
| order_updates | N:1 | orders | order_id | CASCADE |
| companies | N:1 | profiles | user_id | RESTRICT |
| companies | N:1 | orders | order_id | RESTRICT |
| documents | N:1 | profiles | user_id | RESTRICT |
| documents | N:1 | orders | order_id | RESTRICT |
| documents | N:1 | companies | company_id | RESTRICT |
| payments | N:1 | profiles | user_id | RESTRICT |
| payments | N:1 | orders | order_id | RESTRICT |
| contact_messages | N:1 | profiles | user_id | RESTRICT |
| notification_preferences | 1:1 | profiles | user_id | RESTRICT |

## Migration Rules

1. All schema changes require a SQL migration in `supabase/migrations/`
2. Migration files are prefixed with date: `YYYYMMDD_description.sql`
3. After running migration, update `schema.sql` to reflect the current schema
4. Migrations must be idempotent (use `IF NOT EXISTS` / `add column if not exists`)
5. Never delete a migration file (database state depends on history)

## Indexing Strategy

Current indexes:
- `orders.stripe_session_id` unique index (for webhook idempotency)
- `orders.order_number` unique index
- `payments.invoice_id` unique index
- Primary keys on all tables (auto-indexed)

Recommended additional indexes:
- `orders.user_id` — for user order lookups (frequently queried)
- `orders.status` — for admin filtering
- `companies.user_id` — for user company lookups
- `documents.user_id` — for user document lookups
- `order_updates.order_id` — for status history lookups
- `payments.user_id` — for user payment history

## Backup Strategy

- Backups stored in `backups/` directory as JSON files
- Each backup is timestamped: `YYYY-MM-DDTHH-MM-SS-sssZ/`
- Tables backed up individually as `.json` files
- Schema backed up as `schema.local.sql`
- **Production:** Enable automated Supabase backups (Pro plan includes daily backups)
- **Before migrations:** Always take a manual backup

## Transaction Rules

- Edge Functions use implicit transactions (single `await` calls)
- For multi-table operations, rely on Supabase/REST atomicity
- No explicit BEGIN/COMMIT (not available via REST API)
- For critical multi-table writes, use Supabase Edge Functions with service role

## Soft Delete Policy

- **Current:** Hard deletes used (no soft delete pattern)
- **Recommendation:** Add `deleted_at` timestamptz column for soft deletes
- RLS policies should filter `WHERE deleted_at IS NULL` for non-admin queries
- Admin queries can include deleted records

## Audit Logging Policy

- **Order status changes:** Tracked in `order_updates` table with `created_by` field
- **Profile changes:** No audit log (consider adding trigger-based audit)
- **Admin actions:** No audit log (consider adding for compliance)
- **Edge Functions:** Log via `console.log`/`console.error` (viewable in Supabase logs)
