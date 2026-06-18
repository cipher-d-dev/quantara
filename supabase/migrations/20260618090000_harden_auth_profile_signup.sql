-- Harden auth signup profile creation so profile issues do not abort auth.users inserts.
-- Supabase Auth surfaces trigger failures as "Database error saving new user".

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_email text;
  profile_name text;
BEGIN
  profile_email := COALESCE(NULLIF(NEW.email, ''), NEW.id::text || '@unknown.local');
  profile_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(profile_email, '@', 1),
    'New User'
  );

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, profile_name, profile_email, 'student')
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    email = EXCLUDED.email,
    role = public.profiles.role;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user failed for auth user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
