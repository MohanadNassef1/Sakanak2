-- Add policy allowing admins to update profiles (needed for verification approval)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()));