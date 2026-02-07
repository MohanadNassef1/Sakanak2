-- Add missing columns to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS lister_type text CHECK (lister_type IN ('landlord', 'current_tenant')) DEFAULT 'landlord',
ADD COLUMN IF NOT EXISTS deposit numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS bills_included text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS personality_tags text[] DEFAULT '{}'::text[];

-- Add missing columns to profiles table (age, university, bio)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS bio text;

-- Update public_rooms view to include new columns
DROP VIEW IF EXISTS public_rooms;
CREATE VIEW public_rooms AS
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