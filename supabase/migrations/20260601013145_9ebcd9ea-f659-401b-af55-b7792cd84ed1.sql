-- Prevent users (non-admins) from clearing required profile fields once they have been set.
-- This enforces, at the database level, that Google sign-ups (and any other users)
-- cannot remove their university/job or interested area after completing their profile.
CREATE OR REPLACE FUNCTION public.prevent_clearing_required_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins may clear fields if needed
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.occupation_status IS NOT NULL AND (NEW.occupation_status IS NULL OR NEW.occupation_status = '') THEN
    RAISE EXCEPTION 'occupation_status is required and cannot be cleared';
  END IF;

  -- If user is a student, university must remain set
  IF NEW.occupation_status = 'student' THEN
    IF OLD.university IS NOT NULL AND (NEW.university IS NULL OR NEW.university = '') THEN
      RAISE EXCEPTION 'university is required for students';
    END IF;
  END IF;

  -- If user is working, job title must remain set
  IF NEW.occupation_status = 'working' THEN
    IF OLD.job_title IS NOT NULL AND (NEW.job_title IS NULL OR NEW.job_title = '') THEN
      RAISE EXCEPTION 'job_title is required for working users';
    END IF;
  END IF;

  IF OLD.interested_area_1 IS NOT NULL AND (NEW.interested_area_1 IS NULL OR NEW.interested_area_1 = '') THEN
    RAISE EXCEPTION 'interested_area_1 is required and cannot be cleared';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_clearing_required_profile_fields ON public.profiles;
CREATE TRIGGER prevent_clearing_required_profile_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_clearing_required_profile_fields();