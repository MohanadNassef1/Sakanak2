
-- FIX 1: Prevent users from self-escalating sensitive profile fields
-- Use a trigger to block non-admin users from modifying sensitive columns
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If the current user is an admin, allow all changes
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Block non-admin users from modifying sensitive fields
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    RAISE EXCEPTION 'Only admins can change verification_status';
  END IF;

  IF OLD.is_disabled IS DISTINCT FROM NEW.is_disabled THEN
    RAISE EXCEPTION 'Only admins can change is_disabled';
  END IF;

  IF OLD.disabled_at IS DISTINCT FROM NEW.disabled_at THEN
    RAISE EXCEPTION 'Only admins can change disabled_at';
  END IF;

  IF OLD.disabled_by IS DISTINCT FROM NEW.disabled_by THEN
    RAISE EXCEPTION 'Only admins can change disabled_by';
  END IF;

  IF OLD.disabled_reason IS DISTINCT FROM NEW.disabled_reason THEN
    RAISE EXCEPTION 'Only admins can change disabled_reason';
  END IF;

  IF OLD.email_verified IS DISTINCT FROM NEW.email_verified THEN
    RAISE EXCEPTION 'Only admins can change email_verified';
  END IF;

  IF OLD.phone_verified IS DISTINCT FROM NEW.phone_verified THEN
    RAISE EXCEPTION 'Only admins can change phone_verified';
  END IF;

  IF OLD.is_student_verified IS DISTINCT FROM NEW.is_student_verified THEN
    RAISE EXCEPTION 'Only admins can change is_student_verified';
  END IF;

  IF OLD.referral_count IS DISTINCT FROM NEW.referral_count THEN
    RAISE EXCEPTION 'Only admins can change referral_count';
  END IF;

  IF OLD.email IS DISTINCT FROM NEW.email THEN
    RAISE EXCEPTION 'Only admins can change email';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_sensitive_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sensitive_profile_fields();

-- FIX 2: Recreate public_profiles view with security_invoker = true
-- This ensures the view respects the caller's permissions rather than the view owner's
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.gender,
  p.is_smoker,
  p.has_pets,
  p.pet_type,
  p.occupation,
  p.nationality,
  p.about,
  p.looking_for,
  p.age,
  p.personality_tags,
  p.university,
  p.job_title,
  p.created_at,
  (p.verification_status = 'verified'::verification_status) AS is_verified
FROM public.profiles p
WHERE p.is_disabled = false;
