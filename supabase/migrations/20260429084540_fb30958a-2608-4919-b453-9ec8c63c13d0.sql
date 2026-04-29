
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS rating smallint
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

CREATE POLICY "Users can view their own submissions by email"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
);
