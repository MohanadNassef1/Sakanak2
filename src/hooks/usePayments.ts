import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, Payment, Payout } from '@/types/payment';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      room_id,
      check_in_date,
      duration_months,
    }: {
      room_id: string;
      check_in_date: string;
      duration_months: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { room_id, check_in_date, duration_months },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

export const useUserReservations = (userId?: string) => {
  return useQuery({
    queryKey: ['reservations', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(title, photos, city)
        `)
        .or(`seeker_id.eq.${userId},owner_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Reservation[];
    },
    enabled: !!userId,
  });
};

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(title, photos, city, address, owner_payout_method)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch seeker and owner profiles separately due to relation constraints
      const { data: seeker } = await supabase
        .from('profiles')
        .select('full_name, phone, whatsapp')
        .eq('user_id', data.seeker_id)
        .single();
        
      const { data: owner } = await supabase
        .from('profiles')
        .select('full_name, phone, whatsapp')
        .eq('user_id', data.owner_id)
        .single();

      return { ...data, seeker, owner } as unknown as Reservation;
    },
    enabled: !!id,
  });
};

export const useConfirmReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      confirmationType,
    }: {
      reservationId: string;
      confirmationType: 'seeker' | 'owner';
    }) => {
      const updateData =
        confirmationType === 'seeker'
          ? { seeker_confirmed: true }
          : { owner_confirmed: true };

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;

      // If both parties confirmed, update status to confirmed
      if (data.seeker_confirmed && data.owner_confirmed) {
        await supabase
          .from('reservations')
          .update({ status: 'confirmed' })
          .eq('id', reservationId);

        // Update payout to ready for processing
        await supabase
          .from('payouts')
          .update({ status: 'processing' })
          .eq('reservation_id', reservationId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

// Admin hooks
export const useAllReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(title, photos, city)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for each reservation
      const reservationsWithProfiles = await Promise.all(
        data.map(async (reservation) => {
          const { data: seeker } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', reservation.seeker_id)
            .single();
            
          const { data: owner } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', reservation.owner_id)
            .single();
            
          return { ...reservation, seeker, owner };
        })
      );
      
      return reservationsWithProfiles as unknown as Reservation[];
    },
  });
};

export const usePendingPayouts = () => {
  return useQuery({
    queryKey: ['payouts', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          reservation:reservations(
            *,
            room:rooms(title, photos, city)
          )
        `)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch owner profiles and seeker info
      const payoutsWithProfiles = await Promise.all(
        data.map(async (payout) => {
          const { data: owner } = await supabase
            .from('profiles')
            .select('full_name, phone, whatsapp')
            .eq('user_id', payout.owner_id)
            .single();
            
          const { data: seeker } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payout.reservation.seeker_id)
            .single();
            
          return { 
            ...payout, 
            owner, 
            reservation: { ...payout.reservation, seeker } 
          };
        })
      );
      
      return payoutsWithProfiles as unknown as Payout[];
    },
  });
};

export const useProcessPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutId,
      notes,
    }: {
      payoutId: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payouts')
        .update({
          status: 'completed',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) throw error;

      // Update reservation status to completed
      await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', data.reservation_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};
