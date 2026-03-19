-- Fix: rebuild public_profiles safely (drop first to allow column shape changes)

-- 1) Create/replace SECURITY DEFINER function that returns only profiles the caller is allowed to see
CREATE OR REPLACE FUNCTION public.get_accessible_public_profiles()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  about text,
  nationality text,
  occupation text,
  looking_for text,
  is_smoker boolean,
  has_pets boolean,
  pet_type text,
  created_at timestamptz,
  age integer,
  job_title text,
  university text,
  personality_tags text[],
  gender public.user_gender,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ctx AS (
    SELECT
      auth.uid() AS me_id,
      auth.role() AS role,
      COALESCE(public.is_admin(auth.uid()), false) AS is_admin
  ),
  allowed_ids AS (
    SELECT ctx.me_id AS user_id
    FROM ctx
    WHERE ctx.me_id IS NOT NULL

    UNION

    SELECT
      CASE
        WHEN c.participant_one = ctx.me_id THEN c.participant_two
        ELSE c.participant_one
      END AS user_id
    FROM ctx
    JOIN public.conversations c
      ON (c.participant_one = ctx.me_id OR c.participant_two = ctx.me_id)
    WHERE ctx.me_id IS NOT NULL

    UNION

    SELECT
      CASE
        WHEN vr.tenant_id = ctx.me_id THEN vr.landlord_id
        ELSE vr.tenant_id
      END AS user_id
    FROM ctx
    JOIN public.viewing_requests vr
      ON (vr.tenant_id = ctx.me_id OR vr.landlord_id = ctx.me_id)
    WHERE ctx.me_id IS NOT NULL
      AND vr.status NOT IN ('cancelled'::public.viewing_status, 'expired'::public.viewing_status)

    UNION

    SELECT
      CASE
        WHEN r.seeker_id = ctx.me_id THEN r.owner_id
        ELSE r.seeker_id
      END AS user_id
    FROM ctx
    JOIN public.reservations r
      ON (r.seeker_id = ctx.me_id OR r.owner_id = ctx.me_id)
    WHERE ctx.me_id IS NOT NULL
      AND r.status = ANY (ARRAY['confirmed'::text, 'completed'::text])
  )
  SELECT
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.about,
    p.nationality,
    p.occupation,
    p.looking_for,
    COALESCE(p.is_smoker, false) AS is_smoker,
    COALESCE(p.has_pets, false) AS has_pets,
    p.pet_type,
    p.created_at,
    p.age,
    p.job_title,
    p.university,
    p.personality_tags,
    p.gender,
    (p.verification_status = 'verified'::public.verification_status) AS is_verified
  FROM ctx
  JOIN public.profiles p
    ON (
      ctx.role = 'service_role'
      OR ctx.is_admin
      OR (ctx.me_id IS NOT NULL AND p.user_id IN (SELECT user_id FROM allowed_ids WHERE user_id IS NOT NULL))
    );
$$;

-- 2) Drop & recreate the view to avoid CREATE OR REPLACE column-shape conflicts
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
  SELECT *
  FROM public.get_accessible_public_profiles();

-- 3) Attach profile protection triggers
DROP TRIGGER IF EXISTS trg_profiles_prevent_gender_change ON public.profiles;
CREATE TRIGGER trg_profiles_prevent_gender_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_gender_change();

DROP TRIGGER IF EXISTS trg_profiles_protect_sensitive_fields ON public.profiles;
CREATE TRIGGER trg_profiles_protect_sensitive_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_sensitive_profile_fields();

-- 4) Attach reservation protection trigger
DROP TRIGGER IF EXISTS trg_reservations_protect_fields ON public.reservations;
CREATE TRIGGER trg_reservations_protect_fields
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.protect_reservation_fields();
