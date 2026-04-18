CREATE POLICY "Anonymous users can view active rooms"
ON public.rooms FOR SELECT
TO anon
USING (status = 'active'::listing_status);

CREATE POLICY "Anonymous users can view rented rooms"
ON public.rooms FOR SELECT
TO anon
USING (status = 'rented'::listing_status);

CREATE POLICY "Anonymous users can view expired rooms"
ON public.rooms FOR SELECT
TO anon
USING (status = 'expired'::listing_status);