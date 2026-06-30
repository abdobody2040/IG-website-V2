-- Admin audit log table for tracking admin actions
create table if not exists public.admin_audit_log (
  id uuid not null primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  table_name text not null,
  record_id text not null,
  details text,
  created_at timestamptz not null default now()
);

-- Index for querying by admin and date
create index if not exists idx_admin_audit_admin on public.admin_audit_log(admin_id, created_at desc);
create index if not exists idx_admin_audit_action on public.admin_audit_log(action);
create index if not exists idx_admin_audit_record on public.admin_audit_log(table_name, record_id);

-- RLS: only admins can read; only admins can insert (via the application)
alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins can insert audit log" on public.admin_audit_log
; create policy "Admins can insert audit log" on public.admin_audit_log
  for insert with check (public.is_admin());

drop policy if exists "Admins can view audit log" on public.admin_audit_log
; create policy "Admins can view audit log" on public.admin_audit_log
  for select using (public.is_admin());

