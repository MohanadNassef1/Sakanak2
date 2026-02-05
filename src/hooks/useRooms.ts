import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, RoomFilters } from '@/types/room';

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
      let query = supabase
        .from('public_rooms')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      // Gender filter - only apply if user has gender set
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
      
      // Map public_rooms to Room type (owner info fetched separately on room detail page)
      return (data || []).map(room => ({
        ...room,
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
      return (data || []).map(room => ({
        ...room,
        owner: undefined
      })) as Room[];
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
