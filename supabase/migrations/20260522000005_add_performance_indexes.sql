-- Database indexes for performance optimization
-- Based on analysis of common query patterns in the codebase.
-- Run this in your Supabase SQL editor.

-- ── Profiles ────────────────────────────────────────────────────────────────
-- Used in is_admin() RLS function and admin queries filtering by role
create index if not exists idx_profiles_role on public.profiles(role);

-- ── Orders ──────────────────────────────────────────────────────────────────
-- Composite index covering WHERE user_id = ? ORDER BY created_at DESC (most common pattern)
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
-- Used for individual order lookups, status filtering
create index if not exists idx_orders_status on public.orders(status);

-- ── Order Updates (status history) ──────────────────────────────────────────
create index if not exists idx_order_updates_order on public.order_updates(order_id, created_at desc);

-- ── Companies ───────────────────────────────────────────────────────────────
create index if not exists idx_companies_user_created on public.companies(user_id, created_at desc);
create index if not exists idx_companies_order on public.companies(order_id);
create index if not exists idx_companies_status on public.companies(status);

-- ── Documents ───────────────────────────────────────────────────────────────
create index if not exists idx_documents_user_created on public.documents(user_id, created_at desc);
create index if not exists idx_documents_order on public.documents(order_id);
create index if not exists idx_documents_company on public.documents(company_id);
create index if not exists idx_documents_status on public.documents(status);

-- ── Payments ────────────────────────────────────────────────────────────────
create index if not exists idx_payments_user_created on public.payments(user_id, created_at desc);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);

-- ── Notification Preferences ────────────────────────────────────────────────
create index if not exists idx_notification_prefs_user on public.notification_preferences(user_id);

-- ── Contact Messages ────────────────────────────────────────────────────────
create index if not exists idx_contact_messages_created on public.contact_messages(created_at desc);
