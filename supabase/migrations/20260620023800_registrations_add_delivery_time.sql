ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS delivery_time timestamptz;
