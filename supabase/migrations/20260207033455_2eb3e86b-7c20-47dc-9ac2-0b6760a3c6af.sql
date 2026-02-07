-- Expose a safe, browseable roommate list without leaking PII from profiles
-- Uses SECURITY DEFINER to bypass RLS while returning ONLY non-sensitive columns.

CREATE OR REPLACE FUNCTION public.get_browsable_roommates(
  _search_query text DEFAULT NULL,
  _occupation text DEFAULT NULL,
  _is_smoker boolean DEFAULT NULL,
  _has_pets boolean DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  gender text,
  avatar_url text,
  about text,
  nationality text,
  occupation text,
  looking_for text,
  is_smoker boolean,
  has_pets boolean,
  pet_type text,
  verification_status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT
      p.user_id,
      p.gender,
      p.verification_status
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  ),
  params AS (
    SELECT
      NULLIF(left(trim(coalesce(_search_query, '')), 100), '') AS q,
      NULLIF(left(trim(coalesce(_occupation, '')), 100), '') AS occ,
      _is_smoker AS smoker,
      _has_pets AS pets
  )
  SELECT
    p.user_id,
    p.full_name,
    p.gender::text,
    p.avatar_url,
    p.about,
    p.nationality,
    p.occupation,
    p.looking_for,
    coalesce(p.is_smoker, false) AS is_smoker,
    coalesce(p.has_pets, false) AS has_pets,
    p.pet_type,
    p.verification_status::text,
    p.created_at
  FROM public.profiles p
  CROSS JOIN me
  CROSS JOIN params
  WHERE auth.uid() IS NOT NULL
    -- Only verified users can browse roommates
    AND me.verification_status = 'verified'::public.verification_status
    -- Only verified roommates are shown
    AND p.verification_status = 'verified'::public.verification_status
    -- Strict gender separation
    AND p.gender = me.gender
    -- Don't return yourself
    AND p.user_id <> me.user_id
    -- Filters
    AND (params.smoker IS NULL OR p.is_smoker = params.smoker)
    AND (params.pets IS NULL OR p.has_pets = params.pets)
    AND (params.occ IS NULL OR p.occupation ILIKE '%' || params.occ || '%')
    AND (
      params.q IS NULL OR (
        p.full_name ILIKE '%' || params.q || '%'
        OR coalesce(p.about, '') ILIKE '%' || params.q || '%'
        OR coalesce(p.occupation, '') ILIKE '%' || params.q || '%'
      )
    )
  ORDER BY p.created_at DESC;
$$;


CREATE OR REPLACE FUNCTION public.get_browsable_roommate(
  _roommate_user_id uuid
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  gender text,
  avatar_url text,
  about text,
  nationality text,
  occupation text,
  looking_for text,
  is_smoker boolean,
  has_pets boolean,
  pet_type text,
  verification_status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT
      p.user_id,
      p.gender,
      p.verification_status
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  )
  SELECT
    p.user_id,
    p.full_name,
    p.gender::text,
    p.avatar_url,
    p.about,
    p.nationality,
    p.occupation,
    p.looking_for,
    coalesce(p.is_smoker, false) AS is_smoker,
    coalesce(p.has_pets, false) AS has_pets,
    p.pet_type,
    p.verification_status::text,
    p.created_at
  FROM public.profiles p
  CROSS JOIN me
  WHERE auth.uid() IS NOT NULL
    AND me.verification_status = 'verified'::public.verification_status
    AND p.user_id = _roommate_user_id
    AND p.verification_status = 'verified'::public.verification_status
    AND p.gender = me.gender
    AND p.user_id <> me.user_id
  LIMIT 1;
$$;