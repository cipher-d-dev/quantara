-- Fix infinite recursion in profiles select policy by using a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old recursive select policy
DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;

-- Recreate the admin select policy using the secure function
CREATE POLICY "admin_select_profiles" ON public.profiles FOR SELECT
  TO authenticated
  USING (public.check_user_is_admin(auth.uid()));

-- Also update course admin policies to use the new function (cleaner & faster)
DROP POLICY IF EXISTS "admin_insert_courses" ON public.courses;
DROP POLICY IF EXISTS "admin_update_courses" ON public.courses;
DROP POLICY IF EXISTS "admin_delete_courses" ON public.courses;

CREATE POLICY "admin_insert_courses" ON public.courses FOR INSERT
  TO authenticated WITH CHECK (public.check_user_is_admin(auth.uid()));

CREATE POLICY "admin_update_courses" ON public.courses FOR UPDATE
  TO authenticated USING (public.check_user_is_admin(auth.uid()));

CREATE POLICY "admin_delete_courses" ON public.courses FOR DELETE
  TO authenticated USING (public.check_user_is_admin(auth.uid()));
