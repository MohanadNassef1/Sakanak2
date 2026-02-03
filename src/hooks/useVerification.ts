import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useVerificationRequest = (userId?: string) => {
  return useQuery({
    queryKey: ['verificationRequest', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as VerificationRequest | null;
    },
    enabled: !!userId,
  });
};

export const useUploadVerificationDocument = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL since bucket is private
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (signedUrlError) throw signedUrlError;

      return signedUrlData.signedUrl;
    },
  });
};

export const useSubmitVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentType, documentUrl }: { documentType: string; documentUrl: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile to pending
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create verification request
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_url: documentUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequest'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useCancelVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete the request
      const { error: deleteError } = await supabase
        .from('verification_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update profile status back to unverified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'unverified' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequest'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
