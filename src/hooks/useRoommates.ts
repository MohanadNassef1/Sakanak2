import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { RoommateProfile, RoommateWithScore, RoommateFilters, MatchingCriteria } from '@/types/roommate';
import { rankRoommates } from '@/lib/matchingAlgorithm';

export function useRoommates(filters: RoommateFilters = {}) {
  const { user } = useAuth();
  const { data: currentProfile, isLoading: profileLoading } = useProfile(user?.id);

  return useQuery({
    queryKey: ['roommates', filters, currentProfile?.gender],
    queryFn: async (): Promise<RoommateWithScore[]> => {
      // CRITICAL: Enforce gender filtering - must have user gender to proceed
      const userGender = currentProfile?.gender;
      if (!userGender) {
        // If no profile/gender, return empty array - cannot show mixed genders
        return [];
      }

      // Build query for verified users who are looking for a room
      let query = supabase
        .from('profiles')
        .select('id, user_id, full_name, gender, avatar_url, about, nationality, occupation, looking_for, is_smoker, has_pets, pet_type, verification_status, created_at')
        .eq('verification_status', 'verified')
        .not('looking_for', 'is', null)
        // Always filter by user's gender - mandatory, no bypass allowed
        .eq('gender', userGender);

      // Apply other filters
      if (filters.isSmoker !== undefined) {
        query = query.eq('is_smoker', filters.isSmoker);
      }
      if (filters.hasPets !== undefined) {
        query = query.eq('has_pets', filters.hasPets);
      }
      if (filters.occupation) {
        query = query.ilike('occupation', `%${filters.occupation}%`);
      }
      if (filters.searchQuery) {
        query = query.or(`full_name.ilike.%${filters.searchQuery}%,about.ilike.%${filters.searchQuery}%,occupation.ilike.%${filters.searchQuery}%`);
      }

      // Exclude current user
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const roommates = (data || []) as RoommateProfile[];

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

      // If no profile, return without scores
      return roommates.map(r => ({
        ...r,
        compatibilityScore: 0,
        matchReasons: [],
        isBestMatch: false,
      }));
    },
    // Only run query when we have the user's profile with gender
    enabled: !!user && !!currentProfile?.gender && !profileLoading,
  });
}

export function useRoommateProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['roommate', userId],
    queryFn: async (): Promise<RoommateProfile | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, gender, avatar_url, about, nationality, occupation, looking_for, is_smoker, has_pets, pet_type, verification_status, created_at')
        .eq('user_id', userId)
        .eq('verification_status', 'verified')
        .single();

      if (error) throw error;
      return data as RoommateProfile;
    },
    enabled: !!userId,
  });
}
