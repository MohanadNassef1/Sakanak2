export interface RoommateProfile {
  id: string;
  user_id: string;
  full_name: string;
  gender: 'male' | 'female';
  avatar_url: string | null;
  about: string | null;
  nationality: string | null;
  occupation: string | null;
  looking_for: string | null;
  is_smoker: boolean;
  has_pets: boolean;
  pet_type: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface RoommateWithScore extends RoommateProfile {
  compatibilityScore: number;
  matchReasons: string[];
  isBestMatch: boolean;
}

export interface RoommateFilters {
  gender?: 'male' | 'female';
  occupation?: string;
  isSmoker?: boolean;
  hasPets?: boolean;
  searchQuery?: string;
}

export interface MatchingCriteria {
  gender: 'male' | 'female';
  is_smoker: boolean;
  has_pets: boolean;
  occupation: string | null;
  looking_for: string | null;
}
