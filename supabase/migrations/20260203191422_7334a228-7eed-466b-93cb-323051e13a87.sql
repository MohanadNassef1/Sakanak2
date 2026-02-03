-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Verified users can view other verified profiles" ON public.profiles;

-- Create a security definer function to safely check user verification status
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_user_verified(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id
    AND verification_status = 'verified'
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Verified users can view other verified profiles"
ON public.profiles
FOR SELECT
USING (
  verification_status = 'verified' 
  AND public.is_user_verified(auth.uid())
);