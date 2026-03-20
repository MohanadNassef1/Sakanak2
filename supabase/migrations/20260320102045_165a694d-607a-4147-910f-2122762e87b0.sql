CREATE OR REPLACE FUNCTION public.get_viewing_participant_profile(_participant_id uuid)
 RETURNS TABLE(user_id uuid, full_name text, avatar_url text, age integer, occupation text, job_title text, university text, personality_tags text[], nationality text, verification_status text, occupation_status text, is_smoker boolean, has_pets boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
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
    p.occupation_status,
    p.is_smoker,
    p.has_pets
  FROM public.profiles p
  WHERE p.user_id = _participant_id
    AND EXISTS (
      SELECT 1 FROM public.viewing_requests vr
      WHERE (
        (vr.tenant_id = auth.uid() AND vr.landlord_id = _participant_id)
        OR
        (vr.landlord_id = auth.uid() AND vr.tenant_id = _participant_id)
      )
    )
  LIMIT 1;
$$;