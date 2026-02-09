-- Add referral columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by text,
ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Function to generate a unique referral code based on name
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_full_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_code text;
  final_code text;
  counter integer := 0;
BEGIN
  -- Create base code from name (first 8 chars, uppercase, no spaces)
  base_code := UPPER(REGEXP_REPLACE(LEFT(TRIM(p_full_name), 8), '[^A-Za-z0-9]', '', 'g'));
  
  -- If empty, use 'REF'
  IF base_code = '' THEN
    base_code := 'REF';
  END IF;
  
  -- Try to find a unique code
  final_code := base_code || floor(random() * 100)::text;
  
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) AND counter < 100 LOOP
    counter := counter + 1;
    final_code := base_code || floor(random() * 1000)::text;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Function to validate referral code exists
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE referral_code = UPPER(TRIM(p_code))
  );
$$;

-- Function to increment referral count when someone uses a code
CREATE OR REPLACE FUNCTION public.increment_referral_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by) THEN
    UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for referral count
DROP TRIGGER IF EXISTS on_profile_referred_by_set ON public.profiles;
CREATE TRIGGER on_profile_referred_by_set
  AFTER INSERT OR UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_referral_count();

-- Function to get referral stats for admin dashboard
CREATE OR REPLACE FUNCTION public.get_referral_stats()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  referral_code text,
  total_signups bigint,
  verified_signups bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.referral_code,
    COUNT(r.user_id) as total_signups,
    COUNT(r.user_id) FILTER (WHERE r.verification_status = 'verified') as verified_signups
  FROM public.profiles p
  LEFT JOIN public.profiles r ON r.referred_by = p.referral_code
  WHERE p.referral_code IS NOT NULL
  GROUP BY p.user_id, p.full_name, p.referral_code
  ORDER BY verified_signups DESC, total_signups DESC;
$$;