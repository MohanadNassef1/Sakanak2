import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Check if current user is admin
export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ['isAdmin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      return !!data;
    },
    enabled: !!userId,
  });
}

// Admin: Delete a room
export function useAdminDeleteRoom() {
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
      toast.success('Room removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove room');
    },
  });
}

// Admin: Set user verification status to rejected (effectively hiding from roommates)
export function useAdminRemoveRoommate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Set verification status to 'rejected' which hides them from roommate listings
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      toast.success('User removed from roommates');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user');
    },
  });
}
