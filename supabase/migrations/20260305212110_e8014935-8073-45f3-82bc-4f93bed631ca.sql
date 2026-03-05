
CREATE OR REPLACE FUNCTION public.validate_room_description_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check description for phone numbers, emails, URLs, social media
  IF NEW.description IS NOT NULL AND (
    NEW.description ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.description ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.description ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.description ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information (phone, email, links, social media) is not allowed in room descriptions';
  END IF;

  -- Also check title
  IF NEW.title IS NOT NULL AND (
    NEW.title ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.title ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.title ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.title ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information (phone, email, links, social media) is not allowed in room titles';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_room_description_content_trigger
  BEFORE INSERT OR UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_room_description_content();
