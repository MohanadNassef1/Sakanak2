-- Allow authenticated users to read profiles of verified users (for viewing cards, host cards, etc.)
-- This is needed because public_profiles view uses security_invoker=on
CREATE POLICY "Authenticated users can view verified profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'::verification_status
);
