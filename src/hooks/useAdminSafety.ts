import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeclineReport, UserWarning, UserBan } from '@/types/viewing';
import { toast } from 'sonner';

// Fetch all decline reports (admin only)
export function useDeclineReports(onlyBrokerFlags = false) {
  return useQuery({
    queryKey: ['decline-reports', onlyBrokerFlags],
    queryFn: async (): Promise<DeclineReport[]> => {
      let query = supabase
        .from('decline_reports')
        .select(`
          *,
          tenant:profiles!decline_reports_tenant_id_fkey(full_name, avatar_url),
          landlord:profiles!decline_reports_landlord_id_fkey(full_name, avatar_url),
          room:rooms!decline_reports_room_id_fkey(title, city)
        `)
        .order('created_at', { ascending: false });
      
      if (onlyBrokerFlags) {
        query = query.eq('broker_illegal_fees', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DeclineReport[];
    },
  });
}

// Fetch all warnings (admin only)
export function useAllWarnings() {
  return useQuery({
    queryKey: ['all-warnings'],
    queryFn: async (): Promise<(UserWarning & { user?: { full_name: string; avatar_url: string | null } })[]> => {
      const { data, error } = await supabase
        .from('user_warnings')
        .select(`
          *,
          user:profiles!user_warnings_user_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as (UserWarning & { user?: { full_name: string; avatar_url: string | null } })[];
    },
  });
}

// Fetch all bans (admin only)
export function useAllBans() {
  return useQuery({
    queryKey: ['all-bans'],
    queryFn: async (): Promise<(UserBan & { user?: { full_name: string; avatar_url: string | null } })[]> => {
      const { data, error } = await supabase
        .from('user_bans')
        .select(`
          *,
          user:profiles!user_bans_user_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as (UserBan & { user?: { full_name: string; avatar_url: string | null } })[];
    },
  });
}

// Issue a warning
export function useIssueWarning() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      reason: string;
      related_report_id?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_warnings')
        .insert({
          user_id: data.user_id,
          issued_by: userData.user.id,
          reason: data.reason,
          related_report_id: data.related_report_id,
        });
      
      if (error) throw error;
      
      // Update the report if related
      if (data.related_report_id) {
        await supabase
          .from('decline_reports')
          .update({
            admin_reviewed: true,
            admin_reviewed_by: userData.user.id,
            admin_reviewed_at: new Date().toISOString(),
            admin_action: 'warning',
          })
          .eq('id', data.related_report_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-warnings'] });
      queryClient.invalidateQueries({ queryKey: ['decline-reports'] });
      toast.success('Warning issued successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to issue warning');
    },
  });
}

// Ban a user
export function useBanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      reason: string;
      is_permanent: boolean;
      banned_until?: string;
      related_report_id?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: data.user_id,
          banned_by: userData.user.id,
          reason: data.reason,
          is_permanent: data.is_permanent,
          banned_until: data.banned_until,
          related_report_id: data.related_report_id,
        });
      
      if (error) throw error;
      
      // Update the report if related
      if (data.related_report_id) {
        await supabase
          .from('decline_reports')
          .update({
            admin_reviewed: true,
            admin_reviewed_by: userData.user.id,
            admin_reviewed_at: new Date().toISOString(),
            admin_action: 'ban',
          })
          .eq('id', data.related_report_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bans'] });
      queryClient.invalidateQueries({ queryKey: ['decline-reports'] });
      toast.success('User banned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to ban user');
    },
  });
}

// Lift a ban
export function useLiftBan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_bans')
        .update({
          is_active: false,
          lifted_at: new Date().toISOString(),
          lifted_by: userData.user.id,
        })
        .eq('id', banId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bans'] });
      toast.success('Ban lifted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to lift ban');
    },
  });
}

// Dismiss a report
export function useDismissReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { reportId: string; admin_notes?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('decline_reports')
        .update({
          admin_reviewed: true,
          admin_reviewed_by: userData.user.id,
          admin_reviewed_at: new Date().toISOString(),
          admin_action: 'dismissed',
          admin_notes: data.admin_notes,
        })
        .eq('id', data.reportId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decline-reports'] });
      toast.success('Report dismissed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dismiss report');
    },
  });
}
