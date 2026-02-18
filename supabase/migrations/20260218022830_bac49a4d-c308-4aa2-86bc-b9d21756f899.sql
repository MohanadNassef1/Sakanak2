
-- Allow anyone to view expired (waiting list) rooms
CREATE POLICY "Anyone can view expired rooms"
ON public.rooms
FOR SELECT
USING (status = 'expired'::listing_status);
