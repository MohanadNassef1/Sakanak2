CREATE OR REPLACE FUNCTION public.prevent_viewing_on_rented_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = NEW.room_id AND r.status = 'rented'::public.listing_status
  ) THEN
    RAISE EXCEPTION 'This listing is already rented and no longer accepts viewing requests';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_viewing_on_rented_room_trigger ON public.viewing_requests;
CREATE TRIGGER prevent_viewing_on_rented_room_trigger
BEFORE INSERT ON public.viewing_requests
FOR EACH ROW EXECUTE FUNCTION public.prevent_viewing_on_rented_room();