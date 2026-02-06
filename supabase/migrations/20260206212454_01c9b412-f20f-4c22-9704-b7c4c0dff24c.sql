
-- ============================================
-- SAKANAK: Viewing Request to Rental Confirmation System
-- ============================================

-- 1. Create enum for viewing request status
CREATE TYPE public.viewing_status AS ENUM (
  'pending',           -- Tenant proposed a time
  'counter_proposed',  -- Landlord proposed different time
  'confirmed',         -- Both agreed on time
  'completed',         -- Viewing happened, awaiting decision
  'rental_confirmed',  -- Tenant confirmed rental
  'declined',          -- Tenant declined
  'cancelled',         -- Either party cancelled
  'expired'            -- No response within time limit
);

-- 2. Create enum for decline reasons
CREATE TYPE public.decline_reason AS ENUM (
  'different_than_photos',
  'location_issues',
  'price_too_high',
  'found_better_option',
  'broker_illegal_fees',
  'safety_concerns',
  'other'
);

-- 3. Create viewing_requests table
CREATE TABLE public.viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,  -- References auth.users via profiles
  landlord_id UUID NOT NULL, -- Room owner
  
  -- Scheduling
  proposed_date DATE NOT NULL,
  proposed_time_start TIME NOT NULL,
  proposed_time_end TIME NOT NULL,
  counter_proposed_date DATE,
  counter_proposed_time_start TIME,
  counter_proposed_time_end TIME,
  confirmed_date DATE,
  confirmed_time TIME,
  
  -- Status tracking
  status viewing_status NOT NULL DEFAULT 'pending',
  location_shared BOOLEAN DEFAULT FALSE,
  location_shared_at TIMESTAMPTZ,
  
  -- Optional tenant message
  tenant_message TEXT,
  landlord_response TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (proposed_time_end > proposed_time_start),
  CONSTRAINT future_date CHECK (proposed_date >= CURRENT_DATE)
);

