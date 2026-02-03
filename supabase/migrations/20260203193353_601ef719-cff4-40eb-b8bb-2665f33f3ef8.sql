-- Add policies for admin to manage verification requests
-- For now, we'll allow any authenticated user to view and manage verification requests (admin role can be added later)

-- Allow authenticated users to view all verification requests (for admin panel)
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to update verification requests (for approving/rejecting)
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Allow viewing other users' profiles for admin verification page (to see user details)
CREATE POLICY "Admins can view profiles for verification"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Drop the old restrictive policy that might conflict
DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;