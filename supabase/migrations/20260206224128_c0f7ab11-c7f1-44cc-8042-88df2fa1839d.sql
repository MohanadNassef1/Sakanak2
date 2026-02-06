-- Add new room attribute columns for amenities
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_natural_gas boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_wifi boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_elevator boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_balcony boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_doorman boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_ac boolean DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS has_water_heater boolean DEFAULT false;

-- Add house rules column
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS allows_visits boolean DEFAULT true;

-- Add capacity field for total bedrooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS total_bedrooms integer DEFAULT 1;

-- Add location link field for Google Maps/Apple Maps
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS location_link text;

-- Update the public_rooms view to include new columns
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms AS
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