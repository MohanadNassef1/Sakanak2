import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, ArrowLeft, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  userId: string;
  userName: string;
  onClose: () => void;
}

interface ViewingRow {
  id: string;
  room_id: string;
  tenant_id: string;
  landlord_id: string;
  status: string;
  updated_at: string;
  room?: { title: string | null } | null;
  tenant?: { full_name: string | null } | null;
  landlord?: { full_name: string | null } | null;
}

interface MessageRow {
  id: string;
  viewing_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_filtered: boolean | null;
}

const AdminUserChatsDialog: React.FC<Props> = ({ userId, userName, onClose }) => {
  const [selectedViewing, setSelectedViewing] = useState<ViewingRow | null>(null);

  const { data: viewings, isLoading } = useQuery({
    queryKey: ['admin-user-viewings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select(`
          id, room_id, tenant_id, landlord_id, status, updated_at,
          room:rooms!viewing_requests_room_id_fkey(title),
          tenant:profiles!viewing_requests_tenant_id_fkey(full_name),
          landlord:profiles!viewing_requests_landlord_id_fkey(full_name)
        `)
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
        .in('status', ['confirmed', 'completed', 'rental_confirmed', 'counter_proposed'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ViewingRow[];
    },
  });

  const { data: messages, isLoading: msgLoading } = useQuery({
    queryKey: ['admin-viewing-messages', selectedViewing?.id],
    enabled: !!selectedViewing?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('viewing_messages')
        .select('id, viewing_id, sender_id, content, created_at, is_filtered')
        .eq('viewing_id', selectedViewing!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as MessageRow[];
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedViewing && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedViewing(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <MessageCircle className="h-5 w-5" />
            {selectedViewing ? 'Conversation' : `Chats for ${userName}`}
          </DialogTitle>
          <DialogDescription>
            {selectedViewing
              ? `${selectedViewing.tenant?.full_name || 'Tenant'} ↔ ${selectedViewing.landlord?.full_name || 'Landlord'} · ${selectedViewing.room?.title || 'Room'}`
              : 'Admin view of all confirmed viewing conversations for this user.'}
          </DialogDescription>
        </DialogHeader>

        {!selectedViewing ? (
          <ScrollArea className="flex-1 pr-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !viewings || viewings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No confirmed viewings / chats for this user.
              </div>
            ) : (
              <div className="space-y-2">
                {viewings.map((v) => {
                  const isTenant = v.tenant_id === userId;
                  const other = isTenant ? v.landlord?.full_name : v.tenant?.full_name;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedViewing(v)}
                      className="w-full text-left border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {isTenant ? 'To' : 'From'}: {other || 'Unknown'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {isTenant ? 'as Tenant' : 'as Landlord'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
                            <Home className="h-3 w-3" />
                            {v.room?.title || 'Room'}
                          </p>
                        </div>
                        <Badge>{v.status}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            {msgLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No messages exchanged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const fromTenant = m.sender_id === selectedViewing.tenant_id;
                  const senderName = fromTenant
                    ? selectedViewing.tenant?.full_name || 'Tenant'
                    : selectedViewing.landlord?.full_name || 'Landlord';
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col max-w-[80%] rounded-lg px-3 py-2',
                        fromTenant
                          ? 'bg-muted self-start'
                          : 'bg-primary/10 self-end ml-auto'
                      )}
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {senderName} {m.is_filtered && <span className="text-destructive">· filtered</span>}
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(m.created_at), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserChatsDialog;
