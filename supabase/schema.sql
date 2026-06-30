-- Supabase SQL schema for Instant Grow (swyftform-clone)
-- Run this in your Supabase SQL editor to create all required tables.

-- ── Profiles (extends Supabase auth.users) ──────────────────────────────────
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id),
  email text,
  display_name text,
  avatar_url text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  country text,
  address text,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  metadata text not null default '{}',
  last_sign_in timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Orders ──────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_number text not null unique,
  package_name text not null,
  company_name text,
  company_state text,
  company_type text not null default 'LLC',
  status text not null default 'pending' check (status in ('pending', 'in_review', 'processing', 'documents_filed', 'ein_processing', 'completed', 'cancelled', 'in_progress')),
  amount numeric not null default 0,
  currency text not null default 'USD',
  notes text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_country text,
  customer_address text,
  business_activity text,
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Order Updates (status history) ──────────────────────────────────────────
create table if not exists public.order_updates (
  id uuid not null primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  status text not null,
  message text not null,
  created_by text not null default 'system',
  created_at timestamptz not null default now()
);

-- ── Companies ───────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  company_name text not null,
  company_type text not null default 'LLC',
  state text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'completed', 'dissolved')),
  ein_number text,
  formation_date date,
  registered_agent text,
  renewal_due_date date,
  annual_report_due_date date,
  tax_filing_due_date date,
  registered_agent_renewal_date date,
  compliance_status text not null default 'not_started' check (compliance_status in ('not_started', 'up_to_date', 'due_soon', 'overdue', 'completed')),
  compliance_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Documents ───────────────────────────────────────────────────────────────
create table if not exists public.documents (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  company_id uuid references public.companies(id),
  order_id uuid references public.orders(id),
  name text not null,
  type text not null default 'other',
  doc_type text not null default 'other',
  file_url text,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'ready', 'uploaded', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Payments ────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  invoice_id text unique,
  service text not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Contact Messages ────────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ── Notifications (in-app feed) ─────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  message text,
  data jsonb not null default '{}',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Admins can do anything with notifications" on public.notifications
  for all using (public.is_admin());

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text default null,
  p_data jsonb default '{}',
  p_link text default null
) returns uuid as $$
declare
  v_id uuid;
begin
  if auth.uid() != p_user_id and not public.is_admin() then
    raise exception 'Not authorized to create notification for another user';
  end if;
  insert into public.notifications (user_id, type, title, message, data, link)
  values (p_user_id, p_type, p_title, p_message, p_data, p_link)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

-- ── Invitations ─────────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id uuid not null primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  token text not null unique,
  invited_by uuid references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

create policy "Admins can do anything with invitations" on public.invitations
  for all using (public.is_admin());

create policy "Anyone can read invitation by token" on public.invitations
  for select using (status = 'pending');

create or replace function public.create_invitation(
  p_email text, p_company_name text default null, p_role text default 'client'
) returns uuid as $$
declare v_id uuid; v_token text;
begin
  if not public.is_admin() then raise exception 'Only admins can create invitations'; end if;
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.invitations (email, company_name, role, token, invited_by)
  values (p_email, p_company_name, p_role, v_token, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

create or replace function public.accept_invitation(p_token text) returns uuid as $$
declare v_id uuid;
begin
  update public.invitations set status = 'accepted', updated_at = now()
  where token = p_token and status = 'pending' and expires_at > now()
  returning id into v_id;
  if v_id is null then raise exception 'Invalid or expired invitation token'; end if;
  return v_id;
end;
$$ language plpgsql security definer;

-- ── Notification Preferences ────────────────────────────────────────────────
create table if not exists public.notification_preferences (
  id uuid not null primary key,
  user_id uuid references public.profiles(id),
  role text not null default 'client' check (role in ('client', 'admin')),
  email_enabled boolean not null default true,
  order_updates boolean not null default true,
  payment_updates boolean not null default true,
  document_updates boolean not null default true,
  marketing_emails boolean not null default false,
  order_placed boolean not null default true,
  order_status_changed boolean not null default true,
  document_ready boolean not null default true,
  payment_received boolean not null default true,
  weekly_summary boolean not null default false,
  admin_new_order boolean not null default true,
  admin_payment_failed boolean not null default true,
  admin_status_changed boolean not null default false,
  email_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_updates enable row level security;
alter table public.companies enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.notification_preferences enable row level security;

-- Helper: SECURITY DEFINER function to check admin role without triggering
-- infinite recursion when used inside RLS policies on the profiles table.
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$ language sql security definer stable;

-- Profiles: users can read/update/insert their own profile; admins can read/update/delete all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());
create policy "Admins can delete profiles" on public.profiles for delete using (public.is_admin());

-- Orders: users see their own; admins see all
create policy "Users can view own orders" on public.orders for select using (user_id = auth.uid());
create policy "Users can insert own orders" on public.orders for insert with check (user_id = auth.uid());
create policy "Admins can do anything with orders" on public.orders for all using (public.is_admin());

-- Companies: users see their own; admins see all
create policy "Users can view own companies" on public.companies for select using (user_id = auth.uid());
create policy "Admins can do anything with companies" on public.companies for all using (public.is_admin());

-- Documents: users see their own; admins see all
create policy "Users can view own documents" on public.documents for select using (user_id = auth.uid());
create policy "Users can insert own documents" on public.documents for insert with check (user_id = auth.uid());
create policy "Admins can do anything with documents" on public.documents for all using (public.is_admin());

-- Payments: users see their own; admins see all
create policy "Users can view own payments" on public.payments for select using (user_id = auth.uid());
create policy "Admins can do anything with payments" on public.payments for all using (public.is_admin());

-- Order updates: visible to order owner and admins
create policy "Users can view own order updates" on public.order_updates for select using (
  exists (select 1 from public.orders where orders.id = order_id and orders.user_id = auth.uid())
);
create policy "Admins can do anything with order updates" on public.order_updates for all using (public.is_admin());

-- Contact messages: anyone can insert; admins can read/manage
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
create policy "Admins can view contact messages" on public.contact_messages for select using (public.is_admin());

-- Notification preferences: users manage their own
create policy "Users can manage own notification prefs" on public.notification_preferences for all using (user_id = auth.uid());
