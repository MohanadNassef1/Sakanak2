export type ReservationStatus = 
  | 'pending_payment' 
  | 'paid' 
  | 'payment_failed' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'refunded';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PayoutMethod = 'instapay' | 'vodafone_cash' | 'fawry';

export interface Reservation {
  id: string;
  room_id: string;
  seeker_id: string;
  owner_id: string;
  status: ReservationStatus;
  check_in_date: string;
  duration_months: number;
  room_price: number;
  insurance_amount: number;
  platform_fee: number;
  total_paid: number;
  seeker_confirmed: boolean;
  owner_confirmed: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  room?: {
    title: string;
    photos: string[];
    city: string;
  };
  seeker?: {
    full_name: string;
    phone: string;
    whatsapp: string;
  };
  owner?: {
    full_name: string;
    phone: string;
    whatsapp: string;
  };
}

export interface Payment {
  id: string;
  reservation_id: string;
  user_id: string;
  amount: number;
  platform_fee: number;
  payment_type: 'reservation' | 'refund';
  status: PaymentStatus;
  paymob_order_id: string | null;
  paymob_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  reservation_id: string;
  owner_id: string;
  amount: number;
  payout_method: PayoutMethod;
  payout_details: string | null;
  status: PayoutStatus;
  processed_by: string | null;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  reservation?: Reservation;
  owner?: {
    full_name: string;
    phone: string;
    whatsapp: string;
  };
}
