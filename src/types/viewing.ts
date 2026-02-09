// Viewing Request Types for Sakanak

export type ViewingStatus = 
  | 'pending'
  | 'counter_proposed'
  | 'confirmed'
  | 'completed'
  | 'rental_confirmed'
  | 'declined'
  | 'cancelled'
  | 'expired';

export type DeclineReason = 
  | 'different_than_photos'
  | 'location_issues'
  | 'price_too_high'
  | 'found_better_option'
  | 'broker_illegal_fees'
  | 'safety_concerns'
  | 'other';

export interface ViewingRequest {
  id: string;
  room_id: string;
  tenant_id: string;
  landlord_id: string;
  
  // Scheduling
  proposed_date: string;
  proposed_time_start: string;
  proposed_time_end: string;
  counter_proposed_date: string | null;
  counter_proposed_time_start: string | null;
  counter_proposed_time_end: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  
  // Status
  status: ViewingStatus;
  location_shared: boolean;
  location_shared_at: string | null;
  
  // Rental confirmation (dual confirmation)
  tenant_rental_confirmed: boolean;
  landlord_rental_confirmed: boolean;
  tenant_rental_confirmed_at: string | null;
  landlord_rental_confirmed_at: string | null;
  
  // Messages
  tenant_message: string | null;
  landlord_response: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  
  // Joined data
  room?: {
    id: string;
    title: string;
    city: string;
    area: string | null;
    address: string | null;
    photos: string[];
    price_per_month: number;
    lister_type?: string | null;
  };
  tenant?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    age?: number | null;
    occupation?: string | null;
    occupation_status?: string | null;
    job_title?: string | null;
    university?: string | null;
    personality_tags?: string[] | null;
  };
  landlord?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    phone: string | null;
    whatsapp: string | null;
    age?: number | null;
    occupation?: string | null;
    occupation_status?: string | null;
    job_title?: string | null;
    university?: string | null;
    personality_tags?: string[] | null;
  };
}

export interface DeclineReport {
  id: string;
  viewing_request_id: string;
  tenant_id: string;
  landlord_id: string;
  room_id: string;
  
  reason: DeclineReason;
  reason_details: string | null;
  
  evidence_photos: string[];
  evidence_videos: string[];
  
  broker_illegal_fees: boolean;
  broker_fee_details: string | null;
  
  admin_reviewed: boolean;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  admin_action: 'warning' | 'ban' | 'dismissed' | null;
  admin_notes: string | null;
  
  created_at: string;
  
  // Joined data for admin view
  tenant?: {
    full_name: string;
    avatar_url: string | null;
  };
  landlord?: {
    full_name: string;
    avatar_url: string | null;
  };
  room?: {
    title: string;
    city: string;
  };
}

export interface UserWarning {
  id: string;
  user_id: string;
  issued_by: string;
  reason: string;
  related_report_id: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  related_report_id: string | null;
  is_permanent: boolean;
  banned_until: string | null;
  is_active: boolean;
  lifted_at: string | null;
  lifted_by: string | null;
  created_at: string;
}

export interface ListingQuestion {
  id: string;
  room_id: string;
  asker_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  asker?: {
    full_name: string;
    avatar_url: string | null;
  };
}

// Form types
export interface BookViewingFormData {
  proposed_date: Date;
  proposed_time_start: string;
  proposed_time_end: string;
  tenant_message?: string;
}

export interface DeclineFormData {
  reason: DeclineReason;
  reason_details?: string;
  broker_illegal_fees: boolean;
  broker_fee_details?: string;
  evidence_photos?: File[];
}

export const DECLINE_REASON_LABELS: Record<DeclineReason, string> = {
  different_than_photos: 'Apartment looks different than photos',
  location_issues: 'Location/neighborhood issues',
  price_too_high: 'Price is higher than advertised',
  found_better_option: 'Found a better option',
  broker_illegal_fees: 'Broker asked for illegal/extra fees',
  safety_concerns: 'Safety concerns',
  other: 'Other reason',
};

export const DECLINE_REASON_LABELS_AR: Record<DeclineReason, string> = {
  different_than_photos: 'الشقة تختلف عن الصور',
  location_issues: 'مشاكل في الموقع/الحي',
  price_too_high: 'السعر أعلى من المعلن',
  found_better_option: 'وجدت خياراً أفضل',
  broker_illegal_fees: 'طلب السمسار رسوم غير قانونية',
  safety_concerns: 'مخاوف أمنية',
  other: 'سبب آخر',
};

export const VIEWING_STATUS_LABELS: Record<ViewingStatus, string> = {
  pending: 'Pending Response',
  counter_proposed: 'New Time Proposed',
  confirmed: 'Viewing Confirmed',
  completed: 'Viewing Completed',
  rental_confirmed: 'Rental Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const VIEWING_STATUS_LABELS_AR: Record<ViewingStatus, string> = {
  pending: 'في انتظار الرد',
  counter_proposed: 'تم اقتراح وقت جديد',
  confirmed: 'تم تأكيد المعاينة',
  completed: 'اكتملت المعاينة',
  rental_confirmed: 'تم تأكيد الإيجار',
  declined: 'مرفوض',
  cancelled: 'ملغى',
  expired: 'منتهي الصلاحية',
};
