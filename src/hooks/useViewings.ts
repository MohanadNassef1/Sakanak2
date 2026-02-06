import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ViewingRequest, ViewingStatus, DeclineReport, DeclineReason } from '@/types/viewing';
import { toast } from 'sonner';

// Helper to fetch profile data from public_profiles view
async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('public_profiles')
    .select('user_id, full_name, avatar_url, verification_status')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

// Fetch viewing requests for the current user (as tenant)
export function useTenantViewings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['viewings', 'tenant', user?.id],
    queryFn: async (): Promise<ViewingRequest[]> => {
      if (!user?.id) return [];
      
      // Fetch viewing requests with room data
      const { data: viewings, error } = await supabase
        .from('viewing_requests')
        .select(`
          *,
          room:rooms(
            id, title, city, area, address, photos, price_per_month
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!viewings || viewings.length === 0) return [];
      
      // Fetch landlord profiles separately
      const landlordIds = [...new Set(viewings.map(v => v.landlord_id))];
      const profilesMap = new Map();
      
      await Promise.all(landlordIds.map(async (id) => {
        const profile = await fetchProfile(id);
        if (profile) profilesMap.set(id, profile);
      }));
      
      // Merge profile data into viewings
      return viewings.map(viewing => ({
        ...viewing,
        landlord: profilesMap.get(viewing.landlord_id) || null,
      })) as unknown as ViewingRequest[];
    },
    enabled: !!user?.id,
  });
}

// Fetch viewing requests for the current user (as landlord)
export function useLandlordViewings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['viewings', 'landlord', user?.id],
    queryFn: async (): Promise<ViewingRequest[]> => {
      if (!user?.id) return [];
      
      // Fetch viewing requests with room data
      const { data: viewings, error } = await supabase
        .from('viewing_requests')
        .select(`
          *,
          room:rooms(
            id, title, city, area, address, photos, price_per_month
          )
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!viewings || viewings.length === 0) return [];
      
      // Fetch tenant profiles separately
      const tenantIds = [...new Set(viewings.map(v => v.tenant_id))];
      const profilesMap = new Map();
      
      await Promise.all(tenantIds.map(async (id) => {
        const profile = await fetchProfile(id);
        if (profile) profilesMap.set(id, profile);
      }));
      
      // Merge profile data into viewings
      return viewings.map(viewing => ({
        ...viewing,
        tenant: profilesMap.get(viewing.tenant_id) || null,
      })) as unknown as ViewingRequest[];
    },
    enabled: !!user?.id,
  });
}

// Check if user already has an active viewing request for a room
export function useHasExistingViewing(roomId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['existing-viewing', roomId, user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id || !roomId) return false;
      
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('room_id', roomId)
        .eq('tenant_id', user.id)
        .not('status', 'in', '("cancelled","declined","expired")')
        .limit(1);
      
      if (error) return false;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user?.id && !!roomId,
  });
}

// Create a new viewing request
export function useCreateViewing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      room_id: string;
      landlord_id: string;
      proposed_date: string;
      proposed_time_start: string;
      proposed_time_end: string;
      tenant_message?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Check for existing active viewing request for this room
      const { data: existingViewing } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('room_id', data.room_id)
        .eq('tenant_id', user.id)
        .not('status', 'in', '("cancelled","declined","expired")')
        .limit(1);
      
      if (existingViewing && existingViewing.length > 0) {
        throw new Error('You already have an active viewing request for this room');
      }
      
      const { data: viewing, error } = await supabase
        .from('viewing_requests')
        .insert({
          ...data,
          tenant_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return viewing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['existing-viewing'] });
      toast.success('Viewing request sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create viewing request');
    },
  });
}

// Landlord confirms viewing time
export function useConfirmViewing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('proposed_date, proposed_time_start')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'confirmed' as ViewingStatus,
          confirmed_date: viewing.proposed_date,
          confirmed_time: viewing.proposed_time_start,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing confirmed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm viewing');
    },
  });
}

