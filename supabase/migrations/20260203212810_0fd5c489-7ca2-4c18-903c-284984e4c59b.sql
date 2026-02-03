-- Create function to filter message content server-side
CREATE OR REPLACE FUNCTION public.filter_message_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for phone numbers (various formats)
  -- Check for email addresses
  -- Check for URLs/links
  -- Check for social media handles
  IF NEW.content ~* '(\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9})' OR
     NEW.content ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' OR
     NEW.content ~* '(https?://|www\.|\.com|\.net|\.org|\.io)' OR
     NEW.content ~* '(@[a-zA-Z0-9_]{3,}|instagram|facebook|twitter|tiktok|snapchat|telegram|whatsapp)' THEN
    NEW.is_filtered = true;
  ELSE
    NEW.is_filtered = false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run before insert on messages
CREATE TRIGGER filter_messages_before_insert
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.filter_message_content();