-- Fix 3 error-level security vulnerabilities

-- 1. Remove overly permissive policy that exposes payout_details and owner_payout_method
DROP POLICY IF EXISTS "Authenticated users can view active room details" ON public.rooms;

-- 2. Recreate public_profiles view with security_invoker to respect RLS
-- Also restrict to verified users only and exclude any sensitive fields
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = on) AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  gender,
  is_smoker,
  has_pets,
  pet_type,
  occupation,
  nationality,
  about,
  looking_for,
  verification_status,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';

-- 3. Recreate public_rooms view with security_invoker and exclude owner_id
-- This prevents tracking of which users own which properties
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms 
WITH (security_invoker = on) AS
SELECT 
  id,
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
  allows_smoking,
  allows_pets,
  preferred_gender,
  is_featured,
  status,
  created_at,
  updated_at
FROM public.rooms
WHERE status = 'active';

-- Grant access to authenticated users for the views
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_rooms TO authenticated, anon;