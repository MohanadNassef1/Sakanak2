
-- Fix 1: Create a secure function to get room details that masks payout info for non-owners
CREATE OR REPLACE FUNCTION public.get_room_details(_room_id uuid)
RETURNS SETOF public.rooms
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _result public.rooms;
BEGIN
  SELECT * INTO _result FROM public.rooms WHERE id = _room_id LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Only show active, rented, or expired rooms (unless owner or admin)
  IF _result.status NOT IN ('active', 'rented', 'expired') 
     AND _result.owner_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
     AND NOT COALESCE(public.is_admin(auth.uid()), false) THEN
    RETURN;
  END IF;
  
  -- Mask payout info for non-owners and non-admins
  IF _result.owner_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
     AND NOT COALESCE(public.is_admin(auth.uid()), false) THEN
    _result.owner_payout_method := NULL;
    _result.payout_details := NULL;
  END IF;
  
  RETURN NEXT _result;
END;
$$;

-- Fix 2: Remove the overly permissive "Anyone can view" policies that expose all columns
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can view expired rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can view rented rooms" ON public.rooms;

-- Fix 3: Replace with authenticated-user policies for direct table access (owners/admins already covered)
-- Authenticated users can view active/rented/expired rooms (needed for useRoom detail page)
CREATE POLICY "Authenticated users can view active rooms" ON public.rooms
FOR SELECT TO authenticated
USING (status = 'active'::listing_status);

CREATE POLICY "Authenticated users can view rented rooms" ON public.rooms
FOR SELECT TO authenticated
USING (status = 'rented'::listing_status);

CREATE POLICY "Authenticated users can view expired rooms" ON public.rooms
FOR SELECT TO authenticated
USING (status = 'expired'::listing_status);
