
-- Allow admins to view all rooms regardless of status
CREATE POLICY "Admins can view all rooms"
ON public.rooms
FOR SELECT
USING (is_admin(auth.uid()));
