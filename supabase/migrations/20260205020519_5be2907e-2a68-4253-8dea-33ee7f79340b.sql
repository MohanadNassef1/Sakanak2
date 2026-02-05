-- =============================================
-- ADD POLICY FOR VIEWING ACTIVE ROOM DETAILS
-- =============================================
-- The useRoom hook fetches individual room details for the room detail page
-- This needs to work for all authenticated users viewing active listings
-- Note: payout_details are only shown to owners (controlled by application logic)

CREATE POLICY "Authenticated users can view active room details"
ON public.rooms FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND status = 'active'
);