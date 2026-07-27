import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  viewingId: string;
  tenantId: string;
  tenantName?: string | null;
  landlordName?: string | null;
  roomTitle?: string | null;
  onClose: () => void;
}

interface MessageRow {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const getInitials = (name?: string | null) =>
  (name || 'U').trim().charAt(0).toUpperCase();

const AdminViewingChatDialog: React.FC<Props> = ({
  viewingId,
  tenantId,
  tenantName,
  landlordName,
  roomTitle,
  onClose,
}) => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-viewing-messages', viewingId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('viewing_messages')
        .select('id, sender_id, content, created_at')
        .eq('viewing_id', viewingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as MessageRow[];
    },
  });

  const senderIds = React.useMemo(() => {
    const ids = new Set<string>();
    (messages || []).forEach((m) => ids.add(m.sender_id));
    return Array.from(ids);
  }, [messages]);

  const { data: profiles } = useQuery({
    queryKey: ['admin-viewing-chat-profiles', viewingId, senderIds.join(',')],
    enabled: senderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);
      if (error) throw error;
      return (data || []) as ProfileRow[];
    },
  });

  const profileMap = React.useMemo(() => {
    const map = new Map<string, ProfileRow>();
    (profiles || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [profiles]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </DialogTitle>
          <DialogDescription>
            {tenantName || 'Tenant'} ↔ {landlordName || 'Landlord'}
            {roomTitle ? ` · ${roomTitle}` : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No messages exchanged yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m) => {
                  const fromTenant = m.sender_id === tenantId;
                  const profile = profileMap.get(m.sender_id);
                  const senderName =
                    profile?.full_name ||
                    (fromTenant
                      ? tenantName || 'Tenant'
                      : landlordName || 'Landlord');
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-end gap-2 max-w-[85%]',
                        fromTenant ? 'self-start' : 'self-end flex-row-reverse'
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'flex flex-col rounded-lg px-3 py-2 min-w-0',
                          fromTenant ? 'bg-muted' : 'bg-primary/10'
                        )}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {senderName}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {m.content}
                        </p>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(m.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminViewingChatDialog;
