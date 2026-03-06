CREATE POLICY "Only admins can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));