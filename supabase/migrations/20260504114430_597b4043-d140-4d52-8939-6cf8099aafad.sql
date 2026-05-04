-- Add attachment column to support messages
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS attachment_url text;

-- Allow content to be empty when an attachment is provided
ALTER TABLE public.support_messages
  ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.support_messages
  ADD CONSTRAINT support_messages_content_or_attachment
  CHECK (
    (content IS NOT NULL AND length(btrim(content)) > 0)
    OR attachment_url IS NOT NULL
  );

-- Create public bucket for support chat attachments (images shared with customer support)
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "Support attachments are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'support-attachments');

-- Authenticated users can upload to a folder named after their own user_id
CREATE POLICY "Users can upload their own support attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can upload anywhere in the bucket (to reply to any conversation)
CREATE POLICY "Admins can upload support attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments'
  AND public.is_admin(auth.uid())
);

-- Users can delete their own attachments; admins can delete any
CREATE POLICY "Users can delete their own support attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-attachments'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
);