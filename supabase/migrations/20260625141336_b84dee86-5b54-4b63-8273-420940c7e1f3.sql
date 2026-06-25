DROP POLICY IF EXISTS "Verified users can create reservations" ON public.reservations;
CREATE POLICY "Verified users can create reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
  seeker_id = auth.uid()
  AND is_user_verified(auth.uid())
  AND seeker_id <> owner_id
  AND status = 'pending_payment'
  AND seeker_confirmed = false
  AND owner_confirmed = false
);