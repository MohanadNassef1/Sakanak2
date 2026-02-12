
-- TEMPORARY: Allow unverified users to create rooms
DROP POLICY IF EXISTS "Verified users can create rooms" ON public.rooms;
CREATE POLICY "Verified users can create rooms"
ON public.rooms
FOR INSERT
WITH CHECK (
  owner_id = auth.uid()
);

-- TEMPORARY: Allow unverified users to create viewing requests
DROP POLICY IF EXISTS "Verified tenants can create viewing requests" ON public.viewing_requests;
CREATE POLICY "Verified tenants can create viewing requests"
ON public.viewing_requests
FOR INSERT
WITH CHECK (
  tenant_id = auth.uid()
  AND tenant_id <> landlord_id
);

-- TEMPORARY: Allow unverified users to create conversations
DROP POLICY IF EXISTS "Verified users can create conversations" ON public.conversations;
CREATE POLICY "Verified users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  (auth.uid() = participant_one OR auth.uid() = participant_two)
);

-- TEMPORARY: Allow unverified users to send messages
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
CREATE POLICY "Conversation participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

-- TEMPORARY: Allow unverified users to ask listing questions
DROP POLICY IF EXISTS "Verified users can ask questions" ON public.listing_questions;
CREATE POLICY "Verified users can ask questions"
ON public.listing_questions
FOR INSERT
WITH CHECK (
  asker_id = auth.uid()
);
