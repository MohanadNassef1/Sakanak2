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
      let baseQuery = supabase
        .from('public_rooms')
        .select('*');

      // Filter by availability
      if (filters?.availability === 'rented') {
        baseQuery = baseQuery.eq('status', 'rented');
      } else if (filters?.availability === 'available' || !filters?.availability || filters?.availability === 'all' || filters?.availability === 'has_viewings') {
        // For 'all', show both active and rented
        if (filters?.availability === 'all' || filters?.availability === 'has_viewings') {
          baseQuery = baseQuery.in('status', ['active', 'rented']);
        } else {
          // 'available' or default: only active
          baseQuery = baseQuery.eq('status', 'active');
        }
      }

      // STRICT Gender filter
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
      if (filters?.vibes && filters.vibes.length > 0) {
        query = query.overlaps('personality_tags', filters.vibes);
      }
      if (filters?.studentsOnly) {
        query = query.eq('is_student_listing', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
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

// Fetch room IDs that have active viewing requests (pending, counter_proposed, or confirmed)
export const useRoomsWithViewings = () => {
  return useQuery({
    queryKey: ['rooms_with_viewings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('room_id')
        .in('status', ['pending', 'counter_proposed', 'confirmed']);

      if (error) throw error;
      return new Set((data || []).map(v => v.room_id));
    },
    staleTime: 30000, // 30s cache
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
      // Fetch room WITHOUT owner info first (to avoid exposing sensitive profile data)
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!room) return null;
      
      // SECURITY: Check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.id === room.owner_id;
      
      // SECURITY: Fetch owner public info using secure RPC function
      // This returns ONLY safe public fields - no email, phone, whatsapp
      let ownerInfo = null;
      if (!isOwner) {
        const { data: ownerData } = await supabase
          .rpc('get_room_owner_public_info', { _owner_id: room.owner_id });
        
        if (ownerData && ownerData.length > 0) {
          const owner = ownerData[0];
          ownerInfo = {
            full_name: owner.full_name,
            avatar_url: owner.avatar_url,
            verification_status: owner.is_verified ? 'verified' : 'unverified',
            age: owner.age,
            occupation: owner.occupation,
            university: owner.university,
            personality_tags: owner.personality_tags,
            nationality: owner.nationality
          };
        }
      } else {
        // Owner can see their own profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, verification_status, age, occupation, university, personality_tags, nationality')
          .eq('user_id', room.owner_id)
          .maybeSingle();
        ownerInfo = profileData;
      }
      
      // SECURITY: Strip sensitive payout fields from response for non-owners
      if (!isOwner) {
        return {
          ...room,
          payout_details: null,
          owner_payout_method: null,
          owner: ownerInfo
        } as Room;
      }
      
      return {
        ...room,
        owner: ownerInfo
      } as Room;
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
      
      // SECURITY: Fetch rooms without owner profile data to avoid exposing sensitive info
      const { data, error } = await supabase
        .from('saved_rooms')
        .select(`
          room_id,
          rooms (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Fetch owner info securely for each room using RPC
      const roomsWithOwners = await Promise.all(
        (data || []).map(async (item) => {
          const room = item.rooms;
          if (!room) return null;
          
          // Use secure RPC to get owner public info
          const { data: ownerData } = await supabase
            .rpc('get_room_owner_public_info', { _owner_id: (room as any).owner_id });
          
          let ownerInfo = null;
          if (ownerData && ownerData.length > 0) {
            const owner = ownerData[0];
            ownerInfo = {
              full_name: owner.full_name,
              avatar_url: owner.avatar_url,
              verification_status: owner.is_verified ? 'verified' : 'unverified'
            };
          }
          
          return {
            ...room,
            owner: ownerInfo
          };
        })
      );
      
      return roomsWithOwners.filter(Boolean) as Room[];
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
