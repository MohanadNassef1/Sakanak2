-- Fix site_ratings spoofing: enforce ownership on INSERT
DROP POLICY IF EXISTS "Anyone can submit a rating" ON public.site_ratings;

CREATE POLICY "Anyone can submit a rating"
ON public.site_ratings
FOR INSERT
TO public
WITH CHECK (
  -- Anonymous: must not claim a user_id and must not spoof an email
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  -- Authenticated: user_id must match the caller, and if user_email is set it must match
  (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
    AND (user_email IS NULL OR user_email = public.current_user_email())
  )
);