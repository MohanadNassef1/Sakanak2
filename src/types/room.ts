export type RoomType = 'private_room' | 'shared_room' | 'studio' | 'apartment';
export type ListingStatus = 'draft' | 'active' | 'rented' | 'expired';

export interface Room {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  room_type: RoomType;
  price_per_month: number;
  city: string;
  area: string | null;
  address: string | null;
  photos: string[];
  amenities: string[];
  rules: string[];
  available_from: string;
  min_stay_months: number;
  max_roommates: number;
  current_roommates: number;
  preferred_gender: string;
  allows_smoking: boolean;
  allows_pets: boolean;
  is_featured: boolean;
  status: ListingStatus;
  views_count: number;
  insurance_amount: number;
  owner_payout_method: 'instapay' | 'vodafone_cash' | 'fawry';
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
  };
}

export interface RoomFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: RoomType;
  preferredGender?: string;
  allowsSmoking?: boolean;
  allowsPets?: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  gender: 'male' | 'female';
  avatar_url: string | null;
  about: string | null;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  occupation: string | null;
  looking_for: string | null;
  is_smoker: boolean;
  has_pets: boolean;
  pet_type: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}
