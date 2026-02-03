-- Create storage bucket for room photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-photos', 'room-photos', true);

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload room photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'room-photos');

-- Allow anyone to view room photos (public)
CREATE POLICY "Anyone can view room photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own room photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'room-photos' AND auth.uid()::text = (storage.foldername(name))[1]);