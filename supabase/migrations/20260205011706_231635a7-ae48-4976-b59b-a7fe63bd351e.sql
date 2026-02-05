-- =====================================================
-- FIX 1: Room Owner Payment Details Exposure
-- Remove policy that allows anyone to view all room columns including payout_details
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active rooms without payout info" ON public.rooms;

-- Keep the existing owner view policy and add a new restricted public access policy
-- The public_rooms view already excludes payout_details and owner_payout_method
-- We need to ensure the app uses public_rooms for public listings

-- =====================================================
-- FIX 2: Profile Contact Information Exposure  
-- Remove policy allowing verified users to view all profile columns
-- Restrict contact info access to reservation partners only
-- =====================================================

DROP POLICY IF EXISTS "Verified users can view basic info of other verified profiles" ON public.profiles;

-- Create policy for reservation-based contact sharing
-- Seekers can view owner contact info for their active reservations
-- Owners can view seeker contact info for their active reservations
CREATE POLICY "Users can view contact info of reservation partners"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND verification_status = 'verified'
  AND is_user_verified(auth.uid())
  AND (
    -- Seeker can view owner's full profile for active reservations
    EXISTS (
      SELECT 1 FROM reservations
      WHERE seeker_id = auth.uid()
      AND owner_id = profiles.user_id
      AND status IN ('paid', 'confirmed', 'completed')
    )
    OR
    -- Owner can view seeker's full profile for active reservations
    EXISTS (
      SELECT 1 FROM reservations
      WHERE owner_id = auth.uid()
      AND seeker_id = profiles.user_id
      AND status IN ('paid', 'confirmed', 'completed')
    )
  )
);

-- =====================================================
-- FIX 3: Admins Cannot View Verification Documents
-- Add storage policy for admin access to verification documents
-- =====================================================

CREATE POLICY "Admins can view verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND public.is_admin(auth.uid())
);