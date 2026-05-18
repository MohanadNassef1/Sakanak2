
-- Fix 1: confirm_reservation must verify caller identity
CREATE OR REPLACE FUNCTION public.confirm_reservation(_reservation_id uuid, _user_id uuid)
 RETURNS TABLE(reservation_status text, seeker_confirmed boolean, owner_confirmed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _is_seeker BOOLEAN;
  _is_owner BOOLEAN;
  _current_seeker_confirmed BOOLEAN;
  _current_owner_confirmed BOOLEAN;
  _new_seeker_confirmed BOOLEAN;
  _new_owner_confirmed BOOLEAN;
  _new_status TEXT;
  _current_status TEXT;
BEGIN
  -- Caller identity check: prevent confirming on behalf of another user
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'User identity mismatch';
  END IF;

  SELECT 
    seeker_id = _user_id,
    owner_id = _user_id,
    r.seeker_confirmed,
    r.owner_confirmed,
    r.status
  INTO _is_seeker, _is_owner, _current_seeker_confirmed, _current_owner_confirmed, _current_status
  FROM reservations r
  WHERE id = _reservation_id
  FOR UPDATE;
  
  IF NOT (_is_seeker OR _is_owner) THEN
    RAISE EXCEPTION 'User is not a participant in this reservation';
  END IF;
  
  IF _current_status != 'paid' THEN
    RAISE EXCEPTION 'Reservation must be in paid status to confirm';
  END IF;
  
  _new_seeker_confirmed := CASE WHEN _is_seeker THEN true ELSE _current_seeker_confirmed END;
  _new_owner_confirmed := CASE WHEN _is_owner THEN true ELSE _current_owner_confirmed END;
  
  _new_status := CASE 
    WHEN _new_seeker_confirmed AND _new_owner_confirmed THEN 'confirmed'
    ELSE _current_status
  END;
  
  UPDATE reservations
  SET 
    seeker_confirmed = _new_seeker_confirmed,
    owner_confirmed = _new_owner_confirmed,
    status = _new_status
  WHERE id = _reservation_id;
  
  IF _new_seeker_confirmed AND _new_owner_confirmed THEN
    UPDATE payouts
    SET status = 'processing'
    WHERE reservation_id = _reservation_id
    AND status = 'pending';
  END IF;
  
  RETURN QUERY
  SELECT 
    r.status,
    r.seeker_confirmed,
    r.owner_confirmed
  FROM reservations r
  WHERE r.id = _reservation_id;
END;
$function$;

-- Fix 2: get_referral_stats must require admin
CREATE OR REPLACE FUNCTION public.get_referral_stats()
 RETURNS TABLE(user_id uuid, full_name text, referral_code text, total_signups bigint, verified_signups bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.user_id,
    p.full_name,
    p.referral_code,
    COUNT(r.user_id) as total_signups,
    COUNT(r.user_id) FILTER (WHERE r.verification_status = 'verified') as verified_signups
  FROM public.profiles p
  LEFT JOIN public.profiles r ON r.referred_by = p.referral_code
  WHERE p.referral_code IS NOT NULL
    AND public.is_admin(auth.uid())
  GROUP BY p.user_id, p.full_name, p.referral_code
  ORDER BY verified_signups DESC, total_signups DESC;
$function$;
