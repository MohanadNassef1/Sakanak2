-- Create viewing_messages table for chat between tenant and landlord after viewing confirmation
CREATE TABLE public.viewing_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewing_id UUID NOT NULL REFERENCES public.viewing_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.viewing_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Participants can view messages for their viewings
CREATE POLICY "Participants can view viewing messages"
  ON public.viewing_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM viewing_requests vr
      WHERE vr.id = viewing_messages.viewing_id
      AND (vr.tenant_id = auth.uid() OR vr.landlord_id = auth.uid())
    )
  );

-- Policy: Participants can send messages only if viewing is confirmed
CREATE POLICY "Participants can send messages on confirmed viewings"
  ON public.viewing_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM viewing_requests vr
      WHERE vr.id = viewing_messages.viewing_id
      AND (vr.tenant_id = auth.uid() OR vr.landlord_id = auth.uid())
      AND vr.status IN ('confirmed', 'completed', 'rental_confirmed')
    )
  );

-- Policy: Participants can update read_at for messages sent to them
CREATE POLICY "Participants can mark messages as read"
  ON public.viewing_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM viewing_requests vr
      WHERE vr.id = viewing_messages.viewing_id
      AND (vr.tenant_id = auth.uid() OR vr.landlord_id = auth.uid())
      AND viewing_messages.sender_id != auth.uid()
    )
  );

-- Enable realtime for viewing_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.viewing_messages;

-- Create index for fast message retrieval
CREATE INDEX idx_viewing_messages_viewing_id ON public.viewing_messages(viewing_id);
CREATE INDEX idx_viewing_messages_created_at ON public.viewing_messages(viewing_id, created_at);