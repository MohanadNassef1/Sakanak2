-- Fix: Restrict contact information exposure to room listing viewers
-- Issue: "Users can view basic info of room owners with active listings" policy exposes ALL columns
-- This allows any authenticated user to harvest email, phone, whatsapp of all landlords

-- Step 1: Drop the overly permissive policy that allows viewing ALL profile columns
DROP POLICY IF EXISTS "Users can view basic info of room owners with active listings" ON public.profiles;

-- Step 2: Drop and recreate public_profiles view to EXCLUDE sensitive fields
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker=on) AS
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
    age,
    personality_tags,
    university,
    job_title,
    created_at,
    -- Only expose a boolean "is_verified" flag, not the detailed status
    CASE WHEN verification_status = 'verified'::verification_status THEN true ELSE false END as is_verified
FROM public.profiles
WHERE verification_status = 'verified'::verification_status;

-- Step 3: Create a secure SECURITY DEFINER function to get room owner public info
-- This function returns ONLY safe public fields - no email, phone, whatsapp, or verification details
CREATE OR REPLACE FUNCTION public.get_room_owner_public_info(_owner_id uuid)
RETURNS TABLE (
    user_id uuid,
    full_name text,
    avatar_url text,
    gender public.user_gender,
    is_smoker boolean,
    has_pets boolean,
    pet_type text,
    occupation text,
    nationality text,
    about text,
    looking_for text,
    age integer,
    personality_tags text[],
    university text,
    job_title text,
    is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.user_id,
        p.full_name,
        p.avatar_url,
        p.gender,
        COALESCE(p.is_smoker, false),
        COALESCE(p.has_pets, false),
        p.pet_type,
        p.occupation,
        p.nationality,
        p.about,
        p.looking_for,
        p.age,
        p.personality_tags,
        p.university,
        p.job_title,
        (p.verification_status = 'verified'::verification_status) as is_verified
    FROM public.profiles p
    WHERE p.user_id = _owner_id
    AND p.verification_status = 'verified'::verification_status
    -- Ensure user has an active listing (authorization check)
    AND EXISTS (
        SELECT 1 FROM public.rooms r 
        WHERE r.owner_id = _owner_id 
        AND r.status = 'active'::listing_status
    )
    LIMIT 1;
$$;

-- Step 4: Update the "Users can view profiles of active business partners" policy
-- This was too permissive - exposing ALL columns for ANY reservation status
DROP POLICY IF EXISTS "Users can view profiles of active business partners" ON public.profiles;

-- Re-create with more restrictive access - only for reservation partners with active reservations
-- But STILL exposing all columns is wrong - we need to deny direct SELECT access for casual browsing
-- The contact info policy already handles confirmed reservations properly

-- Step 5: For listing browsing, we'll use the RPC function, not direct table access
-- For viewing/reservation partners who need contact info, the existing policies handle it

-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_room_owner_public_info(uuid) TO authenticated;