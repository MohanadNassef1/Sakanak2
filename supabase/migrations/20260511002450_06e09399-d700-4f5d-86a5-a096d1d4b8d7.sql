
-- Make support-attachments private and restrict access
UPDATE storage.buckets SET public = false WHERE id = 'support-attachments';

DROP POLICY IF EXISTS "Support attachments are publicly readable" ON storage.objects;

CREATE POLICY "Support attachments readable by participants and admins"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND (
    public.is_admin(auth.uid())
    OR (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.support_conversations sc
      WHERE sc.id::text = (storage.foldername(name))[2]
        AND sc.user_id = auth.uid()
    )
  )
);
