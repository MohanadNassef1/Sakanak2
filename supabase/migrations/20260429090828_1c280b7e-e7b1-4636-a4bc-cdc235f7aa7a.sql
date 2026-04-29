-- Replace policy that queries auth.users directly (causes "permission denied for table users")
DROP POLICY IF EXISTS "Users can view their own submissions by email" ON public.contact_submissions;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

CREATE POLICY "Users can view their own submissions by email"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (email = public.current_user_email());