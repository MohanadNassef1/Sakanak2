
-- 1. Drop and recreate public_rooms view without address
DROP VIEW IF EXISTS public.public_rooms;

CREATE VIEW public.public_rooms
WITH (security_invoker=on) AS
SELECT
  id, title, description, room_type, price_per_month, city, area,
  photos, amenities, rules, available_from, min_stay_months,
  max_roommates, current_roommates, preferred_gender,
  allows_smoking, allows_pets, is_featured, status,
  created_at, updated_at, has_natural_gas, has_wifi,
  has_elevator, has_balcony, has_doorman, has_ac,
  has_water_heater, allows_visits, total_bedrooms,
  location_link, lister_type, deposit, bills_included,
  personality_tags, is_student_listing, videos
FROM public.rooms
WHERE status IN ('active', 'rented', 'expired');

-- 2. Drop and recreate get_public_rooms without address
DROP FUNCTION IF EXISTS public.get_public_rooms();

CREATE FUNCTION public.get_public_rooms()
RETURNS TABLE(
  id uuid, title text, description text, room_type room_type,
  price_per_month numeric, city text, area text,
  photos text[], amenities text[], rules text[],
  available_from date, min_stay_months integer,
  max_roommates integer, current_roommates integer,
  preferred_gender text, allows_smoking boolean, allows_pets boolean,
  is_featured boolean, status listing_status,
  created_at timestamp with time zone, updated_at timestamp with time zone,
  has_natural_gas boolean, has_wifi boolean, has_elevator boolean,
  has_balcony boolean, has_doorman boolean, has_ac boolean,
  has_water_heater boolean, allows_visits boolean,
  total_bedrooms integer, location_link text, lister_type text,
  deposit numeric, bills_included text[], personality_tags text[],
  is_student_listing boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    r.id, r.title, r.description, r.room_type,
    r.price_per_month, r.city, r.area,
    r.photos, r.amenities, r.rules,
    r.available_from, r.min_stay_months,
    r.max_roommates, r.current_roommates,
    r.preferred_gender, r.allows_smoking, r.allows_pets,
    r.is_featured, r.status,
    r.created_at, r.updated_at,
    r.has_natural_gas, r.has_wifi, r.has_elevator,
    r.has_balcony, r.has_doorman, r.has_ac,
    r.has_water_heater, r.allows_visits,
    r.total_bedrooms, r.location_link, r.lister_type,
    r.deposit, r.bills_included, r.personality_tags,
    r.is_student_listing
  FROM public.rooms r
  WHERE r.status = ANY (ARRAY['active'::public.listing_status, 'rented'::public.listing_status, 'expired'::public.listing_status]);
$$;

-- 3. Update get_room_details to conditionally return address
CREATE OR REPLACE FUNCTION public.get_room_details(_room_id uuid)
RETURNS SETOF rooms
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _result public.rooms;
  _caller uuid;
  _can_see_address boolean := false;
BEGIN
  SELECT * INTO _result FROM public.rooms WHERE id = _room_id LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  _caller := auth.uid();

  -- Only show active, rented, or expired rooms (unless owner or admin)
  IF _result.status NOT IN ('active', 'rented', 'expired')
     AND _result.owner_id != COALESCE(_caller, '00000000-0000-0000-0000-000000000000'::uuid)
     AND NOT COALESCE(public.is_admin(_caller), false) THEN
    RETURN;
  END IF;

  -- Determine if caller can see the address
  IF _caller IS NOT NULL THEN
    IF _result.owner_id = _caller OR public.is_admin(_caller) THEN
      _can_see_address := true;
    ELSE
      IF EXISTS (
        SELECT 1 FROM public.viewing_requests vr
        WHERE vr.room_id = _room_id
          AND (vr.tenant_id = _caller OR vr.landlord_id = _caller)
          AND vr.status IN ('pending', 'counter_proposed', 'confirmed', 'completed', 'rental_confirmed')
      ) THEN
        _can_see_address := true;
      END IF;

      IF NOT _can_see_address AND EXISTS (
        SELECT 1 FROM public.reservations res
        WHERE res.room_id = _room_id
          AND (res.seeker_id = _caller OR res.owner_id = _caller)
      ) THEN
        _can_see_address := true;
      END IF;
    END IF;
  END IF;

  IF NOT _can_see_address THEN
    _result.address := NULL;
  END IF;

  RETURN NEXT _result;
END;
$$;
