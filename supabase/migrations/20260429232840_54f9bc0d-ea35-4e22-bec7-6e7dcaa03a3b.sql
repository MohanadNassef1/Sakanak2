
-- Add public_id column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_id text UNIQUE;

-- Generator function: SK-XXXXXX (uppercase alphanumeric, no ambiguous chars)
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  code text;
  i integer;
  attempts integer := 0;
BEGIN
  LOOP
    code := 'SK-';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_id = code);
    attempts := attempts + 1;
    IF attempts > 50 THEN
      code := 'SK-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Backfill existing profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE public_id IS NULL LOOP
    UPDATE public.profiles SET public_id = public.generate_public_id() WHERE id = r.id;
  END LOOP;
END $$;

-- Trigger to assign on insert
CREATE OR REPLACE FUNCTION public.set_profile_public_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.public_id IS NULL THEN
    NEW.public_id := public.generate_public_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_profile_public_id ON public.profiles;
CREATE TRIGGER trg_set_profile_public_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_public_id();

-- Protect public_id from being changed by users (admins only)
CREATE OR REPLACE FUNCTION public.protect_public_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.public_id IS DISTINCT FROM NEW.public_id AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'public_id cannot be modified';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_public_id ON public.profiles;
CREATE TRIGGER trg_protect_public_id
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_public_id();
