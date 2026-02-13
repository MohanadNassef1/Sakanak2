-- Allow anyone to view rented rooms (they're already visible as active, just adding rented status)
CREATE POLICY "Anyone can view rented rooms"
ON public.rooms
FOR SELECT
USING (status = 'rented'::listing_status);

-- Set public_rooms view to security_invoker so it respects RLS
ALTER VIEW public.public_rooms SET (security_invoker = on);