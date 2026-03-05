CREATE OR REPLACE FUNCTION public.validate_room_description_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  digits_only text;
BEGIN
  -- Check description
  IF NEW.description IS NOT NULL THEN
    digits_only := regexp_replace(NEW.description, '[^0-9]', '', 'g');
    IF digits_only ~* '01[0125]' OR digits_only ~* '^(00)?201[0125]' OR
       NEW.description ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
       NEW.description ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
       NEW.description ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
    THEN
      RAISE EXCEPTION 'Contact information is not allowed in room descriptions';
    END IF;
  END IF;

  -- Check title
  IF NEW.title IS NOT NULL THEN
    digits_only := regexp_replace(NEW.title, '[^0-9]', '', 'g');
    IF digits_only ~* '01[0125]' OR digits_only ~* '^(00)?201[0125]' OR
       NEW.title ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
       NEW.title ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
       NEW.title ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
    THEN
      RAISE EXCEPTION 'Contact information is not allowed in room titles';
    END IF;
  END IF;

  -- Check address
  IF NEW.address IS NOT NULL THEN
    digits_only := regexp_replace(NEW.address, '[^0-9]', '', 'g');
    IF digits_only ~* '01[0125]' OR digits_only ~* '^(00)?201[0125]' OR
       NEW.address ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
       NEW.address ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
       NEW.address ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
    THEN
      RAISE EXCEPTION 'Contact information is not allowed in room addresses';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;