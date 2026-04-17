
-- 1. Add videos column to rooms
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}'::text[];

-- 2. Create public room-videos bucket (50MB limit, video mime types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-videos',
  'room-videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage policies for room-videos
CREATE POLICY "Room videos are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'room-videos');

CREATE POLICY "Authenticated users can upload room videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'room-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own room videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'room-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'room-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own room videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'room-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
