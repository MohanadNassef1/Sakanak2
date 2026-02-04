-- Remove the problematic unique constraint that prevents users from having multiple requests
-- This constraint causes approval to fail when a user has previous requests with the same status
ALTER TABLE public.verification_requests DROP CONSTRAINT IF EXISTS verification_requests_user_id_status_key;