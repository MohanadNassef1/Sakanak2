
CREATE OR REPLACE FUNCTION public.get_room_viewing_count(_room_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.viewing_requests
  WHERE room_id = _room_id
  AND status NOT IN ('cancelled', 'declined', 'expired');
$$;
