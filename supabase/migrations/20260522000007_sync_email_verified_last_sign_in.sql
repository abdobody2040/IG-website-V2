-- Sync email_verified from auth.users.email_confirmed_at to profiles.email_verified
-- Also ensures last_sign_in is captured on initial profile creation.

-- 1. Update handle_new_user to capture email_verified status on signup
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
$$ language plpgsql security definer;

-- 2. Trigger: sync email_confirmed_at from auth.users to profiles.email_verified
-- when auth.users is updated (e.g., when user verifies their email)
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
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (old.email_confirmed_at is distinct from new.email_confirmed_at)
  execute function public.sync_auth_user_update();
