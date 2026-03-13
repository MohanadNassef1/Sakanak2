import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ViewingRequest, ViewingStatus, DeclineReport, DeclineReason } from '@/types/viewing';
import { toast } from 'sonner';
import { sendViewingNotification, formatDateForEmail, formatTimeForEmail } from '@/lib/viewingNotifications';

// Helper to get current language preference
const getIsArabic = () => {
  try {
    return localStorage.getItem('language') === 'ar';
  } catch {
    return false;
  }
};

// Build confirmation message with location and contact details
const buildConfirmationMessage = (
  room: { title: string; address?: string | null; area?: string | null; city?: string | null; location_link?: string | null },
  landlordProfile: { full_name: string; phone?: string | null; whatsapp?: string | null } | null,
  isArabic: boolean
) => {
  let message = '';
  
  if (isArabic) {
    message = `✅ **تم تأكيد موعد المعاينة!**\n\n`;
    
    // Location section
    message += `📍 **موقع اللقاء**\n`;
    message += `🏠 ${room.title}\n`;
    if (room.address) message += `📮 ${room.address}`;
    if (room.area) message += `، ${room.area}`;
    if (room.city) message += `، ${room.city}`;
    message += '\n';
    
    if (room.location_link) {
      message += `🗺️ الخريطة: ${room.location_link}\n`;
    }
    
    // Contact section
    if (landlordProfile) {
      message += `\n📞 **بيانات التواصل**\n`;
      message += `👤 ${landlordProfile.full_name}\n`;
      
      if (landlordProfile.phone) {
        message += `📱 الهاتف: ${landlordProfile.phone}\n`;
      }
      
      if (landlordProfile.whatsapp) {
        const whatsappNumber = landlordProfile.whatsapp.replace(/\D/g, '');
        message += `💬 واتساب: ${landlordProfile.whatsapp}\n`;
        message += `🔗 محادثة: https://wa.me/${whatsappNumber}\n`;
      }
    }
    
    message += `\n⏰ يرجى الحضور في الموعد المحدد. تواصل معي إذا واجهت صعوبة في إيجاد المكان.`;
  } else {
    message = `✅ **Viewing Confirmed!**\n\n`;
    
    // Location section
    message += `📍 **Meeting Location**\n`;
    message += `🏠 ${room.title}\n`;
    if (room.address) message += `📮 ${room.address}`;
    if (room.area) message += `, ${room.area}`;
    if (room.city) message += `, ${room.city}`;
    message += '\n';
    
    if (room.location_link) {
      message += `🗺️ Map: ${room.location_link}\n`;
    }
    
    // Contact section
    if (landlordProfile) {
      message += `\n📞 **Contact Details**\n`;
      message += `👤 ${landlordProfile.full_name}\n`;
      
      if (landlordProfile.phone) {
        message += `📱 Phone: ${landlordProfile.phone}\n`;
      }
      
      if (landlordProfile.whatsapp) {
        const whatsappNumber = landlordProfile.whatsapp.replace(/\D/g, '');
        message += `💬 WhatsApp: ${landlordProfile.whatsapp}\n`;
        message += `🔗 Chat: https://wa.me/${whatsappNumber}\n`;
      }
    }
    
    message += `\n⏰ Please arrive at the confirmed time. Contact me if you have trouble finding the place.`;
  }
  
  return message;
};

