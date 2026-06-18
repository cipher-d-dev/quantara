ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS package_type text NOT NULL DEFAULT 'basic'
    CHECK (package_type IN ('basic', 'pro')),
  ADD COLUMN IF NOT EXISTS delivery_location text NOT NULL DEFAULT 'The Engineering Civil Shed',
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS amount_kobo integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_payment_reference_key
  ON public.registrations (payment_reference)
  WHERE payment_reference IS NOT NULL;
