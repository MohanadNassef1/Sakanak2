
ALTER TABLE public.profiles DISABLE TRIGGER trg_protect_public_id;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE public_id IS NULL OR public_id LIKE 'SK-%' LOOP
    UPDATE public.profiles SET public_id = public.generate_public_id() WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE TRIGGER trg_protect_public_id;
