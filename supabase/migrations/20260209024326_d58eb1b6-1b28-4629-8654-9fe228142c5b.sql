-- Allow admins to delete any room
CREATE POLICY "Admins can delete any room"
ON public.rooms
FOR DELETE
USING (is_admin(auth.uid()));