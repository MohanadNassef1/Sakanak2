import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoomType } from '@/types/room';

export interface UpdateRoomInput {
  title: string;
  description?: string;
  room_type: RoomType;
  price_per_month: number;
  city: string;
  area?: string;
  address?: string;
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
  insurance_amount: number;
  owner_payout_method: 'instapay' | 'vodafone_cash' | 'fawry';
  payout_details?: string;
  // Amenity attributes
  has_natural_gas: boolean;
  has_wifi: boolean;
  has_elevator: boolean;
  has_balcony: boolean;
  has_doorman: boolean;
  has_ac: boolean;
  has_water_heater: boolean;
  has_private_bathroom: boolean;
  allows_visits: boolean;
  // Capacity
  total_bedrooms: number;
  // Location
  location_link?: string;
  // New fields
  lister_type?: 'landlord' | 'current_tenant';
  deposit?: number;
  bills_included?: string[];
  personality_tags?: string[];
  allowed_gender?: string;
}

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, input }: { roomId: string; input: Partial<UpdateRoomInput> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First verify the user owns this room
      const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single();

      if (fetchError) throw fetchError;
      if (room.owner_id !== user.id) throw new Error('You can only edit your own listings');

      const { data, error } = await supabase
        .from('rooms')
        .update(input as any)
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['userRooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    },
  });
};
