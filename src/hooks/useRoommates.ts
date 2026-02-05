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

      // Build query using public_profiles view which excludes sensitive contact info
      // This is safer than querying profiles table directly
      let query = supabase
        .from('public_profiles')
        .select('user_id, full_name, gender, avatar_url, about, nationality, occupation, looking_for, is_smoker, has_pets, pet_type, verification_status, created_at')
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

      // Map public_profiles data to RoommateProfile type
      const roommates = (data || []).map(p => ({
        id: p.user_id || '',  // public_profiles doesn't have id, use user_id
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
