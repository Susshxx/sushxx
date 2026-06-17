
-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tech text[] NOT NULL DEFAULT '{}',
  cover_url text,
  video_url text,
  link_url text,
  featured boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT USING (true);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- experiences
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  company text NOT NULL,
  period text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experiences TO anon, authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences public read" ON public.experiences FOR SELECT USING (true);
CREATE TRIGGER experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- contact_messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages public insert" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- site_settings (key/value)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- seed data
INSERT INTO public.site_settings (key, value) VALUES
  ('sections_visibility', '{"projects": true, "experience": true, "contact": true}'::jsonb);

INSERT INTO public.projects (slug, title, description, tech, link_url, sort_order) VALUES
  ('aurora-os', 'Aurora OS', 'A speculative operating system concept exploring ambient computing and gestural navigation. Designed and prototyped end-to-end.', ARRAY['Figma','React','Three.js','GSAP'], 'https://example.com', 1),
  ('field-notes', 'Field Notes', 'A note-taking app for fieldwork researchers. Offline-first, voice transcription, and instant map pinning. Shipped to iOS and Android.', ARRAY['React Native','Expo','SQLite','Whisper'], 'https://example.com', 2),
  ('lumen-studio', 'Lumen Studio', 'Generative motion design playground that turns plain-English prompts into editable scene graphs.', ARRAY['Next.js','WebGL','TypeScript','LLM'], 'https://example.com', 3);

INSERT INTO public.experiences (role, company, period, summary, sort_order) VALUES
  ('Senior Product Designer', 'Northwind', '2023 — Present', 'Leading design systems and animation work across the consumer suite. Built the motion library now used in 14 surfaces.', 1),
  ('Design Engineer', 'Fjord & Loom', '2021 — 2023', 'Shipped flagship marketing site, interactive case studies, and the internal component library. Mentored 4 designers on code.', 2),
  ('Freelance Designer', 'Independent', '2018 — 2021', 'Brand systems, websites, and product launches for early-stage startups across fintech, climate, and consumer tools.', 3);
