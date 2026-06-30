-- Invitations table for admin-invited user signups
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

-- Admins can do everything; clients can only read their own invitation by token
drop policy if exists "Admins can do anything with invitations" on public.invitations
; create policy "Admins can do anything with invitations" on public.invitations
  for all using (public.is_admin());

-- Allow reading a pending invitation by token (for signup validation)
drop policy if exists "Anyone can read invitation by token" on public.invitations
; create policy "Anyone can read invitation by token" on public.invitations
  for select using (status = 'pending');

-- RPC: create an invitation
create or replace function public.create_invitation(
  p_email text,
  p_company_name text default null,
  p_role text default 'client'
) returns uuid as $$
declare
  v_id uuid;
  v_token text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create invitations';
  end if;
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.invitations (email, company_name, role, token, invited_by)
  values (p_email, p_company_name, p_role, v_token, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

-- RPC: accept an invitation (called during signup)
create or replace function public.accept_invitation(p_token text)
returns uuid as $$
declare
  v_id uuid;
begin
  update public.invitations
  set status = 'accepted', updated_at = now()
  where token = p_token and status = 'pending' and expires_at > now()
  returning id into v_id;
  if v_id is null then
    raise exception 'Invalid or expired invitation token';
  end if;
  return v_id;
end;
$$ language plpgsql security definer;

create index if not exists idx_invitations_token on public.invitations (token);
create index if not exists idx_invitations_email on public.invitations (email);

