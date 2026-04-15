-- Add UPDATE and DELETE policies for decline-evidence bucket scoped to uploader
CREATE POLICY "Users can update their own evidence files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'decline-evidence' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'decline-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'decline-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);