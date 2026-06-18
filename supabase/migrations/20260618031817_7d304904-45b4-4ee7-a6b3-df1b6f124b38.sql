-- Public read for project-media bucket (assets are non-sensitive cover images/videos)
DROP POLICY IF EXISTS "Public read project-media" ON storage.objects;
CREATE POLICY "Public read project-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-media');
