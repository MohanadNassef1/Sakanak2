-- Fix security definer view by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public_rooms;
CREATE VIEW public_rooms 
WITH (security_invoker = on)
AS
SELECT 
  id, title, description, room_type, price_per_month, city, area, address,
  photos, amenities, rules, available_from, min_stay_months, max_roommates,
  current_roommates, preferred_gender, allows_smoking, allows_pets,
  is_featured, status, created_at, updated_at, has_natural_gas, has_wifi,
  has_elevator, has_balcony, has_doorman, has_ac, has_water_heater,
  allows_visits, total_bedrooms, location_link,
  lister_type, deposit, bills_included, personality_tags
FROM public.rooms
WHERE status = 'active';