-- Fix security definer view by using security invoker instead
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  description,
  city,
  area,
  address,
  photos,
  amenities,
  rules,
  preferred_gender,
  room_type,
  price_per_month,
  available_from,
  min_stay_months,
  max_roommates,
  current_roommates,
  allows_smoking,
  allows_pets,
  is_featured,
  status,
  created_at,
  updated_at,
  has_natural_gas,
  has_wifi,
  has_elevator,
  has_balcony,
  has_doorman,
  has_ac,
  has_water_heater,
  allows_visits,
  total_bedrooms,
  location_link
FROM public.rooms
WHERE status = 'active';