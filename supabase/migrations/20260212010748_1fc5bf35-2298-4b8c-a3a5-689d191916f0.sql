
-- Revoke SELECT on profiles from anon role to prevent unauthenticated access
-- All legitimate access goes through authenticated user policies
REVOKE SELECT ON public.profiles FROM anon;
