-- Create music storage bucket for audio file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read music files
CREATE POLICY "Anyone can read music files"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- Allow admins to upload music files
CREATE POLICY "Admins can upload music files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Allow admins to update music files
CREATE POLICY "Admins can update music files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Allow admins to delete music files
CREATE POLICY "Admins can delete music files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);