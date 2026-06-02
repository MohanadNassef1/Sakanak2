
CREATE OR REPLACE FUNCTION public.enforce_room_media_required()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('active', 'rented') THEN
    IF (COALESCE(array_length(NEW.photos, 1), 0) = 0)
       AND (COALESCE(array_length(NEW.videos, 1), 0) = 0) THEN
      RAISE EXCEPTION 'Listings must include at least one photo or video';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_room_media_required_trg ON public.rooms;
CREATE TRIGGER enforce_room_media_required_trg
BEFORE INSERT OR UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.enforce_room_media_required();
