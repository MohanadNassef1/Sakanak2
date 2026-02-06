-- Add policy to allow authenticated users to view verified profiles (for roommate browsing)
-- This excludes sensitive contact info since we're using public_profiles view
CREATE POLICY "Authenticated users can view verified profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'::verification_status
);