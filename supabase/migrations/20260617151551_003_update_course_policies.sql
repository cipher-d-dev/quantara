-- Ensure courses are visible to all authenticated users (already done but let's verify)
-- The existing policy should work, but let's make it explicit

-- Update the existing policy to be more permissive
DROP POLICY IF EXISTS select_courses ON courses;

CREATE POLICY "select_courses" ON courses FOR SELECT
  TO authenticated USING (true);