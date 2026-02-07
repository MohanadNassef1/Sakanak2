import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useIsAdmin } from './useAdminActions';
import { RoommateProfile, RoommateWithScore, RoommateFilters, MatchingCriteria } from '@/types/roommate';
import { rankRoommates } from '@/lib/matchingAlgorithm';

// SECURITY: Escape special characters in LIKE patterns to prevent query manipulation
const escapeLikePattern = (str: string): string => {
  return str.replace(/[%_\\]/g, '\\$&');
};

// SECURITY: Sanitize and limit search input length
const sanitizeSearchInput = (input: string, maxLength: number = 100): string => {
  return input.trim().substring(0, maxLength);
};

export function useRoommates(filters: RoommateFilters = {}) {
  const { user } = useAuth();
  const { data: currentProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id);

  // Wait for admin check to complete before running the query
  const isReady = !!user && !profileLoading && !adminLoading;
  const adminStatus = isAdmin === true; // Explicit boolean check

  return useQuery({
    queryKey: ['roommates', filters, currentProfile?.gender, adminStatus],
    queryFn: async (): Promise<RoommateWithScore[]> => {
      const userGender = currentProfile?.gender;
      
      // Admins can see all verified roommates (no gender restriction)
      // Regular users must have gender set and can only see same-gender
      if (!adminStatus && !userGender) {
        return [];
      }

      // Build query using public_profiles view which excludes sensitive contact info
      let query = supabase
        .from('public_profiles')
        .select('user_id, full_name, gender, avatar_url, about, nationality, occupation, looking_for, is_smoker, has_pets, pet_type, verification_status, created_at')
        .eq('verification_status', 'verified');

      // Only apply gender filter for non-admin users
      if (!adminStatus && userGender) {
        query = query.eq('gender', userGender);
      }

      // Apply other filters
      if (filters.isSmoker !== undefined) {
        query = query.eq('is_smoker', filters.isSmoker);
      }
      if (filters.hasPets !== undefined) {
        query = query.eq('has_pets', filters.hasPets);
      }
      if (filters.occupation) {
        const sanitizedOccupation = escapeLikePattern(sanitizeSearchInput(filters.occupation));
        query = query.ilike('occupation', `%${sanitizedOccupation}%`);
      }
      if (filters.searchQuery) {
        const sanitizedQuery = escapeLikePattern(sanitizeSearchInput(filters.searchQuery));
        query = query.or(`full_name.ilike.%${sanitizedQuery}%,about.ilike.%${sanitizedQuery}%,occupation.ilike.%${sanitizedQuery}%`);
      }

      // Exclude current user
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map public_profiles data to RoommateProfile type
      const roommates = (data || []).map(p => ({
        id: p.user_id || '',
        user_id: p.user_id || '',
        full_name: p.full_name || '',
        gender: p.gender as 'male' | 'female',
        avatar_url: p.avatar_url,
        about: p.about,
        nationality: p.nationality,
        occupation: p.occupation,
        looking_for: p.looking_for,
        is_smoker: p.is_smoker || false,
        has_pets: p.has_pets || false,
        pet_type: p.pet_type,
        verification_status: p.verification_status as 'unverified' | 'pending' | 'verified' | 'rejected',
        created_at: p.created_at || '',
      })) as RoommateProfile[];

      // If we have current user profile, calculate compatibility scores
      if (currentProfile) {
        const criteria: MatchingCriteria = {
          gender: currentProfile.gender as 'male' | 'female',
          is_smoker: currentProfile.is_smoker || false,
          has_pets: currentProfile.has_pets || false,
          occupation: currentProfile.occupation,
          looking_for: currentProfile.looking_for,
        };
        return rankRoommates(criteria, roommates);
      }

      // If no profile or admin viewing all, return without scores
      return roommates.map(r => ({
        ...r,
        compatibilityScore: 0,
        matchReasons: [],
        isBestMatch: false,
      }));
    },
    // Wait for all checks to complete; admin can view without gender, regular users need gender
    enabled: isReady && (adminStatus || !!currentProfile?.gender),
  });
}

export function useRoommateProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['roommate', userId],
    queryFn: async (): Promise<RoommateProfile | null> => {
      if (!userId) return null;

      // Use public_profiles view which excludes sensitive contact info
      const { data, error } = await supabase
        .from('public_profiles')
        .select('user_id, full_name, gender, avatar_url, about, nationality, occupation, looking_for, is_smoker, has_pets, pet_type, verification_status, created_at')
        .eq('user_id', userId)
        .eq('verification_status', 'verified')
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Map public_profiles data to RoommateProfile type
      return {
        id: data.user_id || '',
        user_id: data.user_id || '',
        full_name: data.full_name || '',
        gender: data.gender as 'male' | 'female',
        avatar_url: data.avatar_url,
        about: data.about,
        nationality: data.nationality,
        occupation: data.occupation,
        looking_for: data.looking_for,
        is_smoker: data.is_smoker || false,
        has_pets: data.has_pets || false,
        pet_type: data.pet_type,
        verification_status: data.verification_status as 'unverified' | 'pending' | 'verified' | 'rejected',
        created_at: data.created_at || '',
      } as RoommateProfile;
    },
    enabled: !!userId,
  });
}
