-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  max_slots integer NOT NULL DEFAULT 30,
  registration_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Courses policies (everyone can view)
CREATE POLICY "select_courses" ON courses FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_insert_courses" ON courses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_update_courses" ON courses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_delete_courses" ON courses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Registrations policies
CREATE POLICY "select_own_registrations" ON registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_registrations" ON registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_registrations" ON registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin can view all registrations
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_course_id ON registrations(course_id);
CREATE INDEX idx_courses_registration_open ON courses(registration_open);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();