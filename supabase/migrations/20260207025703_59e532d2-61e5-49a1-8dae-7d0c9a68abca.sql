-- Allow askers to delete their own questions
CREATE POLICY "Askers can delete their own questions"
ON public.listing_questions
FOR DELETE
USING (asker_id = auth.uid());

-- Allow room owners to delete any question on their listings
CREATE POLICY "Owners can delete questions on their rooms"
ON public.listing_questions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM rooms
  WHERE rooms.id = listing_questions.room_id
  AND rooms.owner_id = auth.uid()
));