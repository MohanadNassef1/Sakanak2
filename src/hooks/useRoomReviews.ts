import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RoomReview {
  id: string;
  room_id: string;
  reviewer_id: string;
  viewing_request_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
  };
}

export const useRoomReviews = (roomId: string) => {
  return useQuery({
    queryKey: ['room-reviews', roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_reviews')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch reviewer profiles
      const reviewerIds = [...new Set((data || []).map(r => r.reviewer_id))];
      const profiles: Record<string, { full_name: string; avatar_url: string | null; verification_status: string }> = {};
      
      if (reviewerIds.length > 0) {
        const { data: profileData } = await supabase
          .rpc('get_accessible_public_profiles');
        if (profileData) {
          for (const p of profileData) {
            if (reviewerIds.includes(p.user_id)) {
              profiles[p.user_id] = {
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                verification_status: p.is_verified ? 'verified' : 'unverified',
              };
            }
          }
        }
      }

      return (data || []).map(r => ({
        ...r,
        reviewer: profiles[r.reviewer_id] || { full_name: 'User', avatar_url: null, verification_status: 'unverified' },
      })) as RoomReview[];
    },
  });
};

export const useRoomAverageRating = (roomId: string) => {
  const { data: reviews } = useRoomReviews(roomId);
  if (!reviews || reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
};

// Check if user can review (has completed/rental_confirmed viewing for this room)
export const useCanReview = (roomId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['can-review', roomId, user?.id],
    enabled: !!roomId && !!user?.id,
    queryFn: async () => {
      // Get user's completed viewings for this room
      const { data: viewings } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('room_id', roomId)
        .eq('tenant_id', user!.id)
        .in('status', ['completed', 'rental_confirmed']);

      if (!viewings || viewings.length === 0) return { canReview: false, viewingId: null };

      // Check if already reviewed any of these viewings
      const viewingIds = viewings.map(v => v.id);
      const { data: existing } = await supabase
        .from('room_reviews')
        .select('id, viewing_request_id')
        .in('viewing_request_id', viewingIds);

      const reviewedIds = new Set((existing || []).map(e => e.viewing_request_id));
      const unreviewedViewing = viewings.find(v => !reviewedIds.has(v.id));

      return {
        canReview: !!unreviewedViewing,
        viewingId: unreviewedViewing?.id || null,
      };
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ roomId, viewingRequestId, rating, comment }: {
      roomId: string;
      viewingRequestId: string;
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from('room_reviews')
        .insert({
          room_id: roomId,
          reviewer_id: user!.id,
          viewing_request_id: viewingRequestId,
          rating,
          comment: comment || null,
        });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['room-reviews', vars.roomId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', vars.roomId] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, roomId }: { reviewId: string; roomId: string }) => {
      const { error } = await supabase
        .from('room_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
      return roomId;
    },
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: ['room-reviews', roomId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', roomId] });
    },
  });
};
