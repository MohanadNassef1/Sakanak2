CREATE OR REPLACE FUNCTION public.get_verified_room_owner_ids()
RETURNS TABLE(owner_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT r.owner_id
  FROM public.rooms r
  JOIN public.profiles p ON p.user_id = r.owner_id
  WHERE p.verification_status = 'verified'::public.verification_status
    AND r.status IN ('active'::public.listing_status, 'rented'::public.listing_status, 'expired'::public.listing_status);
$$;