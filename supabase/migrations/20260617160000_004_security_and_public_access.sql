-- Security: always assign student role on signup (ignore client metadata)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: prevent users from escalating their own role
DROP POLICY IF EXISTS update_own_profile ON profiles;

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );

-- Admin: read all profiles for dashboard stats and student management
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public course catalog: allow anonymous browsing of courses and slot counts
DROP POLICY IF EXISTS select_courses ON courses;

CREATE POLICY "select_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);

GRANT EXECUTE ON FUNCTION get_course_registration_counts() TO anon;
