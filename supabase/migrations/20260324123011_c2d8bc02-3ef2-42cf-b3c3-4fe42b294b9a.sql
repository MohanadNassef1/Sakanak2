ALTER POLICY "Verified users can create reservations" ON public.reservations
  WITH CHECK (seeker_id = auth.uid() AND is_user_verified(auth.uid()) AND seeker_id != owner_id);