-- =====================================================
-- SECURITY FIX: Protect Tenant Evidence from Landlords
-- =====================================================

-- Drop the policy that exposes sensitive evidence to landlords
DROP POLICY IF EXISTS "Landlords can view reports about them" ON public.decline_reports;

-- Create a new restricted policy - landlords can only see limited info (no evidence)
-- They can see a report exists but detailed evidence stays hidden
-- For now, remove landlord access entirely - admins handle this

-- =====================================================
-- SECURITY FIX: Restrict Profile Access to Business Relationships
-- =====================================================

-- Drop the overly permissive policy that allows ANY authenticated user to see ALL verified profiles
DROP POLICY IF EXISTS "Authenticated users can view verified profiles" ON public.profiles;

-- Create a new policy that only allows viewing profiles of users you have a business relationship with
-- Business relationships: viewing requests, reservations, or conversations
CREATE POLICY "Users can view profiles of business contacts"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'::verification_status
  AND (
    -- Users can always see their own profile
    user_id = auth.uid()
    OR
    -- Users involved in viewing requests can see each other
    EXISTS (
      SELECT 1 FROM viewing_requests vr
      WHERE (
        (vr.tenant_id = auth.uid() AND vr.landlord_id = profiles.user_id)
        OR (vr.landlord_id = auth.uid() AND vr.tenant_id = profiles.user_id)
      )
      AND vr.status != 'cancelled'::viewing_status
      AND vr.status != 'expired'::viewing_status
    )
    OR
    -- Users involved in reservations can see each other
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE (
        (r.seeker_id = auth.uid() AND r.owner_id = profiles.user_id)
        OR (r.owner_id = auth.uid() AND r.seeker_id = profiles.user_id)
      )
    )
    OR
    -- Users in conversations can see each other
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE (
        (c.participant_one = auth.uid() AND c.participant_two = profiles.user_id)
        OR (c.participant_two = auth.uid() AND c.participant_one = profiles.user_id)
      )
    )
    OR
    -- Room owners are visible to authenticated users (for room listings)
    EXISTS (
      SELECT 1 FROM rooms rm
      WHERE rm.owner_id = profiles.user_id
      AND rm.status = 'active'::listing_status
    )
  )
);