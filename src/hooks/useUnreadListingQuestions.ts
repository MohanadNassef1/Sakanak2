import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Counts unanswered questions across all listings owned by the current user.
 * These represent "new" questions the host hasn't acted on yet.
 * Clears naturally as the host posts answers.
 */
export function useUnreadListingQuestions() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      return;
    }

    let cancelled = false;

    const fetchCount = async () => {
      // Get owner's room IDs
      const { data: rooms, error: roomsErr } = await supabase
        .from('rooms')
        .select('id')
        .eq('owner_id', user.id);

      if (roomsErr || !rooms || rooms.length === 0) {
        if (!cancelled) setCount(0);
        return;
      }

      const roomIds = rooms.map((r) => r.id);

      const { count: c, error } = await supabase
        .from('listing_questions')
        .select('id', { count: 'exact', head: true })
        .in('room_id', roomIds)
        .is('answer', null);

      if (!cancelled && !error) {
        setCount(c ?? 0);
      }
    };

    fetchCount();

    // Realtime: listen to inserts/updates on listing_questions
    const channel = supabase
      .channel(`unread-questions-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listing_questions' },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return count;
}
