
-- Allow admins to view any room owner's public info (bypass verification & active listing checks)
CREATE OR REPLACE FUNCTION public.get_room_owner_public_info(_owner_id uuid)
 RETURNS TABLE(user_id uuid, full_name text, avatar_url text, gender user_gender, is_smoker boolean, has_pets boolean, pet_type text, occupation text, nationality text, about text, looking_for text, age integer, personality_tags text[], university text, job_title text, is_verified boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND (
      -- Admins can see any owner
      is_admin(auth.uid())
      OR (
        -- Non-admins: original checks (temporarily relaxed - no verification required)
        EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.owner_id = _owner_id 
            AND r.status = 'active'::listing_status
        )
      )
    )
    LIMIT 1;
$function$;