-- 4. Create decline_reports table for tracking declined viewings with evidence
CREATE TABLE public.decline_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewing_request_id UUID NOT NULL REFERENCES public.viewing_requests(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  landlord_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  
  -- Decline details
  reason decline_reason NOT NULL,
  reason_details TEXT,
  
  -- Evidence
  evidence_photos TEXT[] DEFAULT '{}',
  evidence_videos TEXT[] DEFAULT '{}',
  
  -- Broker fraud flag
  broker_illegal_fees BOOLEAN DEFAULT FALSE,
  broker_fee_details TEXT,
  
  -- Admin review
  admin_reviewed BOOLEAN DEFAULT FALSE,
  admin_reviewed_by UUID,
  admin_reviewed_at TIMESTAMPTZ,
  admin_action TEXT, -- 'warning', 'ban', 'dismissed'
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create user_warnings table
CREATE TABLE public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  issued_by UUID NOT NULL, -- Admin who issued
  reason TEXT NOT NULL,
  related_report_id UUID REFERENCES public.decline_reports(id),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create user_bans table
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL, -- Admin who banned
  reason TEXT NOT NULL,
  related_report_id UUID REFERENCES public.decline_reports(id),
  is_permanent BOOLEAN DEFAULT FALSE,
  banned_until TIMESTAMPTZ, -- NULL if permanent
  is_active BOOLEAN DEFAULT TRUE,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create listing_questions table for Q&A on listings
CREATE TABLE public.listing_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  asker_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE, -- Can other users see this Q&A?
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Enable RLS on all new tables
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decline_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_questions ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for viewing_requests

-- Tenants can view their own viewing requests
CREATE POLICY "Tenants can view their viewing requests"
  ON public.viewing_requests FOR SELECT
  USING (tenant_id = auth.uid());

-- Landlords can view viewing requests for their rooms
CREATE POLICY "Landlords can view viewing requests for their rooms"
  ON public.viewing_requests FOR SELECT
  USING (landlord_id = auth.uid());

-- Verified tenants can create viewing requests
CREATE POLICY "Verified tenants can create viewing requests"
  ON public.viewing_requests FOR INSERT
  WITH CHECK (
    tenant_id = auth.uid() 
    AND is_user_verified(auth.uid())
    AND tenant_id != landlord_id  -- Can't book own listing
  );

-- Tenants can update their pending viewing requests (cancel)
CREATE POLICY "Tenants can update their viewing requests"
  ON public.viewing_requests FOR UPDATE
  USING (tenant_id = auth.uid());

-- Landlords can update viewing requests (confirm/counter-propose)
CREATE POLICY "Landlords can update viewing requests"
  ON public.viewing_requests FOR UPDATE
  USING (landlord_id = auth.uid());

-- Admins can view all viewing requests
CREATE POLICY "Admins can view all viewing requests"
  ON public.viewing_requests FOR SELECT
  USING (is_admin(auth.uid()));

-- 10. RLS Policies for decline_reports

-- Tenants can create decline reports for their viewings
CREATE POLICY "Tenants can create decline reports"
  ON public.decline_reports FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

-- Tenants can view their own reports
CREATE POLICY "Tenants can view their decline reports"
  ON public.decline_reports FOR SELECT
  USING (tenant_id = auth.uid());

-- Landlords can view reports about them
CREATE POLICY "Landlords can view reports about them"
  ON public.decline_reports FOR SELECT
  USING (landlord_id = auth.uid());

-- Admins can view and update all reports
CREATE POLICY "Admins can manage decline reports"
  ON public.decline_reports FOR ALL
  USING (is_admin(auth.uid()));

-- 11. RLS Policies for user_warnings

-- Users can view their own warnings
CREATE POLICY "Users can view their warnings"
  ON public.user_warnings FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their warnings (acknowledge)
CREATE POLICY "Users can acknowledge warnings"
  ON public.user_warnings FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all warnings
CREATE POLICY "Admins can manage warnings"
  ON public.user_warnings FOR ALL
  USING (is_admin(auth.uid()));

-- 12. RLS Policies for user_bans

-- Users can view their own ban status
CREATE POLICY "Users can view their ban status"
  ON public.user_bans FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all bans
CREATE POLICY "Admins can manage bans"
  ON public.user_bans FOR ALL
  USING (is_admin(auth.uid()));

-- 13. RLS Policies for listing_questions

-- Anyone authenticated can view public questions
CREATE POLICY "Users can view public questions"
  ON public.listing_questions FOR SELECT
  USING (is_public = true AND auth.uid() IS NOT NULL);

-- Question askers can view their own questions
CREATE POLICY "Askers can view their questions"
  ON public.listing_questions FOR SELECT
  USING (asker_id = auth.uid());

-- Room owners can view all questions for their listings
CREATE POLICY "Owners can view questions for their rooms"
  ON public.listing_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rooms WHERE rooms.id = room_id AND rooms.owner_id = auth.uid()
  ));

-- Verified users can ask questions
CREATE POLICY "Verified users can ask questions"
  ON public.listing_questions FOR INSERT
  WITH CHECK (asker_id = auth.uid() AND is_user_verified(auth.uid()));

-- Room owners can answer questions
CREATE POLICY "Owners can answer questions"
  ON public.listing_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM rooms WHERE rooms.id = room_id AND rooms.owner_id = auth.uid()
  ));

-- 14. Create function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_bans
    WHERE user_id = check_user_id
    AND is_active = true
    AND (is_permanent = true OR banned_until > now())
  );
$$;

-- 15. Create updated_at triggers
CREATE TRIGGER update_viewing_requests_updated_at
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_listing_questions_updated_at
  BEFORE UPDATE ON public.listing_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 16. Create storage bucket for decline evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('decline-evidence', 'decline-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for decline evidence
CREATE POLICY "Users can upload decline evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'decline-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'decline-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'decline-evidence' 
    AND is_admin(auth.uid())
  );

-- 17. Create indexes for performance
CREATE INDEX idx_viewing_requests_tenant ON public.viewing_requests(tenant_id);
CREATE INDEX idx_viewing_requests_landlord ON public.viewing_requests(landlord_id);
CREATE INDEX idx_viewing_requests_room ON public.viewing_requests(room_id);
CREATE INDEX idx_viewing_requests_status ON public.viewing_requests(status);
CREATE INDEX idx_decline_reports_landlord ON public.decline_reports(landlord_id);
CREATE INDEX idx_decline_reports_broker_flag ON public.decline_reports(broker_illegal_fees) WHERE broker_illegal_fees = true;
CREATE INDEX idx_user_bans_active ON public.user_bans(user_id) WHERE is_active = true;
CREATE INDEX idx_listing_questions_room ON public.listing_questions(room_id);
