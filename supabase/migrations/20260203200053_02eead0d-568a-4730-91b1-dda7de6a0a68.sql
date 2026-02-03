-- Add insurance and payout fields to rooms table
ALTER TABLE public.rooms
ADD COLUMN insurance_amount numeric DEFAULT 0,
ADD COLUMN owner_payout_method text DEFAULT 'instapay';

-- Create reservations table to track bookings
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  check_in_date date NOT NULL,
  duration_months integer NOT NULL DEFAULT 1,
  room_price numeric NOT NULL,
  insurance_amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL,
  total_paid numeric NOT NULL,
  seeker_confirmed boolean DEFAULT false,
  owner_confirmed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  payment_type text NOT NULL DEFAULT 'reservation',
  status text NOT NULL DEFAULT 'pending',
  paymob_order_id text,
  paymob_transaction_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payouts table for tracking owner payments
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  amount numeric NOT NULL,
  payout_method text NOT NULL,
  payout_details text,
  status text NOT NULL DEFAULT 'pending',
  processed_by uuid,
  processed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Reservations policies
CREATE POLICY "Seekers can view their reservations"
ON public.reservations FOR SELECT
USING (seeker_id = auth.uid());

CREATE POLICY "Owners can view reservations for their rooms"
ON public.reservations FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
ON public.reservations FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Verified users can create reservations"
ON public.reservations FOR INSERT
WITH CHECK (seeker_id = auth.uid() AND is_user_verified(auth.uid()));

CREATE POLICY "Seekers can update their reservations"
ON public.reservations FOR UPDATE
USING (seeker_id = auth.uid());

CREATE POLICY "Owners can update reservations for their rooms"
ON public.reservations FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Admins can update all reservations"
ON public.reservations FOR UPDATE
USING (is_admin(auth.uid()));

-- Payments policies
CREATE POLICY "Users can view their payments"
ON public.payments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can create their payments"
ON public.payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
USING (is_admin(auth.uid()));

-- Payouts policies
CREATE POLICY "Owners can view their payouts"
ON public.payouts FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage payouts"
ON public.payouts FOR ALL
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();