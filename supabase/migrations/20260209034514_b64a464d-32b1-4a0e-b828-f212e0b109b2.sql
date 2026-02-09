-- Add policy for admins to delete any profile
CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
USING (is_admin(auth.uid()));