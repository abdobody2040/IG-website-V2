-- Migration: Fix last_sign_in trigger bypass flag
-- 
-- The update_last_sign_in RPC sets a session config flag (app.bypass_profile_trigger = 'true')
-- so that the trigger on profiles doesn't fire. But the trigger function was never updated
-- to check this flag. This migration fixes that.
--
-- The app calls update_last_sign_in() RPC from useAuth.ts on every SIGNED_IN event.

-- 1. Find and replace any existing profiles UPDATE trigger function that blocks updates
--    We create a guard trigger function that:
--    a) Allows writes through when bypass flag is set (RPC path)
--    b) Prevents clients from setting their own role (security rule)

CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Allow the update_last_sign_in RPC to pass through
  IF current_setting('app.bypass_profile_trigger', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Prevent role escalation: clients cannot change their own role
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT is_admin() THEN
    NEW.role := OLD.role;
  END IF;

  -- Prevent users from modifying other users' profiles (enforced at DB level too)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop any existing profile update trigger to avoid conflicts
DROP TRIGGER IF EXISTS guard_profile_update_trigger ON public.profiles;

CREATE TRIGGER guard_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_update();

-- 2. Ensure update_last_sign_in RPC properly clears the bypass flag after update
CREATE OR REPLACE FUNCTION public.update_last_sign_in()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set bypass flag so the guard_profile_update_trigger allows this write
  PERFORM set_config('app.bypass_profile_trigger', 'true', true);

  UPDATE public.profiles
  SET last_sign_in = now(),
      updated_at   = now()
  WHERE id = auth.uid();

  -- Reset flag after update
  PERFORM set_config('app.bypass_profile_trigger', 'false', true);
END;
$$;

-- 3. Backfill: update email_verified for all existing profiles whose auth user has confirmed email
UPDATE public.profiles p
SET email_verified = (
  SELECT (au.email_confirmed_at IS NOT NULL)
  FROM auth.users au
  WHERE au.id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM auth.users au WHERE au.id = p.id
);
