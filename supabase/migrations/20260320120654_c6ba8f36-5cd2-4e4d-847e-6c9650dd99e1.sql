CREATE POLICY "Admins can read email send log"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read email send state"
ON public.email_send_state
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));