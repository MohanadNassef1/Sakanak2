CREATE OR REPLACE FUNCTION public.validate_room_description_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check description for Egyptian phone numbers, emails, URLs, social media
  IF NEW.description IS NOT NULL AND (
    NEW.description ~* '01[0125][0-9]{8}' OR
    NEW.description ~* '01[0125][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}' OR
    NEW.description ~* '(\+|00)20[-.\s]?1[0125]' OR
    NEW.description ~* '0[,._|/\\-]\s*1[,._|/\\-]\s*[0125]' OR
    NEW.description ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.description ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.description ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room descriptions';
  END IF;

  -- Check title
  IF NEW.title IS NOT NULL AND (
    NEW.title ~* '01[0125][0-9]{8}' OR
    NEW.title ~* '01[0125][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}' OR
    NEW.title ~* '(\+|00)20[-.\s]?1[0125]' OR
    NEW.title ~* '0[,._|/\\-]\s*1[,._|/\\-]\s*[0125]' OR
    NEW.title ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.title ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.title ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room titles';
  END IF;

  -- Check address
  IF NEW.address IS NOT NULL AND (
    NEW.address ~* '01[0125][0-9]{8}' OR
    NEW.address ~* '01[0125][-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}' OR
    NEW.address ~* '(\+|00)20[-.\s]?1[0125]' OR
    NEW.address ~* '0[,._|/\\-]\s*1[,._|/\\-]\s*[0125]' OR
    NEW.address ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.address ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.address ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information is not allowed in room addresses';
  END IF;

  RETURN NEW;
END;
$function$;