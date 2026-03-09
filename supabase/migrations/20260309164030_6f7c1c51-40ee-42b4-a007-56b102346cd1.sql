
-- Trigger to prevent double rental: block rental_confirmed if room is already rented
CREATE OR REPLACE FUNCTION public.prevent_double_rental()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only check when status is being set to 'rental_confirmed'
  IF NEW.status = 'rental_confirmed' AND (OLD.status IS NULL OR OLD.status <> 'rental_confirmed') THEN
    -- Check if room is already rented (by another viewing)
    IF EXISTS (
      SELECT 1 FROM public.viewing_requests
      WHERE room_id = NEW.room_id
        AND id <> NEW.id
        AND status = 'rental_confirmed'
    ) THEN
      RAISE EXCEPTION 'This room has already been rented through another viewing';
    END IF;

    -- Check if room status is already 'rented'
    IF EXISTS (
      SELECT 1 FROM public.rooms
      WHERE id = NEW.room_id
        AND status = 'rented'
    ) THEN
      RAISE EXCEPTION 'This room is already rented';
    END IF;

    -- Auto-cancel all other active viewing requests for this room
    UPDATE public.viewing_requests
    SET status = 'cancelled'
    WHERE room_id = NEW.room_id
      AND id <> NEW.id
      AND status NOT IN ('cancelled', 'declined', 'expired', 'rental_confirmed');
  END IF;

  RETURN NEW;
END;
$function$;

-- Attach trigger BEFORE update on viewing_requests
CREATE TRIGGER prevent_double_rental_trigger
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_double_rental();
