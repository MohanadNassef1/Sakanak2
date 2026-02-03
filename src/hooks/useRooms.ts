import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, RoomFilters } from '@/types/room';

// userGender is MANDATORY for filtering - rooms must match user's gender
export const useRooms = (filters?: RoomFilters, userGender?: 'male' | 'female') => {
  return useQuery({
    queryKey: ['rooms', filters, userGender],
    queryFn: async () => {
      let query = supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(
            full_name,
            avatar_url,
            verification_status
          )
        `)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      // MANDATORY gender filter - only show rooms matching user's gender
      if (userGender) {
        query = query.eq('preferred_gender', userGender);
      }

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
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
      return data as Room[];
    },
    // Only fetch when we have user gender (mandatory filter)
    enabled: !!userGender,
  });
};

export const useFeaturedRooms = () => {
  return useQuery({
    queryKey: ['rooms', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(
            full_name,
            avatar_url,
            verification_status
          )
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Room[];
    },
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          owner:profiles!rooms_owner_id_fkey(
            full_name,
            avatar_url,
            verification_status,
            whatsapp,
            phone
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Room | null;
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
