-- Add policy to allow authenticated users to view active rooms (for browsing)
CREATE POLICY "Authenticated users can view active rooms"
ON public.rooms
FOR SELECT
USING (
  status = 'active'::listing_status
  AND auth.uid() IS NOT NULL
);