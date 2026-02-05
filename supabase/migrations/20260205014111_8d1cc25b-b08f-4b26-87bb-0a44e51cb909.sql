-- Fix public_profiles view: Only expose verified users' public info
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  gender,
  nationality,
  occupation,
  about,
  looking_for,
  is_smoker,
  has_pets,
  pet_type,
  verification_status,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';  -- Only show verified users publicly

-- Fix public_rooms view: Only expose active rooms, exclude internal business data
DROP VIEW IF EXISTS public.public_rooms;
CREATE VIEW public.public_rooms
WITH (security_invoker=on) AS
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
  owner_id,
  status,
  created_at,
  updated_at
  -- Excluded: insurance_amount, views_count (internal business data)
  -- Excluded: payout_details, owner_payout_method (sensitive)
FROM public.rooms
WHERE status = 'active';  -- Only show active listings publicly

-- Add SELECT policy on profiles for public view access (verified profiles only)
CREATE POLICY "Anyone can view verified profiles via public view"
ON public.profiles
FOR SELECT
USING (verification_status = 'verified');

-- Add SELECT policy on rooms for public view access (active rooms only)
CREATE POLICY "Anyone can view active rooms via public view"
ON public.rooms
FOR SELECT
USING (status = 'active');