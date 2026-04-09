-- Fix 1: Replace the overly permissive room-photos INSERT policy with an ownership-scoped one
DROP POLICY IF EXISTS "Authenticated users can upload room photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload room photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Fix 2: Add admin SELECT policy for suppressed_emails
CREATE POLICY "Admins can view suppressed emails"
ON public.suppressed_emails
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
