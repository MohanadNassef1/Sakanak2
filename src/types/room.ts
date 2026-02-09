export type RoomType = 'private_room' | 'shared_room' | 'studio' | 'apartment';
export type ListingStatus = 'draft' | 'active' | 'rented' | 'expired';
export type ListerType = 'landlord' | 'current_tenant';
// STRICT: No mixed gender allowed - only males_only or females_only
export type AllowedGender = 'males_only' | 'females_only';
export type OccupationStatus = 'student' | 'working' | 'unemployed';

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
  // Amenity attributes
  has_natural_gas?: boolean;
  has_wifi?: boolean;
  has_elevator?: boolean;
  has_balcony?: boolean;
  has_doorman?: boolean;
  has_ac?: boolean;
  has_water_heater?: boolean;
  has_private_bathroom?: boolean;
  // House rules
  allows_visits?: boolean;
  // Capacity
  total_bedrooms?: number;
  // Location
  location_link?: string | null;
  // New fields
  lister_type?: ListerType | null;
  deposit?: number;
  bills_included?: string[];
  personality_tags?: string[];
  allowed_gender?: AllowedGender;
  // Joined data
  owner?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    phone?: string | null;
    whatsapp?: string | null;
    age?: number | null;
    occupation?: string | null;
    university?: string | null;
    personality_tags?: string[] | null;
  };
}

export interface RoomFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: RoomType;
  allowsSmoking?: boolean;
  allowsPets?: boolean;
  vibes?: string[];
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  gender: 'male' | 'female';
  avatar_url: string | null;
  about: string | null;
  bio: string | null;
  age: number | null;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  occupation: string | null;
  occupation_status: OccupationStatus | null;
  job_title: string | null;
  university: string | null;
  is_student_verified: boolean;
  personality_tags: string[];
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
