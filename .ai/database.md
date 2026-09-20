# Instant Grow — Database Engineering

> [!NOTE]
> **Migration Notice:** The database has been migrated from PocketBase (SQLite) to **Hostinger MySQL (MariaDB)** using a custom PDO PHP API backend (`api/index.php`).
> The schema definition is in [mysql_schema_v2.sql](file:///g:/Vibe%20coding/IG%20website%20V2/pocketbase/seed-sql/mysql_schema_v2.sql). Clean seed scripts are located in `pocketbase/seed-sql/`:
> - `MASTER_SEED_ALL.sql` (Master seed file: pricing_config + core services + blogs + SEO pages)
> - `company_name_checker.sql` (Tables: company_name_checks, company_name_config)
> - `seed_services_clean.sql` (132 complete services)
> - `seed_blogs_clean.sql` (Full blog posts collection)
> - `seed_seo_countries_clean_mysql.sql` (52 country SEO pages)


## Schema Overview

8 tables with Row-Level Security enabled on all. All tables are in the `public` schema.

## Entity Relationship Diagram

```
┌──────────────────┐
│      users       │  (PocketBase Auth Collection)
└───────┬──────────┘
        │
        ├──────────────────────┐
        │ 1:N                  │ 1:N
┌───────▼──────────┐    ┌──────▼───────────┐
│   workspaces     │◄───┤workspace_members │
├──────────────────┤ 1  ├──────────────────┤
│ id (PK)          │    │ id (PK)          │
│ name             │    │ workspace (FK)   │
│ owner (FK→users) │    │ user (FK→users)  │
│ created/updated  │    │ role (admin/etc) │
└───────┬──────────┘    └──────────────────┘
        │
        ├──────────────────────┬──────────────────────┐
        │ 1:N                  │ 1:N                  │ 1:N
┌───────▼──────────┐    ┌──────▼───────────┐   ┌──────▼───────────┐
│     orders       │    │    companies     │   │    documents     │
├──────────────────┤    ├──────────────────┤   ├──────────────────┤
│ id (PK)          │    │ id (PK)          │   │ id (PK)          │
│ user (FK→users)  │    │ user (FK→users)  │   │ user (FK→users)  │
│ workspace (FK)   │    │ workspace (FK)   │   │ workspace (FK)   │
│ order_number     │    │ order (FK→orders)│   │ order (FK→orders)│
│ status           │    │ company_name     │   │ company (FK)     │
│ created/updated  │    │ status           │   │ name / doc_type  │
└──────────────────┘    │ created/updated  │   │ created/updated  │
                        └──────────────────┘   └──────────────────┘

┌──────────────────┐     ┌─────────────────────────┐
│    payments      │     │ notification_preferences │
├──────────────────┤     ├─────────────────────────┤
│ id (PK)          │     │ id (PK)                 │
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

### users
- **Purpose:** User accounts (PocketBase Auth Collection)
- **PK:** `id` (15-char string)
- **Key Fields:** `role` (client/admin), `emailVerified`, `last_sign_in`, `metadata` (JSON containing preferences and API tokens)
- **RLS:** Users read/update own; admins full access

### workspaces
- **Purpose:** Multi-tenant containers representing B2B accounts/organizations
- **PK:** `id` (15-char string)
- **FK:** `owner` → users(id)
- **Key Fields:** `name` (workspace name)
- **RLS:** Owners and members have access

### workspace_members
- **Purpose:** Junction table linking users to workspaces with specific roles
- **PK:** `id` (15-char string)
- **FK:** `workspace` → workspaces(id) ON DELETE CASCADE, `user` → users(id) ON DELETE CASCADE
- **Key Fields:** `role` ('admin' | 'member' | 'viewer')
- **RLS:** Workspace members have view access; admins have manage access

### orders
- **Purpose:** Formation and add-on service orders
- **PK:** `id` (15-char string)
- **Unique:** `order_number`
- **FK:** `user` → users(id), `workspace` → workspaces(id)
- **Status Enum:** pending, in_review, processing, documents_filed, ein_processing, completed, cancelled, in_progress
- **RLS:** Workspace members own rows; admins all

### order_updates
- **Purpose:** Status history/audit trail for orders
- **PK:** `id` (15-char string)
- **FK:** `order` → orders(id) ON DELETE CASCADE
- **RLS:** Visible to workspace members and admins

### companies
- **Purpose:** Formed legal entities
- **PK:** `id` (15-char string)
- **FK:** `user` → users(id), `order` → orders(id), `workspace` → workspaces(id)
- **Status:** pending, active, suspended, completed, dissolved
- **Compliance Status:** not_started, up_to_date, due_soon, overdue, completed
- **RLS:** Workspace members own rows; admins all

### documents
- **Purpose:** Legal documents and filings
- **PK:** `id` (15-char string)
- **FK:** `user` → users(id), `order` → orders(id), `company` → companies(id), `workspace` → workspaces(id)
- **Status:** pending, ready, uploaded, approved, rejected
- **Note:** Has duplicate `type` and `doc_type` columns (tech debt)
- **RLS:** Workspace members own rows; admins all
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
- **PK:** `id` (string 50)
- **Fields:** `slug`, `title_en`, `title_ar`, `content_en`, `content_ar`, `active`
- **Status:** active (bool)
- **RLS:** Admins can manage, public can view

### perks
- **Purpose:** Member exclusive perks, discounts, and software startup credits (F6S catalog) for users with confirmed/active company formations
- **PK:** `id` (string 50)
- **Key Fields:** `title_en`, `title_ar`, `description_en`, `description_ar`, `partner_name`, `discount_label`, `promo_code`, `cta_url`, `cta_label_en`, `cta_label_ar`, `icon`, `badge_en`, `badge_ar`, `color`, `bg_color`, `sort_order`, `active`, `logo_url`, `category`, `claim_type`, `offer_value`
- **Status:** active (bool)
- **Seed Script:** `pocketbase/seed-sql/seed_f6s_perks.sql` (824 verified startup deals)
- **RLS/Guard:** Public read (active=1), Admin full CRUD; Client UI gated by user having active/completed company

## Relations Summary

| Collection A | Relation | Collection B | FK Field | On Delete |
|--------------|----------|--------------|----------|-----------|
| workspaces   | N:1      | users        | owner    | RESTRICT  |
| workspace_members | N:1  | workspaces   | workspace| CASCADE   |
| workspace_members | N:1  | users        | user     | CASCADE   |
| orders       | N:1      | users        | user     | RESTRICT  |
| orders       | N:1      | workspaces   | workspace| RESTRICT  |
| order_updates| N:1      | orders       | order    | CASCADE   |
| companies    | N:1      | users        | user     | RESTRICT  |
| companies    | N:1      | orders       | order    | RESTRICT  |
| companies    | N:1      | workspaces   | workspace| RESTRICT  |
| documents    | N:1      | users        | user     | RESTRICT  |
| documents    | N:1      | orders       | order    | RESTRICT  |
| documents    | N:1      | companies    | company  | RESTRICT  |
| documents    | N:1      | workspaces   | workspace| RESTRICT  |
| payments     | N:1      | users        | user     | RESTRICT  |
| payments     | N:1      | orders       | order    | RESTRICT  |
| contact_messages | N:1  | users        | user     | RESTRICT  |
| notification_preferences | 1:1 | users | user     | RESTRICT  |

## Migration Rules

1. All schema changes are defined in the schema file: [pb_schema.json](file:///g:/Vibe%20coding/IG%20website%20V2/pocketbase/pb_schema.json)
2. PocketBase handles schema updates via migrations stored in `pocketbase/pb_migrations/`.
3. To generate a migration after changing collections in the Admin UI, run `pocketbase migrate collections`.
4. Ensure schema updates are tested locally before committing `pb_schema.json` or migrations.

## Indexing Strategy

Current indexes:
- `orders.stripe_session_id` unique index (for webhook idempotency)
- `orders.order_number` unique index
- `payments.invoice_id` unique index
- Primary keys on all tables (auto-indexed)

Recommended additional indexes:
- `orders.user` — for user order lookups (frequently queried)
- `orders.status` — for admin filtering
- `companies.user` — for user company lookups
- `documents.user` — for user document lookups
- `order_updates.order` — for status history lookups
- `payments.user` — for user payment history

## Backup Strategy

- PocketBase backups can be managed manually or via scripts under the pocketbase `backups/` directory or zip exports.
- **Production:** Run a daily server cron job backing up `pocketbase/pb_data/data.db` (the SQLite database file).
- **Before migrations:** Always take a copy of `data.db`.

## Transaction Rules

- PocketBase operations are atomic at the request level.
- Multi-table transactions can be created server-side within JSVM hooks (e.g. `pb_hooks/` scripts) or via transactions API if supported.
- Cloudflare Workers coordinates multi-step inserts with error rollback if needed.

## Soft Delete Policy

- **Current:** Hard deletes used (no soft delete pattern)
- **Recommendation:** Add `deleted_at` column for soft deletes
- API rules should filter `deleted_at = null` for non-admin queries
- Admin queries can include deleted records

## Audit Logging Policy

- **Order status changes:** Tracked in `order_updates` table with `created_by` field
- **Profile changes:** No audit log (consider adding trigger-based audit)
- **Admin actions:** Audit logs collection stores administrative action events
- **Edge Functions:** Log via `console.log`/`console.error` (viewable in Cloudflare Worker logs)

## PocketBase JSVM Database Hooks

PocketBase v0.22.x supports server-side JavaScript VM (Goja) event hooks placed in the `pocketbase/pb_hooks` directory. These hooks act as database-level event triggers.

### services.pb.js
- **Purpose**: Automatically synchronizes services created or updated by admins in PocketBase directly to Stripe.
- **Events**:
  - `onModelBeforeCreate`: Fired when a new service record is created.
  - `onModelBeforeUpdate`: Fired when an existing service record is modified.
- **Rules & Scoping**:
  - Explicit table checks using `e.model.tableName() === "services"` ensure that hooks only run for the `services` collection.
  - Function helper methods (`formUrlEncode`, `getStripeSecret`) are defined inline inside the callbacks to ensure correct scoping in the isolated Goja execution context.
  - Returns normally (no `e.next()` invocation) to succeed, and throws errors to block transactions and reject database creation/updates.
  - If `STRIPE_SECRET_KEY` is not present, it logs a clean warning and skips calls to make offline seeding/testing resilient.

