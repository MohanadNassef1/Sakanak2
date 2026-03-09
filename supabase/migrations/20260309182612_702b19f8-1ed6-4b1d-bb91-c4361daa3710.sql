
-- Create trigger function to validate tenant_message and landlord_response on viewing_requests
CREATE OR REPLACE FUNCTION public.validate_viewing_message_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  digits_only text;
BEGIN
  -- Check tenant_message
  IF NEW.tenant_message IS NOT NULL AND NEW.tenant_message <> '' THEN
    digits_only := regexp_replace(NEW.tenant_message, '[^0-9]', '', 'g');
    IF digits_only ~* '01[0125]' OR digits_only ~* '^(00)?201[0125]' OR
       NEW.tenant_message ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
       NEW.tenant_message ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
       NEW.tenant_message ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
    THEN
      RAISE EXCEPTION 'Contact information (phone, email, links) is not allowed in viewing messages';
    END IF;
  END IF;

  -- Check landlord_response
  IF NEW.landlord_response IS NOT NULL AND NEW.landlord_response <> '' THEN
    digits_only := regexp_replace(NEW.landlord_response, '[^0-9]', '', 'g');
    IF digits_only ~* '01[0125]' OR digits_only ~* '^(00)?201[0125]' OR
       NEW.landlord_response ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
       NEW.landlord_response ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
       NEW.landlord_response ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
    THEN
      RAISE EXCEPTION 'Contact information (phone, email, links) is not allowed in viewing messages';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger on viewing_requests
CREATE TRIGGER validate_viewing_message_content_trigger
  BEFORE INSERT OR UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_viewing_message_content();
