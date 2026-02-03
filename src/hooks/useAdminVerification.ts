import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VerificationRequest } from './useVerification';

export interface VerificationRequestWithProfile extends VerificationRequest {
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    gender: 'male' | 'female';
  } | null;
}

export const useAllVerificationRequests = (status?: string) => {
  return useQuery({
    queryKey: ['adminVerificationRequests', status],
    queryFn: async () => {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url,
            gender
          )
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VerificationRequestWithProfile[];
    },
  });
};

export const useApproveVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the request to find the user_id
      const { data: request, error: fetchError } = await supabase
        .from('verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('user_id', request.user_id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerificationRequests'] });
    },
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the request to find the user_id
      const { data: request, error: fetchError } = await supabase
        .from('verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'rejected' })
        .eq('user_id', request.user_id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerificationRequests'] });
    },
  });
};
