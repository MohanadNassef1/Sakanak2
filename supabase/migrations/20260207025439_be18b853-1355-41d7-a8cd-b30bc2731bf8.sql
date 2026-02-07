-- Add foreign key from listing_questions.asker_id to profiles.user_id
-- (room_id FK already exists, so we skip that)
ALTER TABLE public.listing_questions
ADD CONSTRAINT listing_questions_asker_id_fkey
FOREIGN KEY (asker_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;