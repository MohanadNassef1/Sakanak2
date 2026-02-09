import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, RoomFilters } from '@/types/room';

// SECURITY: Escape special characters in LIKE patterns to prevent query manipulation
const escapeLikePattern = (str: string): string => {
  return str.replace(/[%_\\]/g, '\\$&');
};

// SECURITY: Sanitize and limit search input length
const sanitizeSearchInput = (input: string, maxLength: number = 100): string => {
  return input.trim().substring(0, maxLength);
};

// userGender is used for filtering - if provided, shows rooms matching user's gender  
// All users (authenticated or not) use public_rooms view for browsing - this excludes sensitive payout info
// The rooms table is only used for owner-specific operations (useUserRooms, useRoom for details)
export const useRooms = (filters?: RoomFilters, userGender?: 'male' | 'female', _isAuthenticated?: boolean) => {
  return useQuery({
    queryKey: ['rooms', filters, userGender],
    queryFn: async () => {
      // SECURITY: Always use public_rooms view for browsing rooms
      // This view excludes sensitive columns (payout_details, owner_payout_method, insurance_amount)
      // Individual room details use the rooms table with proper RLS checks
      // Build query with proper typing
      const baseQuery = supabase
        .from('public_rooms')
        .select('*')
        .eq('status', 'active');

      // STRICT Gender filter - males only see male rooms, females only see female rooms
      // Support both old format (male/female) and new format (males_only/females_only)
      let query = userGender 
        ? baseQuery.or(
            userGender === 'male' 
              ? 'preferred_gender.eq.male,preferred_gender.eq.males_only'
              : 'preferred_gender.eq.female,preferred_gender.eq.females_only'
          )
        : baseQuery;

      query = query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.city) {
        const sanitizedCity = escapeLikePattern(sanitizeSearchInput(filters.city));
        query = query.ilike('city', `%${sanitizedCity}%`);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price_per_month', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price_per_month', filters.maxPrice);
      }
      if (filters?.roomType) {
        query = query.eq('room_type', filters.roomType);
      }
      if (filters?.allowsSmoking !== undefined) {
        query = query.eq('allows_smoking', filters.allowsSmoking);
      }
      if (filters?.allowsPets !== undefined) {
        query = query.eq('allows_pets', filters.allowsPets);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map public_rooms to Room type (owner info fetched separately on room detail page)
      // Add default values for fields not in public_rooms view
      return (data || []).map(room => ({
        ...room,
        owner_id: '',
        views_count: 0,
        insurance_amount: 0,
        owner_payout_method: 'instapay' as const,
        owner: undefined
      })) as Room[];
    },
  });
};

export const useFeaturedRooms = () => {
  return useQuery({
    queryKey: ['rooms', 'featured'],
    queryFn: async () => {
      // Featured rooms on homepage - use public_rooms view for public access
      const { data, error } = await supabase
        .from('public_rooms')
        .select('*')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      // Add default values for fields not in public_rooms view
      return (data || []).map(room => ({
        ...room,
        owner_id: '',
        views_count: 0,
        insurance_amount: 0,
        owner_payout_method: 'instapay' as const,
        owner: undefined
      })) as Room[];
    },
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      // Fetch room with owner info
      // Note: payout_details and owner_payout_method are fetched but should only be shown to owners
      // The RLS policy allows authenticated users to view active rooms for detail page functionality
      const { data: room, error } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(
            full_name,
            avatar_url,
            verification_status,
            age,
            occupation,
            university,
            personality_tags
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!room) return null;
      
      // SECURITY: Strip sensitive payout fields from response for non-owners
      // Owners can see their own payout details via useUserRooms
      // This provides defense-in-depth even though UI doesn't display these fields
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.id === room.owner_id;
      
      if (!isOwner) {
        // Remove payout-related fields for non-owners
        return {
          ...room,
          payout_details: null,
          owner_payout_method: null,
        } as Room;
      }
      
      return room as Room;
    },
    enabled: !!id,
  });
};

export const useUserRooms = (userId?: string) => {
  return useQuery({
    queryKey: ['rooms', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Room[];
    },
    enabled: !!userId,
  });
};

export const useSavedRooms = (userId?: string) => {
  return useQuery({
    queryKey: ['saved_rooms', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('saved_rooms')
        .select(`
          room_id,
          rooms (
            *,
            owner:profiles!rooms_owner_id_fkey(
              full_name,
              avatar_url,
              verification_status
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.rooms) as Room[];
    },
    enabled: !!userId,
  });
};

export const useSaveRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, roomId }: { userId: string; roomId: string }) => {
      const { error } = await supabase
        .from('saved_rooms')
        .insert({ user_id: userId, room_id: roomId });
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['saved_rooms', userId] });
    },
  });
};

export const useUnsaveRoom = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ userId, roomId }: { userId: string; roomId: string }) => {
       const { error } = await supabase
         .from('saved_rooms')
         .delete()
         .eq('user_id', userId)
         .eq('room_id', roomId);
       if (error) throw error;
     },
     onSuccess: (_, { userId }) => {
       queryClient.invalidateQueries({ queryKey: ['saved_rooms', userId] });
     },
   });
 };
 
 export const useDeleteRoom = () => {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (roomId: string) => {
       const { error } = await supabase
         .from('rooms')
         .delete()
         .eq('id', roomId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['rooms'] });
     },
   });
};

export const useRelistRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'active' })
        .eq('id', roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
