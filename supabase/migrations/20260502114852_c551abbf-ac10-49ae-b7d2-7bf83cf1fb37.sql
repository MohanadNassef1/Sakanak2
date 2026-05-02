
-- Fix 1: conversations INSERT - require auth.uid() = participant_one to prevent impersonation
DROP POLICY IF EXISTS "Verified users can create conversations" ON public.conversations;
CREATE POLICY "Verified users can create conversations"
ON public.conversations
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = participant_one
  AND participant_one <> participant_two
);

-- Fix 2: profiles UPDATE - add WITH CHECK with same restriction (defense-in-depth alongside existing trigger)
DROP POLICY IF EXISTS "Users can update their own profile except gender" ON public.profiles;
CREATE POLICY "Users can update their own profile except gender"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix 3: listing_questions INSERT - require verification
DROP POLICY IF EXISTS "Verified users can ask questions" ON public.listing_questions;
CREATE POLICY "Verified users can ask questions"
ON public.listing_questions
FOR INSERT
TO public
WITH CHECK (
  asker_id = auth.uid()
  AND public.is_user_verified(auth.uid())
);
