CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Admins can change anything
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- verification_status: allow users to perform their own valid self-transitions on their own profile.
  -- Allowed self-transitions:
  --   unverified -> pending   (submit)
  --   rejected   -> pending   (re-submit)
  --   pending    -> unverified (cancel)
  --   rejected   -> unverified (cancel)
  -- Block any transition into 'verified' and any change on someone else's profile.
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    IF NEW.user_id = auth.uid()
       AND NEW.verification_status <> 'verified'::verification_status
       AND (
            (OLD.verification_status = 'unverified'::verification_status AND NEW.verification_status = 'pending'::verification_status)
         OR (OLD.verification_status = 'rejected'::verification_status   AND NEW.verification_status = 'pending'::verification_status)
         OR (OLD.verification_status = 'pending'::verification_status    AND NEW.verification_status = 'unverified'::verification_status)
         OR (OLD.verification_status = 'rejected'::verification_status   AND NEW.verification_status = 'unverified'::verification_status)
       )
    THEN
      -- allowed self-transition, fall through
      NULL;
    ELSE
      RAISE EXCEPTION 'Only admins can change verification_status';
    END IF;
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

-- Unstick the user who reported this: reset any non-verified profiles currently stuck
-- so they can re-submit. Does NOT touch already-verified users.
UPDATE public.profiles
SET verification_status = 'unverified'::verification_status
WHERE verification_status = 'pending'::verification_status
  AND NOT EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.user_id = profiles.user_id
      AND vr.status = 'pending'
  );