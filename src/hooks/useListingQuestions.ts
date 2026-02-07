import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ListingQuestion } from '@/types/viewing';
import { toast } from 'sonner';

// Fetch questions for a room
export function useListingQuestions(roomId: string | undefined) {
  return useQuery({
    queryKey: ['listing-questions', roomId],
    queryFn: async (): Promise<ListingQuestion[]> => {
      if (!roomId) return [];
      
      // Fetch questions with asker profile info
      // Use the foreign key relationship added via migration
      const { data, error } = await supabase
        .from('listing_questions')
        .select(`
          *,
          asker:profiles(full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as ListingQuestion[];
    },
    enabled: !!roomId,
  });
}

// Ask a question
export function useAskQuestion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { room_id: string; question: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: question, error } = await supabase
        .from('listing_questions')
        .insert({
          room_id: data.room_id,
          asker_id: user.id,
          question: data.question,
        })
        .select()
        .single();
      
      if (error) throw error;
      return question;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing-questions', variables.room_id] });
      toast.success('Question submitted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit question');
    },
  });
}

// Answer a question (landlord only)
export function useAnswerQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { questionId: string; answer: string; roomId: string }) => {
      const { error } = await supabase
        .from('listing_questions')
        .update({
          answer: data.answer,
          answered_at: new Date().toISOString(),
        })
        .eq('id', data.questionId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing-questions', variables.roomId] });
      toast.success('Answer posted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post answer');
    },
  });
}
