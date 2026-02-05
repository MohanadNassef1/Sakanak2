-- =============================================
-- FIX CRITICAL DATA EXPOSURE VULNERABILITIES
-- =============================================

-- ISSUE 1: "Anyone can view verified profiles via public view" policy
-- This exposes ALL profile columns (email, phone, whatsapp) to anonymous users
-- The public_profiles VIEW already exists and excludes sensitive columns
-- Remove the overly permissive direct table policy
DROP POLICY IF EXISTS "Anyone can view verified profiles via public view" ON public.profiles;

-- ISSUE 2: "Anyone can view active rooms via public view" policy  
-- This exposes ALL room columns (payout_details, owner_payout_method) to users
-- The public_rooms VIEW already exists and excludes sensitive columns
-- Remove the overly permissive direct table policy
DROP POLICY IF EXISTS "Anyone can view active rooms via public view" ON public.rooms;

-- =============================================
-- VERIFY REMAINING POLICIES ARE SUFFICIENT
-- =============================================
-- profiles table keeps:
--   - "Users can view their own profile" (SELECT, auth.uid() = user_id)
--   - "Admins can view all profiles" (SELECT, is_admin(auth.uid()))
--   - "Users can view contact info of reservation partners" (SELECT, with paid reservation)
--   - INSERT/UPDATE policies for profile management
--
-- rooms table keeps:
--   - "Owners can view their own rooms" (SELECT, owner_id = auth.uid())
--   - INSERT/UPDATE/DELETE policies for room management
--
-- PUBLIC ACCESS:
--   - Use public_profiles view for browsing roommates (excludes email, phone, whatsapp)
--   - Use public_rooms view for browsing rooms (excludes payout_details, owner_payout_method)