import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VerificationRequest, generateSecureDocumentUrl } from './useVerification';

export interface VerificationRequestWithProfile extends VerificationRequest {
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    gender: 'male' | 'female';
  } | null;
  // Secure URLs generated on-demand with short expiry
  secure_url_front?: string | null;
  secure_url_back?: string | null;
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
      
      // SECURITY: Generate short-lived signed URLs on-demand for admin viewing
      const requestsWithSecureUrls = await Promise.all(
        (data as VerificationRequestWithProfile[]).map(async (request) => {
          const [secureUrlFront, secureUrlBack] = await Promise.all([
            generateSecureDocumentUrl(request.document_url_front || request.document_url),
            request.document_url_back ? generateSecureDocumentUrl(request.document_url_back) : null,
          ]);
          
          return {
            ...request,
            secure_url_front: secureUrlFront,
            secure_url_back: secureUrlBack,
          };
        })
      );
      
      return requestsWithSecureUrls;
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

      // Send verification approved email (fire-and-forget)
      supabase.functions.invoke('send-verification-approved', {
        body: { userId: request.user_id, action: 'approved' },
      }).catch(err => console.error('Failed to send approval email:', err));
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

      // Send verification rejected email (fire-and-forget)
      supabase.functions.invoke('send-verification-approved', {
        body: { userId: request.user_id, action: 'rejected', reason },
      }).catch(err => console.error('Failed to send rejection email:', err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerificationRequests'] });
    },
  });
};
