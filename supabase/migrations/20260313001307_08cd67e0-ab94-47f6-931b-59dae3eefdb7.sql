
-- Update viewing_messages INSERT policy to also allow messages on counter_proposed viewings
DROP POLICY IF EXISTS "Participants can send messages on confirmed viewings" ON public.viewing_messages;

CREATE POLICY "Participants can send messages on active viewings"
ON public.viewing_messages
FOR INSERT
TO public
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.viewing_requests vr
    WHERE vr.id = viewing_messages.viewing_id
    AND (vr.tenant_id = auth.uid() OR vr.landlord_id = auth.uid())
    AND vr.status = ANY (ARRAY['counter_proposed'::viewing_status, 'confirmed'::viewing_status, 'completed'::viewing_status, 'rental_confirmed'::viewing_status])
  )
);
