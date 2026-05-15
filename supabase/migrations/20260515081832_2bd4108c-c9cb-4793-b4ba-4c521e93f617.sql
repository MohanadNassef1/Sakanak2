CREATE OR REPLACE FUNCTION public.prevent_gender_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.gender IS DISTINCT FROM NEW.gender AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Gender cannot be changed after registration';
  END IF;
  RETURN NEW;
END;
$function$;