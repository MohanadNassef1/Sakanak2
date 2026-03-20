CREATE POLICY "Admins can update all viewing requests"
ON public.viewing_requests
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));