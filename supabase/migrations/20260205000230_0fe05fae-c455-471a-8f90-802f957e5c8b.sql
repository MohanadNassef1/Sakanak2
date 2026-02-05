-- Add front and back document URL columns for ID verification
ALTER TABLE public.verification_requests 
ADD COLUMN document_url_front text,
ADD COLUMN document_url_back text;

-- Copy existing document_url to document_url_front for backward compatibility
UPDATE public.verification_requests 
SET document_url_front = document_url 
WHERE document_url IS NOT NULL AND document_url_front IS NULL;