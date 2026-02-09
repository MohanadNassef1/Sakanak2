-- Fix: Only share contact information after BOTH parties confirm the reservation
-- This prevents premature exposure of contact info when reservation is just 'paid'

DROP POLICY IF EXISTS "Users can view contact info of reservation partners" ON public.profiles;

CREATE POLICY "Users can view contact info of confirmed reservation partners"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'::verification_status
  AND is_user_verified(auth.uid())
  AND (
    -- Seeker viewing owner's contact info
    EXISTS (
      SELECT 1 FROM reservations
      WHERE seeker_id = auth.uid() 
        AND owner_id = profiles.user_id
        AND status IN ('confirmed', 'completed')
        AND seeker_confirmed = true
        AND owner_confirmed = true
    )
    OR
    -- Owner viewing seeker's contact info
    EXISTS (
      SELECT 1 FROM reservations
      WHERE owner_id = auth.uid() 
        AND seeker_id = profiles.user_id
        AND status IN ('confirmed', 'completed')
        AND seeker_confirmed = true
        AND owner_confirmed = true
    )
  )
);