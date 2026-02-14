
-- Add is_student_listing column directly to rooms table
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_student_listing boolean NOT NULL DEFAULT false;

-- Populate existing rooms based on owner's occupation_status
UPDATE public.rooms r
SET is_student_listing = COALESCE(
  (SELECT p.occupation_status = 'student' FROM public.profiles p WHERE p.user_id = r.owner_id),
  false
);

-- Create trigger function to auto-set is_student_listing on room insert/update
CREATE OR REPLACE FUNCTION public.set_room_student_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.is_student_listing := COALESCE(
    (SELECT p.occupation_status = 'student' FROM public.profiles p WHERE p.user_id = NEW.owner_id),
    false
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_room_student_listing_trigger
BEFORE INSERT OR UPDATE OF owner_id ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.set_room_student_listing();

-- Also update rooms when a profile's occupation_status changes
CREATE OR REPLACE FUNCTION public.sync_student_listing_on_profile_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.occupation_status IS DISTINCT FROM NEW.occupation_status THEN
    UPDATE public.rooms
    SET is_student_listing = (NEW.occupation_status = 'student')
    WHERE owner_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_student_listing_on_profile_change_trigger
AFTER UPDATE OF occupation_status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_student_listing_on_profile_change();

-- Revert public_rooms view to NOT join profiles (fix the permission error)
CREATE OR REPLACE VIEW public.public_rooms WITH (security_invoker = on) AS
SELECT 
    id, title, description, room_type, price_per_month, city, area, address,
    photos, amenities, rules, available_from, min_stay_months, max_roommates,
    current_roommates, preferred_gender, allows_smoking, allows_pets, is_featured,
    status, created_at, updated_at, has_natural_gas, has_wifi, has_elevator,
    has_balcony, has_doorman, has_ac, has_water_heater, allows_visits,
    total_bedrooms, location_link, lister_type, deposit, bills_included,
    personality_tags, is_student_listing
FROM rooms
WHERE status = ANY (ARRAY['active'::listing_status, 'rented'::listing_status]);
