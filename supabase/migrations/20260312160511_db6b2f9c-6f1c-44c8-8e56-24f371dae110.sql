
CREATE OR REPLACE FUNCTION public.get_viewing_participant_profile(_participant_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  age integer,
  occupation text,
  job_title text,
  university text,
  personality_tags text[],
  nationality text,
  verification_status text,
  occupation_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.age,
    p.occupation,
    p.job_title,
    p.university,
    p.personality_tags,
    p.nationality,
    p.verification_status::text,
    p.occupation_status
  FROM public.profiles p
  WHERE p.user_id = _participant_id
    -- Only allow if the caller shares a viewing with this user
    AND EXISTS (
      SELECT 1 FROM public.viewing_requests vr
      WHERE (
        (vr.tenant_id = auth.uid() AND vr.landlord_id = _participant_id)
        OR
        (vr.landlord_id = auth.uid() AND vr.tenant_id = _participant_id)
      )
      AND vr.status NOT IN ('cancelled', 'expired')
    )
  LIMIT 1;
$$;