// Landlord proposes new time
export function useCounterProposeViewing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      viewingId: string;
      counter_proposed_date: string;
      counter_proposed_time_start: string;
      counter_proposed_time_end: string;
      landlord_response?: string;
    }) => {
      const { viewingId, ...updateData } = data;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          ...updateData,
          status: 'counter_proposed' as ViewingStatus,
        })
        .eq('id', viewingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('New time proposed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to propose new time');
    },
  });
}

// Tenant accepts counter-proposal
export function useAcceptCounterProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('counter_proposed_date, counter_proposed_time_start')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'confirmed' as ViewingStatus,
          confirmed_date: viewing.counter_proposed_date,
          confirmed_time: viewing.counter_proposed_time_start,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing time confirmed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept time');
    },
  });
}

// Cancel viewing request
export function useCancelViewing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      const { error } = await supabase
        .from('viewing_requests')
        .update({ status: 'cancelled' as ViewingStatus })
        .eq('id', viewingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel viewing');
    },
  });
}

// Mark viewing as completed (tenant arrived)
export function useCompleteViewing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'completed' as ViewingStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update viewing');
    },
  });
}

// Tenant confirms rental
export function useConfirmRental() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      // Get viewing to find room_id
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('room_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update viewing status
      const { error: viewingError } = await supabase
        .from('viewing_requests')
        .update({ status: 'rental_confirmed' as ViewingStatus })
        .eq('id', viewingId);
      
      if (viewingError) throw viewingError;
      
      // Update room status to rented
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'rented' })
        .eq('id', viewing.room_id);
      
      if (roomError) throw roomError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Rental confirmed! Congratulations on your new home!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm rental');
    },
  });
}

// Tenant declines rental
export function useDeclineRental() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      viewingId: string;
      reason: DeclineReason;
      reason_details?: string;
      broker_illegal_fees: boolean;
      broker_fee_details?: string;
      evidence_photos?: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get viewing details
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('room_id, landlord_id')
        .eq('id', data.viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update viewing status
      const { error: viewingError } = await supabase
        .from('viewing_requests')
        .update({ status: 'declined' as ViewingStatus })
        .eq('id', data.viewingId);
      
      if (viewingError) throw viewingError;
      
      // Create decline report
      const { error: reportError } = await supabase
        .from('decline_reports')
        .insert({
          viewing_request_id: data.viewingId,
          tenant_id: user.id,
          landlord_id: viewing.landlord_id,
          room_id: viewing.room_id,
          reason: data.reason,
          reason_details: data.reason_details,
          broker_illegal_fees: data.broker_illegal_fees,
          broker_fee_details: data.broker_fee_details,
          evidence_photos: data.evidence_photos || [],
        });
      
      if (reportError) throw reportError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Thank you for your feedback');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit decline report');
    },
  });
}

// Share location with tenant (called after confirmation)
export function useShareLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      viewingId: string;
      roomAddress: string;
      conversationId?: string;
    }) => {
      // Update viewing to mark location shared
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          location_shared: true,
          location_shared_at: new Date().toISOString(),
        })
        .eq('id', data.viewingId);
      
      if (error) throw error;
      
      // If conversation exists, send location message
      if (data.conversationId) {
        const locationMessage = `📍 Meeting Location: ${data.roomAddress}\n\nPlease arrive at the confirmed time. Contact me if you have trouble finding the place.`;
        
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('messages').insert({
            conversation_id: data.conversationId,
            sender_id: userData.user.id,
            content: locationMessage,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Location shared with tenant!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share location');
    },
  });
}

// Check if user is banned
export function useIsBanned() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ban-status', user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('is_user_banned', { check_user_id: user.id });
      
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user?.id,
  });
}

// Get user warnings
export function useUserWarnings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['warnings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_warnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Acknowledge warning
export function useAcknowledgeWarning() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (warningId: string) => {
      const { error } = await supabase
        .from('user_warnings')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', warningId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] });
    },
  });
}
