-- Fix linter ERROR: remove security-definer view behavior from public_rooms by rebuilding it as a security_invoker view over a safe SECURITY DEFINER function

CREATE OR REPLACE FUNCTION public.get_public_rooms()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  room_type public.room_type,
  price_per_month numeric,
  city text,
  area text,
  address text,
  photos text[],
  amenities text[],
  rules text[],
  available_from date,
  min_stay_months integer,
  max_roommates integer,
  current_roommates integer,
  preferred_gender text,
  allows_smoking boolean,
  allows_pets boolean,
  is_featured boolean,
  status public.listing_status,
  created_at timestamptz,
  updated_at timestamptz,
  has_natural_gas boolean,
  has_wifi boolean,
  has_elevator boolean,
  has_balcony boolean,
  has_doorman boolean,
  has_ac boolean,
  has_water_heater boolean,
  allows_visits boolean,
  total_bedrooms integer,
  location_link text,
  lister_type text,
  deposit numeric,
  bills_included text[],
  personality_tags text[],
  is_student_listing boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.title,
    r.description,
    r.room_type,
    r.price_per_month,
    r.city,
    r.area,
    r.address,
    r.photos,
    r.amenities,
    r.rules,
    r.available_from,
    r.min_stay_months,
    r.max_roommates,
    r.current_roommates,
    r.preferred_gender,
    r.allows_smoking,
    r.allows_pets,
    r.is_featured,
    r.status,
    r.created_at,
    r.updated_at,
    r.has_natural_gas,
    r.has_wifi,
    r.has_elevator,
    r.has_balcony,
    r.has_doorman,
    r.has_ac,
    r.has_water_heater,
    r.allows_visits,
    r.total_bedrooms,
    r.location_link,
    r.lister_type,
    r.deposit,
    r.bills_included,
    r.personality_tags,
    r.is_student_listing
  FROM public.rooms r
  WHERE r.status = ANY (ARRAY['active'::public.listing_status, 'rented'::public.listing_status, 'expired'::public.listing_status]);
$$;

DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms
WITH (security_invoker = on)
AS
  SELECT *
  FROM public.get_public_rooms();
