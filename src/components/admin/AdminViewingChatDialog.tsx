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
        .select('id, sender_id, content, created_at, is_filtered')
        .eq('viewing_id', viewingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as MessageRow[];
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </DialogTitle>
          <DialogDescription>
            {tenantName || 'Tenant'} ↔ {landlordName || 'Landlord'}
            {roomTitle ? ` · ${roomTitle}` : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
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
                const senderName = fromTenant
                  ? tenantName || 'Tenant'
                  : landlordName || 'Landlord';
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex flex-col max-w-[80%] rounded-lg px-3 py-2',
                      fromTenant
                        ? 'bg-muted self-start'
                        : 'bg-primary/10 self-end'
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {senderName}
                      {m.is_filtered && (
                        <span className="text-destructive"> · filtered</span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(m.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminViewingChatDialog;
