-- Revoke anonymous access to public_profiles view to prevent unauthenticated queries
REVOKE SELECT ON public.public_profiles FROM anon;