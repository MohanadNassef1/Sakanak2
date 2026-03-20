
CREATE OR REPLACE FUNCTION public.prevent_booking_while_confirmed()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.viewing_requests
    WHERE tenant_id = NEW.tenant_id
      AND status IN ('confirmed', 'completed')
  ) THEN
    RAISE EXCEPTION 'You already have a confirmed or completed viewing. Please cancel it before booking another room.';
  END IF;
  RETURN NEW;
END;
$function$;
