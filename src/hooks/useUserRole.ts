import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['userRoles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!userId,
  });
};

export const useIsAdmin = (userId?: string) => {
  const { data: roles, isLoading, error } = useUserRoles(userId);
  
  const isAdmin = roles?.some(role => role.role === 'admin') ?? false;
  
  return { isAdmin, isLoading, error };
};
