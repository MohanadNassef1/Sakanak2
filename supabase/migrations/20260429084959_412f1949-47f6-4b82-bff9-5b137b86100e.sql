
ALTER TABLE public.contact_submissions
  DROP CONSTRAINT IF EXISTS contact_submissions_rating_check;

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10));
