-- Create a trigger to automatically update room status to 'rented' when both parties confirm rental
-- This fixes the issue where the tenant's confirmation update was blocked by RLS

CREATE OR REPLACE FUNCTION public.update_room_status_on_rental_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when status changes to 'rental_confirmed'
  IF NEW.status = 'rental_confirmed' AND (OLD.status IS NULL OR OLD.status <> 'rental_confirmed') THEN
    -- Update the room status to 'rented'
    UPDATE public.rooms
    SET status = 'rented',
        updated_at = now()
    WHERE id = NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_room_on_rental ON public.viewing_requests;
CREATE TRIGGER trigger_update_room_on_rental
  AFTER UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_status_on_rental_confirmation();

-- Also fix the existing room that should be marked as rented
UPDATE public.rooms
SET status = 'rented', updated_at = now()
WHERE id IN (
  SELECT DISTINCT room_id 
  FROM public.viewing_requests 
  WHERE status = 'rental_confirmed'
)
AND status = 'active';