import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadViewingMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unread-viewing-messages-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get all viewing requests where user is involved and chat is unlocked
      const { data: viewings } = await supabase
        .from('viewing_requests')
        .select('id')
        .or(`tenant_id.eq.${user.id},landlord_id.eq.${user.id}`)
        .in('status', ['confirmed', 'completed', 'rental_confirmed']);

      if (!viewings || viewings.length === 0) return 0;

      const viewingIds = viewings.map(v => v.id);

      // Count unread viewing messages
      const { count } = await (supabase
        .from('viewing_messages' as any)
        .select('*', { count: 'exact', head: true })
        .in('viewing_id', viewingIds)
        .neq('sender_id', user.id)
        .is('read_at', null) as any);

      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`unread-viewing-badge-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'viewing_messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-viewing-messages-count', user.id] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'viewing_messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-viewing-messages-count', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query.data || 0;
};
