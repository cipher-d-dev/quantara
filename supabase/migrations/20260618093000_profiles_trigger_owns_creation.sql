-- Profiles are provisioned by public.handle_new_user() on auth.users inserts.
-- The browser client should not create profile rows during login or token refresh.

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
