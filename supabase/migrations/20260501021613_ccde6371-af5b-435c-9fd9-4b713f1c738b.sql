
CREATE TABLE public.site_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_name text,
  rating smallint NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_ratings_rating_range CHECK (rating >= 1 AND rating <= 10)
);

CREATE INDEX idx_site_ratings_created_at ON public.site_ratings (created_at DESC);
CREATE INDEX idx_site_ratings_rating ON public.site_ratings (rating);

ALTER TABLE public.site_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a rating"
  ON public.site_ratings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all ratings"
  ON public.site_ratings
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update ratings"
  ON public.site_ratings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete ratings"
  ON public.site_ratings
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
