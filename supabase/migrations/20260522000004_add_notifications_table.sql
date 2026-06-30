-- Notifications table for in-app notification feed
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

-- Users can read/update their own notifications
drop policy if exists "Users can view own notifications" on public.notifications
; create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications
; create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Admins can read/update all notifications, insert for any user
drop policy if exists "Admins can do anything with notifications" on public.notifications
; create policy "Admins can do anything with notifications" on public.notifications
  for all using (public.is_admin());

-- RPC: create a notification for any user (admin or self-service)
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

-- Index for common queries
create index if not exists idx_notifications_user_read
  on public.notifications (user_id, read, created_at desc);

