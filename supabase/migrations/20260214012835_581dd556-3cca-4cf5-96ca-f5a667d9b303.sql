-- Revoke SELECT from anon role on payments table for defense-in-depth
REVOKE SELECT ON public.payments FROM anon;