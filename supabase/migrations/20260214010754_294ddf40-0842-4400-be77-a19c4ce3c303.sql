-- SECURITY FIX: Remove conversation partners policy that unnecessarily exposes contact info
-- Frontend already uses public_profiles view for conversations (no sensitive fields).
-- The viewing participants policy is kept because contact sharing for confirmed viewings is a legitimate business need.

DROP POLICY IF EXISTS "Users can view profiles of conversation partners" ON public.profiles;
