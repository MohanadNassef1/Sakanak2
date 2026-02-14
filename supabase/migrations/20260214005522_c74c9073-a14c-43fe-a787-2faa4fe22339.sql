-- SECURITY FIX: Remove overly broad profile access policy that exposes contact info
-- The "Authenticated users can view verified profiles" policy allows ANY authenticated
-- user to see ALL columns including email, phone, whatsapp of verified profiles.
-- Replace with targeted conversation partner policy.

-- Drop the overly broad policy
DROP POLICY IF EXISTS "Authenticated users can view verified profiles" ON public.profiles;

-- Add conversation participant policy (allows viewing basic profile of conversation partners)
-- Combined with the public_profiles view, this ensures only non-sensitive fields are exposed
CREATE POLICY "Users can view profiles of conversation partners"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'::verification_status
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (
      (c.participant_one = auth.uid() AND c.participant_two = profiles.user_id)
      OR (c.participant_two = auth.uid() AND c.participant_one = profiles.user_id)
    )
  )
);