// Helper to fetch profile data - tries public_profiles first, then viewing participant RPC
async function fetchProfile(userId: string) {
  // Try public_profiles first (works when RLS allows access)
  const { data, error: viewError } = await supabase
    .from('public_profiles')
    .select('user_id, full_name, avatar_url, is_verified, age, occupation, job_title, university, personality_tags, nationality, is_smoker, has_pets')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (data) {
    return {
      ...data,
      verification_status: data.is_verified ? 'verified' : 'unverified',
      occupation_status: data.occupation || null,
    };
  }

  // Fallback: use security definer RPC that allows viewing participants to see each other
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_viewing_participant_profile', { _participant_id: userId })
    .maybeSingle();
  
  if (rpcError) {
    console.error('RPC get_viewing_participant_profile error:', rpcError);
  }
  
  if (rpcData) {
    return {
      ...rpcData,
      is_verified: rpcData.verification_status === 'verified',
    };
  }

  console.warn('Could not fetch profile for user:', userId, { viewError, rpcError });
  return null;
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
            id, title, city, area, address, photos, price_per_month, lister_type
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
            id, title, city, area, address, photos, price_per_month, lister_type
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

// Count active viewing requests for a room (visible to anyone via RPC)
export function useRoomViewingCount(roomId: string) {
  return useQuery({
    queryKey: ['room-viewing-count', roomId],
    queryFn: async (): Promise<number> => {
      if (!roomId) return 0;
      
      const { data, error } = await supabase
        .rpc('get_room_viewing_count', { _room_id: roomId });
      
      if (error) return 0;
      return data || 0;
    },
    enabled: !!roomId,
  });
}

// Check if current user has a confirmed/completed viewing for a room
export function useUserConfirmedViewing(roomId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['confirmed-viewing', roomId, user?.id],
    queryFn: async (): Promise<{ hasConfirmed: boolean; viewingId: string | null }> => {
      if (!user?.id || !roomId) return { hasConfirmed: false, viewingId: null };
      
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('room_id', roomId)
        .eq('tenant_id', user.id)
        .in('status', ['confirmed', 'completed', 'rental_confirmed'])
        .limit(1);
      
      if (error || !data || data.length === 0) return { hasConfirmed: false, viewingId: null };
      return { hasConfirmed: true, viewingId: data[0].id };
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
      
      // Fetch tenant name and room title for email notification
      const [tenantProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', data.room_id).single(),
      ]);
      
      // Send email notification to landlord (fire-and-forget)
      sendViewingNotification({
        type: 'new_viewing_request',
        viewing_id: viewing.id,
        recipient_id: data.landlord_id,
        sender_name: tenantProfile.data?.full_name || 'A user',
        room_title: roomData.data?.title || 'Your listing',
        proposed_date: formatDateForEmail(data.proposed_date),
        proposed_time: formatTimeForEmail(data.proposed_time_start),
      });
      
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
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('proposed_date, proposed_time_start, room_id, landlord_id, tenant_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update viewing status to confirmed
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'confirmed' as ViewingStatus,
          confirmed_date: viewing.proposed_date,
          confirmed_time: viewing.proposed_time_start,
          confirmed_at: new Date().toISOString(),
          location_shared: true,
          location_shared_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
      
      // Small delay to ensure the status update is committed for RLS
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get room details to send location link in chat
      const { data: room } = await supabase
        .from('rooms')
        .select('title, address, area, city, location_link')
        .eq('id', viewing.room_id)
        .single();
      
      // Get landlord contact details
      const { data: landlordProfile } = await supabase
        .from('profiles')
        .select('full_name, phone, whatsapp')
        .eq('user_id', viewing.landlord_id)
        .single();
      
      if (room) {
        const isArabic = getIsArabic();
        const message = buildConfirmationMessage(room, landlordProfile, isArabic);
        
        // Send message in viewing chat - use current user (landlord) as sender
        const { error: msgError } = await (supabase
          .from('viewing_messages' as any)
          .insert({
            viewing_id: viewingId,
            sender_id: user.id,
            content: message,
          }) as any);
        
        if (msgError) {
          console.error('Failed to send auto message:', msgError);
        }
        
        // Send email notification to tenant (fire-and-forget)
        sendViewingNotification({
          type: 'viewing_confirmed',
          viewing_id: viewingId,
          recipient_id: viewing.tenant_id,
          sender_name: landlordProfile?.full_name || 'The host',
          room_title: room.title,
          proposed_date: formatDateForEmail(viewing.proposed_date),
          proposed_time: formatTimeForEmail(viewing.proposed_time_start),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing confirmed! Contact details sent to tenant.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm viewing');
    },
  });
}

// Build counter-propose auto-message with new time and room/contact details
const buildCounterProposeMessage = (
  newDate: string,
  newTimeStart: string,
  newTimeEnd: string,
  roomDetails: { title: string; address?: string | null; area?: string | null; city?: string | null; location_link?: string | null; price_per_month?: number | null } | null,
  landlordPhone: string | null | undefined,
  landlordResponse: string | undefined,
  isArabic: boolean
) => {
  let message = '';

  if (isArabic) {
    message = `🔄 **تم اقتراح وقت جديد للمعاينة**\n\n`;
    message += `📅 التاريخ: ${newDate}\n`;
    message += `⏰ الوقت: ${newTimeStart.substring(0, 5)} - ${newTimeEnd.substring(0, 5)}\n`;

    if (landlordResponse) {
      message += `\n💬 ${landlordResponse}\n`;
    }

    if (roomDetails) {
      message += `\n🏠 **تفاصيل الغرفة**\n`;
      message += `📛 ${roomDetails.title}\n`;
      if (roomDetails.address) message += `📍 العنوان: ${roomDetails.address}\n`;
      if (roomDetails.area || roomDetails.city) message += `🌍 ${[roomDetails.area, roomDetails.city].filter(Boolean).join('، ')}\n`;
      if (roomDetails.price_per_month) message += `💰 ${roomDetails.price_per_month.toLocaleString()} جنيه/شهر\n`;
      if (roomDetails.location_link) message += `📌 الموقع: ${roomDetails.location_link}\n`;
    }

    if (landlordPhone) {
      message += `\n📞 رقم التواصل: ${landlordPhone}\n`;
    }
  } else {
    message = `🔄 **New Time Proposed for Viewing**\n\n`;
    message += `📅 Date: ${newDate}\n`;
    message += `⏰ Time: ${newTimeStart.substring(0, 5)} - ${newTimeEnd.substring(0, 5)}\n`;

    if (landlordResponse) {
      message += `\n💬 ${landlordResponse}\n`;
    }

    if (roomDetails) {
      message += `\n🏠 **Room Details**\n`;
      message += `📛 ${roomDetails.title}\n`;
      if (roomDetails.address) message += `📍 Address: ${roomDetails.address}\n`;
      if (roomDetails.area || roomDetails.city) message += `🌍 ${[roomDetails.area, roomDetails.city].filter(Boolean).join(', ')}\n`;
      if (roomDetails.price_per_month) message += `💰 EGP ${roomDetails.price_per_month.toLocaleString()}/month\n`;
      if (roomDetails.location_link) message += `📌 Location: ${roomDetails.location_link}\n`;
    }

    if (landlordPhone) {
      message += `\n📞 Contact: ${landlordPhone}\n`;
    }
  }

  return message;
};

// Landlord proposes new time
export function useCounterProposeViewing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      viewingId: string;
      counter_proposed_date: string;
      counter_proposed_time_start: string;
      counter_proposed_time_end: string;
      landlord_response?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { viewingId, ...updateData } = data;
      
      // Get viewing to find tenant and room
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('tenant_id, room_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          ...updateData,
          status: 'counter_proposed' as ViewingStatus,
        })
        .eq('id', viewingId);
      
      if (error) throw error;

      // Small delay to ensure the status update is committed for RLS
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch landlord name, tenant profile, and room title
      const [landlordProfile, tenantProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('profiles').select('full_name, age, nationality, occupation_status, occupation, job_title, university, personality_tags, is_smoker, has_pets').eq('user_id', viewing.tenant_id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);

      // Send auto-message in viewing chat with new time + tenant details
      const isArabic = getIsArabic();
      const chatMessage = buildCounterProposeMessage(
        data.counter_proposed_date,
        data.counter_proposed_time_start,
        data.counter_proposed_time_end,
        tenantProfile.data,
        roomData.data?.title || 'The listing',
        data.landlord_response,
        isArabic
      );

      const { error: msgError } = await (supabase
        .from('viewing_messages' as any)
        .insert({
          viewing_id: viewingId,
          sender_id: user.id,
          content: chatMessage,
        }) as any);

      if (msgError) {
        console.error('Failed to send counter-propose auto message:', msgError);
      }
      
      // Send email notification to tenant (fire-and-forget)
      sendViewingNotification({
        type: 'counter_proposal',
        viewing_id: viewingId,
        recipient_id: viewing.tenant_id,
        sender_name: landlordProfile.data?.full_name || 'The host',
        room_title: roomData.data?.title || 'The listing',
        counter_date: formatDateForEmail(data.counter_proposed_date),
        counter_time: formatTimeForEmail(data.counter_proposed_time_start),
      });
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

// Tenant proposes new time (counter-proposal from tenant side)
export function useTenantCounterPropose() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      viewingId: string;
      proposed_date: string;
      proposed_time_start: string;
      proposed_time_end: string;
      tenant_message?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { viewingId, ...updateData } = data;
      
      // Get viewing to find landlord and room
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('landlord_id, room_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update viewing with new proposed time (back to pending status)
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          proposed_date: updateData.proposed_date,
          proposed_time_start: updateData.proposed_time_start,
          proposed_time_end: updateData.proposed_time_end,
          tenant_message: updateData.tenant_message,
          status: 'pending' as ViewingStatus,
          // Clear any previous counter-proposal
          counter_proposed_date: null,
          counter_proposed_time_start: null,
          counter_proposed_time_end: null,
        })
        .eq('id', viewingId);
      
      if (error) throw error;
      
      // Fetch tenant name and room title for email notification
      const [tenantProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);
      
      // Send email notification to landlord (fire-and-forget)
      sendViewingNotification({
        type: 'counter_proposal',
        viewing_id: viewingId,
        recipient_id: viewing.landlord_id,
        sender_name: tenantProfile.data?.full_name || 'The tenant',
        room_title: roomData.data?.title || 'The listing',
        counter_date: formatDateForEmail(data.proposed_date),
        counter_time: formatTimeForEmail(data.proposed_time_start),
      });
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
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('counter_proposed_date, counter_proposed_time_start, room_id, landlord_id')
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
          location_shared: true,
          location_shared_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
      
      // Now fetch room and landlord details for the auto-message
      // Small delay to ensure the status update is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get room details to send location link in chat
      const { data: room } = await supabase
        .from('rooms')
        .select('title, address, area, city, location_link')
        .eq('id', viewing.room_id)
        .single();
      
      // Get landlord contact details
      const { data: landlordProfile } = await supabase
        .from('profiles')
        .select('full_name, phone, whatsapp')
        .eq('user_id', viewing.landlord_id)
        .single();
      
      // Get tenant name for notification
      const { data: tenantProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (room) {
        const isArabic = getIsArabic();
        const message = buildConfirmationMessage(room, landlordProfile, isArabic);
        
        // Send message in viewing chat - use current user as sender
        const { error: msgError } = await (supabase
          .from('viewing_messages' as any)
          .insert({
            viewing_id: viewingId,
            sender_id: user.id,
            content: message,
          }) as any);
        
        if (msgError) {
          console.error('Failed to send auto message:', msgError);
        }
        
        // Send email notification to landlord that their proposal was accepted
        sendViewingNotification({
          type: 'viewing_confirmed',
          viewing_id: viewingId,
          recipient_id: viewing.landlord_id,
          sender_name: tenantProfile?.full_name || 'The tenant',
          room_title: room.title,
          proposed_date: formatDateForEmail(viewing.counter_proposed_date),
          proposed_time: formatTimeForEmail(viewing.counter_proposed_time_start),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing time confirmed! Contact details sent.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept time');
    },
  });
}

// Cancel viewing request
export function useCancelViewing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get viewing details first
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('tenant_id, landlord_id, room_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({ status: 'cancelled' as ViewingStatus })
        .eq('id', viewingId);
      
      if (error) throw error;
      
      // Determine who to notify (the other party)
      const isTenant = viewing.tenant_id === user.id;
      const recipientId = isTenant ? viewing.landlord_id : viewing.tenant_id;
      
      // Fetch sender name and room title for notification
      const [senderProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);
      
      // Send email notification to the other party (fire-and-forget)
      sendViewingNotification({
        type: 'viewing_cancelled',
        viewing_id: viewingId,
        recipient_id: recipientId,
        sender_name: senderProfile.data?.full_name || (isTenant ? 'The tenant' : 'The host'),
        room_title: roomData.data?.title || 'The listing',
      });
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
  
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get viewing details for notification
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('tenant_id, landlord_id, room_id')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'completed' as ViewingStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', viewingId);
      
      if (error) throw error;
      
      // Notify the tenant that the viewing is completed
      const [senderProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);
      
      sendViewingNotification({
        type: 'viewing_completed',
        viewing_id: viewingId,
        recipient_id: viewing.tenant_id,
        sender_name: senderProfile.data?.full_name || 'The host',
        room_title: roomData.data?.title || 'The listing',
      });
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
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewingId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get viewing to check current state and find room_id
      const { data: viewing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('room_id, tenant_id, landlord_id, tenant_rental_confirmed, landlord_rental_confirmed')
        .eq('id', viewingId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const isTenant = viewing.tenant_id === user.id;
      const isLandlord = viewing.landlord_id === user.id;
      
      if (!isTenant && !isLandlord) {
        throw new Error('You are not a participant in this viewing');
      }
      
      // Client-side guard: check if room is already rented
      const { data: room } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', viewing.room_id)
        .single();
      
      if (room?.status === 'rented') {
        throw new Error('This room has already been rented');
      }
      
      // Check if another viewing for this room is already rental_confirmed
      const { data: existingRental } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('room_id', viewing.room_id)
        .eq('status', 'rental_confirmed')
        .neq('id', viewingId)
        .limit(1);
      
      if (existingRental && existingRental.length > 0) {
        throw new Error('This room has already been rented through another viewing');
      }
      
      // Calculate new confirmation states
      const newTenantConfirmed = isTenant ? true : viewing.tenant_rental_confirmed;
      const newLandlordConfirmed = isLandlord ? true : viewing.landlord_rental_confirmed;
      const bothConfirmed = newTenantConfirmed && newLandlordConfirmed;
      
      // Update viewing with confirmation
      const updateData: any = {};
      if (isTenant) {
        updateData.tenant_rental_confirmed = true;
        updateData.tenant_rental_confirmed_at = new Date().toISOString();
      }
      if (isLandlord) {
        updateData.landlord_rental_confirmed = true;
        updateData.landlord_rental_confirmed_at = new Date().toISOString();
      }
      
      // Only set status to rental_confirmed when both have confirmed
      if (bothConfirmed) {
        updateData.status = 'rental_confirmed' as ViewingStatus;
      }
      
      const { error: viewingError } = await supabase
        .from('viewing_requests')
        .update(updateData)
        .eq('id', viewingId);
      
      if (viewingError) throw viewingError;
      
      // Update room status to rented only when both confirmed
      if (bothConfirmed) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'rented' })
          .eq('id', viewing.room_id);
        
        if (roomError) throw roomError;
      }
      
      // Send rental confirmation email to the other party
      const recipientId = isTenant ? viewing.landlord_id : viewing.tenant_id;
      const [senderProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);
      
      sendViewingNotification({
        type: 'rental_confirmed',
        viewing_id: viewingId,
        recipient_id: recipientId,
        sender_name: senderProfile.data?.full_name || (isTenant ? 'The tenant' : 'The host'),
        room_title: roomData.data?.title || 'The listing',
      });
      
      return { bothConfirmed, isTenant, isLandlord };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      if (result.bothConfirmed) {
        toast.success('Rental confirmed by both parties! Congratulations!');
      } else if (result.isTenant) {
        toast.success('You confirmed the rental! Waiting for landlord confirmation.');
      } else {
        toast.success('You confirmed the rental! Waiting for tenant confirmation.');
      }
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
      
      // Fetch tenant name and room title for notification
      const [tenantProfile, roomData] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('rooms').select('title').eq('id', viewing.room_id).single(),
      ]);
      
      // Get human-readable decline reason
      const DECLINE_REASON_LABELS: Record<DeclineReason, string> = {
        different_than_photos: 'Apartment looks different than photos',
        location_issues: 'Location/neighborhood issues',
        price_too_high: 'Price is higher than advertised',
        found_better_option: 'Found a better option',
        broker_illegal_fees: 'Broker asked for illegal/extra fees',
        safety_concerns: 'Safety concerns',
        other: 'Other reason',
      };
      
      // Send email notification to landlord (fire-and-forget)
      sendViewingNotification({
        type: 'viewing_declined',
        viewing_id: data.viewingId,
        recipient_id: viewing.landlord_id,
        sender_name: tenantProfile.data?.full_name || 'The tenant',
        room_title: roomData.data?.title || 'The listing',
        decline_reason: DECLINE_REASON_LABELS[data.reason] || data.reason,
      });
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
