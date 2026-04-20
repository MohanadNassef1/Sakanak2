import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RoomFilters } from '@/types/room';

export interface SavedSearch {
  id: string;
  user_id: string;
  label: string | null;
  filters: RoomFilters;
  notify_email: boolean;
  notify_in_app: boolean;
  is_active: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export interface SearchNotification {
  id: string;
  user_id: string;
  saved_search_id: string;
  room_id: string;
  is_read: boolean;
  created_at: string;
}

export const useSavedSearches = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved-searches', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SavedSearch[];
    },
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ label, filters }: { label?: string; filters: RoomFilters }) => {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user!.id,
          label: label || null,
          filters: filters as any,
          notify_email: true,
          notify_in_app: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useToggleSavedSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('saved_searches')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
};

export const useSearchNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['search-notifications', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as SearchNotification[];
    },
  });
};

export const useUnreadSearchNotifications = () => {
  const { data } = useSearchNotifications();
  return data?.filter(n => !n.is_read).length || 0;
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('search_notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-notifications'] });
    },
  });
};
