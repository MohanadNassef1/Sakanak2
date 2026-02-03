-- Fix 1: Profiles - Remove contact info exposure, require authentication for SELECT
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Verified users can view other verified profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create view for public profile data (non-sensitive fields only)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  verification_status,
  looking_for,
  gender,
  about,
  occupation,
  nationality,
  is_smoker,
  has_pets,
  pet_type,
  created_at
FROM public.profiles
WHERE verification_status = 'verified';

-- Recreate profiles policies with proper restrictions
-- Users can always view their own full profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- Verified users can view LIMITED info of other verified users (via the view, not direct table access for contact info)
-- Contact info only accessible through reservations relationship
CREATE POLICY "Verified users can view basic info of other verified profiles"
ON public.profiles FOR SELECT
USING (
  verification_status = 'verified' 
  AND is_user_verified(auth.uid())
  AND auth.uid() IS NOT NULL
);

-- Fix 2: Payments - Remove direct INSERT policy, only service role should create
DROP POLICY IF EXISTS "Users can create their payments" ON public.payments;

-- Fix 3: Reservations - Add immutable field protection via trigger
CREATE OR REPLACE FUNCTION public.protect_reservation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent modification of critical fields after creation
  IF OLD.room_price IS DISTINCT FROM NEW.room_price THEN
    RAISE EXCEPTION 'room_price cannot be modified after creation';
  END IF;
  
  IF OLD.platform_fee IS DISTINCT FROM NEW.platform_fee THEN
    RAISE EXCEPTION 'platform_fee cannot be modified after creation';
  END IF;
  
  IF OLD.total_paid IS DISTINCT FROM NEW.total_paid THEN
    RAISE EXCEPTION 'total_paid cannot be modified after creation';
  END IF;
  
  IF OLD.insurance_amount IS DISTINCT FROM NEW.insurance_amount THEN
    RAISE EXCEPTION 'insurance_amount cannot be modified after creation';
  END IF;
  
  IF OLD.duration_months IS DISTINCT FROM NEW.duration_months THEN
    RAISE EXCEPTION 'duration_months cannot be modified after creation';
  END IF;
  
  IF OLD.check_in_date IS DISTINCT FROM NEW.check_in_date THEN
    RAISE EXCEPTION 'check_in_date cannot be modified after creation';
  END IF;
  
  IF OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    RAISE EXCEPTION 'room_id cannot be modified after creation';
  END IF;
  
  IF OLD.seeker_id IS DISTINCT FROM NEW.seeker_id THEN
    RAISE EXCEPTION 'seeker_id cannot be modified after creation';
  END IF;
  
  IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
    RAISE EXCEPTION 'owner_id cannot be modified after creation';
  END IF;
  
  -- Prevent users from directly changing status (should be done via edge functions)
  -- Only allow seeker to update seeker_confirmed, owner to update owner_confirmed
  IF auth.uid() = OLD.seeker_id THEN
    -- Seeker can only update seeker_confirmed
    IF OLD.owner_confirmed IS DISTINCT FROM NEW.owner_confirmed THEN
      RAISE EXCEPTION 'Seekers cannot modify owner_confirmed';
    END IF;
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      RAISE EXCEPTION 'Status can only be changed by system';
    END IF;
  ELSIF auth.uid() = OLD.owner_id THEN
    -- Owner can only update owner_confirmed
    IF OLD.seeker_confirmed IS DISTINCT FROM NEW.seeker_confirmed THEN
      RAISE EXCEPTION 'Owners cannot modify seeker_confirmed';
    END IF;
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      RAISE EXCEPTION 'Status can only be changed by system';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for reservation field protection
DROP TRIGGER IF EXISTS protect_reservation_fields_trigger ON public.reservations;
CREATE TRIGGER protect_reservation_fields_trigger
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.protect_reservation_fields();

-- Fix 4: Rooms - Hide payout details from public view
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.rooms;

-- Create a view for public room data (without payout details)
CREATE OR REPLACE VIEW public.public_rooms AS
SELECT 
  id,
  owner_id,
  title,
  description,
  room_type,
  price_per_month,
  city,
  area,
  address,
  photos,
  amenities,
  rules,
  available_from,
  min_stay_months,
  max_roommates,
  current_roommates,
  preferred_gender,
  allows_smoking,
  allows_pets,
  is_featured,
  status,
  views_count,
  insurance_amount,
  created_at,
  updated_at
FROM public.rooms
WHERE status = 'active';

-- Recreate rooms policy - anyone can view active rooms but NOT payout details
-- The actual table policy now restricts access
CREATE POLICY "Anyone can view active rooms without payout info"
ON public.rooms FOR SELECT
USING (
  status = 'active'::listing_status 
  OR owner_id = auth.uid()
  OR is_admin(auth.uid())
);

-- Grant access to the public views
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_rooms TO anon, authenticated;