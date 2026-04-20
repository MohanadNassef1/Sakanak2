
-- ==========================================
-- FEATURE 1: Smart Alerts (Saved Searches)
-- ==========================================

CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_in_app BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_searches_user ON public.saved_searches(user_id);

-- Notifications for matched rooms
CREATE TABLE public.search_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  saved_search_id UUID NOT NULL REFERENCES public.saved_searches(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(saved_search_id, room_id)
);

ALTER TABLE public.search_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.search_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.search_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.search_notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE INDEX idx_search_notifications_user ON public.search_notifications(user_id, is_read);

-- ==========================================
-- FEATURE 2: Place Reviews
-- ==========================================

CREATE TABLE public.room_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  viewing_request_id UUID NOT NULL REFERENCES public.viewing_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(viewing_request_id)
);

ALTER TABLE public.room_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public)
CREATE POLICY "Anyone can view reviews"
  ON public.room_reviews FOR SELECT
  TO public
  USING (true);

-- Only tenants who had a completed/rental_confirmed viewing can review
CREATE POLICY "Tenants with completed viewings can create reviews"
  ON public.room_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.viewing_requests vr
      WHERE vr.id = viewing_request_id
        AND vr.tenant_id = auth.uid()
        AND vr.room_id = room_reviews.room_id
        AND vr.status IN ('completed', 'rental_confirmed')
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.room_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.room_reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews"
  ON public.room_reviews FOR ALL
  USING (is_admin(auth.uid()));

CREATE INDEX idx_room_reviews_room ON public.room_reviews(room_id);
CREATE INDEX idx_room_reviews_reviewer ON public.room_reviews(reviewer_id);

-- Trigger for updated_at on both tables
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_room_reviews_updated_at
  BEFORE UPDATE ON public.room_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
