-- Fix the SECURITY DEFINER view issue by using SECURITY INVOKER (default)
-- Drop and recreate views with explicit SECURITY INVOKER

DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.public_rooms;

-- Recreate public_profiles view with SECURITY INVOKER (explicit)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  verification_status,
  looking_for,
  gender,
  about,
  occupation,
  nationality,
  is_smoker,
  has_pets,
  pet_type,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';

-- Recreate public_rooms view with SECURITY INVOKER (explicit)
CREATE VIEW public.public_rooms
WITH (security_invoker = true)
AS
SELECT 
  id,
  owner_id,
  title,
  description,
  room_type,
  price_per_month,
  city,
  area,
  address,
  photos,
  amenities,
  rules,
  available_from,
  min_stay_months,
  max_roommates,
  current_roommates,
  preferred_gender,
  allows_smoking,
  allows_pets,
  is_featured,
  status,
  views_count,
  insurance_amount,
  created_at,
  updated_at
FROM public.rooms
WHERE status = 'active';

-- Grant access to the public views
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_rooms TO anon, authenticated;