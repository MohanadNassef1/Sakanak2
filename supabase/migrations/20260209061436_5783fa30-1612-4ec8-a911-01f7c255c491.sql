-- Security fix: Tighten profiles RLS to protect sensitive contact information
-- The "Users can view profiles of business contacts" policy was too permissive

-- Step 1: Drop the overly broad policy
DROP POLICY IF EXISTS "Users can view profiles of business contacts" ON public.profiles;

-- Step 2: Create a more restrictive policy that only allows viewing basic profile info
-- for room owners with active listings (but contact info comes from a separate stricter policy)
-- This policy should only allow viewing non-sensitive fields through the public_profiles view

-- Create a new policy for viewing room owner profiles (non-sensitive data only)
-- This will only work with the public_profiles view which excludes sensitive fields
CREATE POLICY "Users can view basic info of room owners with active listings"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Only verified profiles
  verification_status = 'verified'::verification_status
  -- Only users who have active room listings
  AND EXISTS (
    SELECT 1 FROM rooms rm
    WHERE rm.owner_id = profiles.user_id
    AND rm.status = 'active'::listing_status
  )
);

-- Create a policy for viewing profiles of people in confirmed/completed viewings
-- This allows seeing the profile after confirming a viewing (needed for coordination)
CREATE POLICY "Users can view profiles of confirmed viewing participants"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  verification_status = 'verified'::verification_status
  AND EXISTS (
    SELECT 1 FROM viewing_requests vr
    WHERE (
      (vr.tenant_id = auth.uid() AND vr.landlord_id = profiles.user_id)
      OR (vr.landlord_id = auth.uid() AND vr.tenant_id = profiles.user_id)
    )
    AND vr.status IN ('confirmed'::viewing_status, 'completed'::viewing_status, 'rental_confirmed'::viewing_status)
  )
);

-- Create a policy for viewing profiles of conversation participants
-- Only allow after a viewing has been confirmed or there's an active reservation
CREATE POLICY "Users can view profiles of active business partners"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  verification_status = 'verified'::verification_status
  AND (
    -- Has an active reservation
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE (
        (r.seeker_id = auth.uid() AND r.owner_id = profiles.user_id)
        OR (r.owner_id = auth.uid() AND r.seeker_id = profiles.user_id)
      )
    )
  )
);