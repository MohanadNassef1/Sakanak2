-- Create a trigger function to block contact info in listing questions
CREATE OR REPLACE FUNCTION public.validate_listing_question_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check question for phone numbers, emails, URLs
  IF NEW.question IS NOT NULL AND (
    NEW.question ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.question ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.question ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.question ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information (phone, email, links) is not allowed in questions';
  END IF;
  
  -- Check answer for phone numbers, emails, URLs
  IF NEW.answer IS NOT NULL AND (
    NEW.answer ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
    NEW.answer ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
    NEW.answer ~* '(https?://|www\.|\.com|\.net|\.org|\.io|\.eg)' OR
    NEW.answer ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)'
  ) THEN
    RAISE EXCEPTION 'Contact information (phone, email, links) is not allowed in answers';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER validate_listing_question_content_trigger
BEFORE INSERT OR UPDATE ON public.listing_questions
FOR EACH ROW
EXECUTE FUNCTION public.validate_listing_question_content();