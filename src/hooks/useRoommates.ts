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
    queryKey: ['roommates', filters],
    queryFn: async (): Promise<RoommateWithScore[]> => {
      // Call the secure RPC function that enforces gender filtering at DB level
      const { data, error } = await supabase.rpc('get_browsable_roommates', {
        _search_query: filters.searchQuery || null,
        _occupation: filters.occupation || null,
        _is_smoker: filters.isSmoker ?? null,
        _has_pets: filters.hasPets ?? null,
      });

      if (error) throw error;

      // Map RPC results to RoommateProfile type
      const roommates = (data || []).map((p: any) => ({
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

      // Calculate compatibility scores if we have current user profile
      if (currentProfile) {
        const criteria: MatchingCriteria = {
          gender: currentProfile.gender as 'male' | 'female',
          is_smoker: currentProfile.is_smoker || false,
          has_pets: currentProfile.has_pets || false,
          occupation: currentProfile.occupation,
          looking_for: currentProfile.looking_for,
          nationality: currentProfile.nationality,
          personality_tags: currentProfile.personality_tags,
        };
        return rankRoommates(criteria, roommates);
      }

      // Return without scores if no profile
      return roommates.map(r => ({
        ...r,
        compatibilityScore: 0,
        matchReasons: [],
        isBestMatch: false,
      }));
    },
    enabled: !!user && !profileLoading,
  });
}

export function useRoommateProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['roommate', userId],
    queryFn: async (): Promise<RoommateProfile | null> => {
      if (!userId) return null;

      // Call secure RPC that enforces gender filtering
      const { data, error } = await supabase.rpc('get_browsable_roommate', {
        _roommate_user_id: userId,
      });

      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      const p = data[0];
      return {
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
      } as RoommateProfile;
    },
    enabled: !!userId,
  });
}
