-- Grant SELECT on public_rooms view to anon and authenticated roles
-- This allows guests to browse room listings (per platform design)
GRANT SELECT ON public.public_rooms TO anon;
GRANT SELECT ON public.public_rooms TO authenticated;

-- Grant SELECT on public_profiles view to anon and authenticated roles
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Update the rooms RLS policy to allow public/guest access for browsing active rooms
-- Drop the old policy that required auth
DROP POLICY IF EXISTS "Authenticated users can view active rooms" ON public.rooms;

-- Create new policy that allows anyone (including guests) to view active rooms
CREATE POLICY "Anyone can view active rooms"
ON public.rooms
FOR SELECT
USING (status = 'active'::listing_status);