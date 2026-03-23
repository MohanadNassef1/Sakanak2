import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoomType } from '@/types/room';
import { trackCustomEvent } from '@/lib/fbPixel';

export interface CreateRoomInput {
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
  owner_payout_method?: 'instapay' | 'vodafone_cash' | 'fawry';
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
  lister_type?: 'landlord' | 'current_tenant' | 'landlord_and_tenant';
  deposit?: number;
  bills_included?: string[];
  personality_tags?: string[];
  price_negotiable?: boolean;
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract payout info before inserting room
      const { owner_payout_method, payout_details, ...roomInput } = input;

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          ...roomInput,
          owner_id: user.id,
          status: 'active',
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Insert payout info into separate secure table
      if (owner_payout_method || payout_details) {
        await supabase
          .from('room_payout_info')
          .insert({
            room_id: data.id,
            owner_id: user.id,
            payout_method: owner_payout_method || 'instapay',
            payout_details: payout_details || null,
          } as any);
      }


      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['userRooms'] });
      trackCustomEvent('RoomListed', {
        room_id: data?.id,
        room_type: data?.room_type,
        city: data?.city,
        price: data?.price_per_month,
      });
    },
  });
};

export const useUploadRoomPhoto = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('room-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('room-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });
};
