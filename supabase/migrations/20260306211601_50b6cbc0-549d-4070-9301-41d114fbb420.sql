-- Fix: Restrict is_admin field in support_messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages in their support conversations" ON public.support_messages;

CREATE POLICY "Users can send messages in their support conversations"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (is_admin = false OR public.is_admin(auth.uid()))
  AND EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = support_messages.conversation_id
    AND (sc.user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);