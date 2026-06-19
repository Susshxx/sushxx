ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS hero_mobile_x numeric,
  ADD COLUMN IF NOT EXISTS hero_mobile_y numeric;

-- Lock contact_messages reads from public Data API (admin reads via service role)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
      AND policyname = 'Block public read of contact messages'
  ) THEN
    CREATE POLICY "Block public read of contact messages"
      ON public.contact_messages
      FOR SELECT
      USING (false);
  END IF;
END $$;