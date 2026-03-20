-- Add date_of_birth column
ALTER TABLE public.profiles ADD COLUMN date_of_birth date;

-- Create a function to auto-compute age from date_of_birth
CREATE OR REPLACE FUNCTION public.compute_age_from_dob()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age := date_part('year', age(NEW.date_of_birth))::integer;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update age when date_of_birth changes
CREATE TRIGGER compute_age_on_dob_change
  BEFORE INSERT OR UPDATE OF date_of_birth ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_age_from_dob();