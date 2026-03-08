
-- Step 1: Create room_payout_info table for sensitive payout data
CREATE TABLE public.room_payout_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  payout_method text NOT NULL DEFAULT 'instapay',
  payout_details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id)
);

-- Step 2: Enable RLS
ALTER TABLE public.room_payout_info ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS policies - only owner and admin can access
CREATE POLICY "Owners can view their payout info"
  ON public.room_payout_info FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their payout info"
  ON public.room_payout_info FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their payout info"
  ON public.room_payout_info FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their payout info"
  ON public.room_payout_info FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all payout info"
  ON public.room_payout_info FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all payout info"
  ON public.room_payout_info FOR ALL
  USING (public.is_admin(auth.uid()));

-- Step 4: Migrate existing data from rooms table
INSERT INTO public.room_payout_info (room_id, owner_id, payout_method, payout_details)
SELECT id, owner_id, COALESCE(owner_payout_method, 'instapay'), payout_details
FROM public.rooms
WHERE owner_payout_method IS NOT NULL OR payout_details IS NOT NULL;

-- Step 5: Drop columns from rooms table
ALTER TABLE public.rooms DROP COLUMN IF EXISTS owner_payout_method;
ALTER TABLE public.rooms DROP COLUMN IF EXISTS payout_details;

-- Step 6: Update get_room_details function to no longer reference dropped columns
CREATE OR REPLACE FUNCTION public.get_room_details(_room_id uuid)
 RETURNS SETOF rooms
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _result public.rooms;
BEGIN
  SELECT * INTO _result FROM public.rooms WHERE id = _room_id LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Only show active, rented, or expired rooms (unless owner or admin)
  IF _result.status NOT IN ('active', 'rented', 'expired') 
     AND _result.owner_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
     AND NOT COALESCE(public.is_admin(auth.uid()), false) THEN
    RETURN;
  END IF;
  
  RETURN NEXT _result;
END;
$function$;

-- Step 7: Add updated_at trigger
CREATE TRIGGER update_room_payout_info_updated_at
  BEFORE UPDATE ON public.room_payout_info
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
