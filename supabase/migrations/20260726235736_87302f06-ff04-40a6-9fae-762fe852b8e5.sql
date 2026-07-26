CREATE POLICY "Admins can view all viewing messages"
ON public.viewing_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));