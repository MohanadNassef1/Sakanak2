
-- Fix 1: Restrict public_profiles view to authenticated users only
-- This view contains personal info (gender, occupation, nationality, etc.) that should not be scraped by anonymous users
REVOKE SELECT ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Fix 2: Restrict public_rooms view to authenticated users only  
-- Room listings should require authentication to prevent scraping
-- The app already redirects to auth for room details; this enforces it at DB level
REVOKE SELECT ON public.public_rooms FROM anon;
GRANT SELECT ON public.public_rooms TO authenticated;
