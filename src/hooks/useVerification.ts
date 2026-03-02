import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  document_url_front: string | null;
  document_url_back: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to generate short-lived signed URLs for document viewing
// SECURITY: Uses 1-hour expiry instead of storing long-lived URLs
export const generateSecureDocumentUrl = async (filePath: string): Promise<string | null> => {
  if (!filePath) return null;
  
  // If it's already a signed URL (legacy data), return as-is but it will eventually expire
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  const { data, error } = await supabase.storage
    .from('verification-documents')
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry for security
  
  if (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
  
  return data.signedUrl;
};

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

      // SECURITY FIX: Return the file path instead of a long-lived signed URL
      // Signed URLs will be generated on-demand with short expiry when viewing
      return fileName;
    },
  });
};

export const useSubmitVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentType, 
      documentUrlFront, 
      documentUrlBack 
    }: { 
      documentType: string; 
      documentUrlFront: string;
      documentUrlBack: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile to pending
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // SECURITY: Store file paths instead of signed URLs
      // Document URLs stored are now file paths, not publicly accessible URLs
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_url: documentUrlFront, // File path for backward compatibility
          document_url_front: documentUrlFront, // File path
          document_url_back: documentUrlBack, // File path
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Send submission confirmation email (fire-and-forget)
      supabase.functions.invoke('send-verification-submitted').catch(
        err => console.error('Failed to send submission confirmation email:', err)
      );

      return data;
    },
    onSuccess: () => {
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
