-- Create a function to get registration counts that bypasses RLS
-- This is safe because we're only returning aggregate counts, not individual registration data

-- First, drop the existing restrictive policy and create more permissive ones
DROP POLICY IF EXISTS select_own_registrations ON registrations;

-- Allow students to see their own registrations (using a function-based check)
CREATE POLICY "select_own_registrations" ON registrations FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create a secure function to get course registration counts
CREATE OR REPLACE FUNCTION get_course_registration_counts()
RETURNS TABLE(course_id uuid, count bigint)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT course_id, COUNT(*)::bigint as count
  FROM registrations
  GROUP BY course_id;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_course_registration_counts() TO authenticated;