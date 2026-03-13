import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadViewings = (): number => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      // Count viewings where current user needs to take action:
      // As landlord: pending viewings need response
      // As tenant: counter_proposed viewings need response
      const { count: landlordCount } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .eq('status', 'pending');

      const { count: tenantCount } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .eq('status', 'counter_proposed');

      setCount((landlordCount || 0) + (tenantCount || 0));
    };

    fetchCount();

    const channel = supabase
      .channel('unread-viewings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'viewing_requests' },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return count;
};
