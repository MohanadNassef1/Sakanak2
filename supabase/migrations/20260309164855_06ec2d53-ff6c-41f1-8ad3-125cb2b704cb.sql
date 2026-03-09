
-- When a viewing is confirmed, auto-cancel other confirmed viewings for the same room
-- and keep pending ones as pending (they just can't be confirmed until this one is cancelled)
CREATE OR REPLACE FUNCTION public.enforce_single_confirmed_viewing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status <> 'confirmed') THEN
    -- Cancel any other confirmed viewings for the same room
    UPDATE public.viewing_requests
    SET status = 'cancelled'
    WHERE room_id = NEW.room_id
      AND id <> NEW.id
      AND status = 'confirmed';
  END IF;

  RETURN NEW;
END;
$function$;

-- Attach trigger BEFORE update on viewing_requests
CREATE TRIGGER enforce_single_confirmed_viewing_trigger
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_confirmed_viewing();
