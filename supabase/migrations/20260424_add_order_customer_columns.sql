-- Add dedicated customer PII columns to orders table
-- Previously this data was stored as a concatenated string in the `notes` column,
-- making GDPR-compliant deletion and auditing difficult.
--
-- Run this in your Supabase SQL Editor.

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists customer_country text;
alter table public.orders add column if not exists customer_address text;
alter table public.orders add column if not exists business_activity text;
alter table public.orders add column if not exists stripe_session_id text;

-- Ensure webhook idempotency: prevent duplicate orders from Stripe retries
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_stripe_session_id_unique') then
    alter table public.orders add constraint orders_stripe_session_id_unique unique (stripe_session_id);
  end if;
end $$;
