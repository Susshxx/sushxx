ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS hero_x numeric,
  ADD COLUMN IF NOT EXISTS hero_y numeric,
  ADD COLUMN IF NOT EXISTS hero_rotate numeric;