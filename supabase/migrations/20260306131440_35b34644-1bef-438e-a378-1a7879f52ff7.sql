
-- Support conversations table
CREATE TABLE public.support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text DEFAULT 'Customer Support',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

-- Support messages table
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS for support_conversations
CREATE POLICY "Users can view their own support conversations"
ON public.support_conversations FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create support conversations"
ON public.support_conversations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update support conversations"
ON public.support_conversations FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- RLS for support_messages
CREATE POLICY "Users can view messages in their support conversations"
ON public.support_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = support_messages.conversation_id
    AND (sc.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Users can send messages in their support conversations"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = support_messages.conversation_id
    AND (sc.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Participants can update message read status"
ON public.support_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = support_messages.conversation_id
    AND (sc.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;

-- Updated_at trigger
CREATE TRIGGER update_support_conversations_updated_at
  BEFORE UPDATE ON public.support_conversations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
