-- RPC function to update last_sign_in for the authenticated user.
-- Sets a custom GUC flag so the profiles trigger can allow this update
-- without acquiring an ACCESS EXCLUSIVE table lock.
CREATE OR REPLACE FUNCTION public.update_last_sign_in()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.bypass_profile_trigger', 'true', true);

  UPDATE public.profiles
  SET last_sign_in = now()
  WHERE id = auth.uid();
END;
$$;

-- IMPORTANT: The trigger function guarding profiles must also be updated
-- to check this flag. Add this at the TOP of the trigger function body:
--
--   IF current_setting('app.bypass_profile_trigger', true) = 'true' THEN
--     RETURN NEW;
--   END IF;
--
-- To find your trigger function, run:
--   SELECT p.proname, pg_get_functiondef(p.oid)
--   FROM pg_trigger t
--   JOIN pg_proc p ON t.tgfoid = p.oid
--   JOIN pg_class c ON t.tgrelid = c.oid
--   WHERE c.relname = 'profiles' AND NOT t.tgisinternal AND t.tgtype & 16 = 16;
