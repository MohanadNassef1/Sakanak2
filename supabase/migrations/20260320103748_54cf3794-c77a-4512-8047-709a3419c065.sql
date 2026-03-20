
CREATE OR REPLACE FUNCTION public.prevent_booking_while_confirmed()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  -- On INSERT only: check if tenant already has a confirmed viewing for ANY room
  IF EXISTS (
    SELECT 1 FROM public.viewing_requests
    WHERE tenant_id = NEW.tenant_id
      AND status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'You already have a confirmed viewing. Please cancel it before booking another room.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER prevent_booking_while_confirmed_trigger
  BEFORE INSERT ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_booking_while_confirmed();
