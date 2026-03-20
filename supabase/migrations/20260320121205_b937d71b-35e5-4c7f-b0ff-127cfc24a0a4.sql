CREATE POLICY "Admins can read email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));