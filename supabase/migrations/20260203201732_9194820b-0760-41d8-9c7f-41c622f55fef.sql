-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one UUID NOT NULL,
  participant_two UUID NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (participant_one, participant_two),
  CONSTRAINT different_participants CHECK (participant_one <> participant_two)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_filtered BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Verified users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  (auth.uid() = participant_one OR auth.uid() = participant_two)
  AND is_user_verified(auth.uid())
);

CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Messages policies
CREATE POLICY "Conversation participants can view messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Conversation participants can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND is_user_verified(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Participants can update message read status"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_conversations_participant_one ON public.conversations(participant_one);
CREATE INDEX idx_conversations_participant_two ON public.conversations(participant_two);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;