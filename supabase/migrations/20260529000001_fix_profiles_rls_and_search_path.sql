-- Fix 1: Prevent non-admin users from escalating their own role
-- A user with "Users can update own profile" policy could set role='admin'
-- (defined below with SET search_path)

-- Fix 2: Add SET search_path = public to all SECURITY DEFINER functions
-- to prevent search-path-based attacks

create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$ language sql security definer stable
set search_path = public;

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
$$ language plpgsql security definer
set search_path = public;

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
$$ language plpgsql security definer
set search_path = public;

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
$$ language plpgsql security definer
set search_path = public;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.email_confirmed_at is not null
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create or replace function public.sync_auth_user_update()
returns trigger as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at then
    update public.profiles
    set email_verified = new.email_confirmed_at is not null,
        email = coalesce(new.email, profiles.email),
        updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create or replace function public.get_invitation_by_token(p_token text)
returns table (
  id uuid,
  email text,
  company_name text,
  role text,
  status text,
  expires_at timestamptz
) language plpgsql security definer stable
set search_path = public
as $$
begin
  return query
  select i.id, i.email, i.company_name, i.role, i.status, i.expires_at
  from public.invitations i
  where i.token = p_token
    and i.status = 'pending'
    and i.expires_at > now();
end;
$$;

create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only administrators can change user roles';
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists prevent_role_escalation on public.profiles;
create trigger prevent_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_escalation();
