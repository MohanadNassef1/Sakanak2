
-- Allow admins to update any room (needed for status management)
CREATE POLICY "Admins can update any room"
ON public.rooms
FOR UPDATE
USING (is_admin(auth.uid()));
