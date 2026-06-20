-- Move outline_url from courses (if added) to registrations
ALTER TABLE public.courses DROP COLUMN IF EXISTS outline_url;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS outline_url text;

-- Storage bucket for student-uploaded course outlines
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-outlines', 'course-outlines', true)
ON CONFLICT (id) DO NOTHING;

-- Students can upload their own outlines
DO $$ BEGIN
  CREATE POLICY "student_upload_outlines"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-outlines');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins can delete
DO $$ BEGIN
  CREATE POLICY "admin_delete_outlines"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'course-outlines' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Public read
DO $$ BEGIN
  CREATE POLICY "public_read_outlines"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'course-outlines');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
