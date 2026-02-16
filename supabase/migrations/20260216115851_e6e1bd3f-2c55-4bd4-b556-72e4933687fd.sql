
-- Drop the problematic CHECK constraint
ALTER TABLE public.viewing_requests DROP CONSTRAINT IF EXISTS future_date;

-- Create a validation trigger instead (allows today's date)
CREATE OR REPLACE FUNCTION public.validate_viewing_proposed_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.proposed_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Proposed date cannot be in the past';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_viewing_proposed_date
BEFORE INSERT ON public.viewing_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_viewing_proposed_date();
