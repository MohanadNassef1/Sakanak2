-- Create atomic reservation confirmation function with row-level locking
CREATE OR REPLACE FUNCTION public.confirm_reservation(
  _reservation_id UUID,
  _user_id UUID
)
RETURNS TABLE (
  reservation_status TEXT,
  seeker_confirmed BOOLEAN,
  owner_confirmed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  -- Lock the row and get current state
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
  
  -- Validate user is a participant
  IF NOT (_is_seeker OR _is_owner) THEN
    RAISE EXCEPTION 'User is not a participant in this reservation';
  END IF;
  
  -- Only allow confirmation on paid reservations
  IF _current_status != 'paid' THEN
    RAISE EXCEPTION 'Reservation must be in paid status to confirm';
  END IF;
  
  -- Calculate new confirmation states
  _new_seeker_confirmed := CASE WHEN _is_seeker THEN true ELSE _current_seeker_confirmed END;
  _new_owner_confirmed := CASE WHEN _is_owner THEN true ELSE _current_owner_confirmed END;
  
  -- Determine new status
  _new_status := CASE 
    WHEN _new_seeker_confirmed AND _new_owner_confirmed THEN 'confirmed'
    ELSE _current_status
  END;
  
  -- Atomic update of reservation
  UPDATE reservations
  SET 
    seeker_confirmed = _new_seeker_confirmed,
    owner_confirmed = _new_owner_confirmed,
    status = _new_status
  WHERE id = _reservation_id;
  
  -- If both confirmed, update payout to processing
  IF _new_seeker_confirmed AND _new_owner_confirmed THEN
    UPDATE payouts
    SET status = 'processing'
    WHERE reservation_id = _reservation_id
    AND status = 'pending';
  END IF;
  
  -- Return the new state
  RETURN QUERY
  SELECT 
    r.status,
    r.seeker_confirmed,
    r.owner_confirmed
  FROM reservations r
  WHERE r.id = _reservation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.confirm_reservation(UUID, UUID) TO authenticated;