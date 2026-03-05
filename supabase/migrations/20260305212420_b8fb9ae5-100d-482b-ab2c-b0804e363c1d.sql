
CREATE OR REPLACE FUNCTION public.validate_room_description_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check description
  IF NEW.description IS NOT NULL AND (
    NEW.description ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.description ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.description ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.description ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room descriptions';
  END IF;

  -- Check title
  IF NEW.title IS NOT NULL AND (
    NEW.title ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.title ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.title ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.title ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room titles';
  END IF;

  -- Check address
  IF NEW.address IS NOT NULL AND (
    NEW.address ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.address ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.address ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.address ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room addresses';
  END IF;

  RETURN NEW;
END;
$function$;
