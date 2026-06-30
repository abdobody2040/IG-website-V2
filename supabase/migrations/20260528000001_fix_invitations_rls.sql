-- Fix critical RLS vulnerability: invitations table allowed anyone to enumerate all pending invitations
-- Old policy leaked email, company_name, role, and token for ALL pending invitations
-- New approach: remove public select access, use an RPC to look up by token

-- Drop the vulnerable policy
drop policy if exists "Anyone can read invitation by token" on public.invitations;

-- Only admins can SELECT from the table directly (the admin policy already covers this)
-- The "Admins can do anything with invitations" policy at line 19 already grants SELECT to admins

-- Create a secure RPC for invitation lookup by token (used during signup)
create or replace function public.get_invitation_by_token(p_token text)
returns table (
  id uuid,
  email text,
  company_name text,
  role text,
  status text,
  expires_at timestamptz
) language plpgsql security definer stable as $$
begin
  return query
  select i.id, i.email, i.company_name, i.role, i.status, i.expires_at
  from public.invitations i
  where i.token = p_token
    and i.status = 'pending'
    and i.expires_at > now();
end;
$$;

-- Add ON DELETE CASCADE to foreign keys that reference profiles (user deletion)
-- Drop existing constraints and recreate with CASCADE
-- orders table
alter table public.orders
  drop constraint if exists orders_user_id_fkey,
  add constraint orders_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- companies table
alter table public.companies
  drop constraint if exists companies_user_id_fkey,
  add constraint companies_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- documents table
alter table public.documents
  drop constraint if exists documents_user_id_fkey,
  add constraint documents_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- payments table
alter table public.payments
  drop constraint if exists payments_user_id_fkey,
  add constraint payments_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

-- contact_messages table (nullable user_id)
alter table public.contact_messages
  drop constraint if exists contact_messages_user_id_fkey,
  add constraint contact_messages_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete set null;
