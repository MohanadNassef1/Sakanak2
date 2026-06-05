CREATE OR REPLACE FUNCTION public.protect_room_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    NEW.is_featured := OLD.is_featured;
    NEW.views_count := OLD.views_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_room_admin_fields ON public.rooms;
CREATE TRIGGER trg_protect_room_admin_fields
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.protect_room_admin_fields();