import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Lock, MessageCircle, CheckCheck, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { containsBlockedContent, getBlockedContentMessage } from '@/lib/messageFilter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ViewingMessage {
  id: string;
  viewing_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface ViewingChatProps {
  viewingId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  isLocked: boolean; // True if viewing is not yet confirmed
  lockReason?: string;
}

export const ViewingChat: React.FC<ViewingChatProps> = ({
  viewingId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  isLocked,
  lockReason,
}) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ViewingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!viewingId || isLocked) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('viewing_messages')
        .select('*')
        .eq('viewing_id', viewingId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as ViewingMessage[]);
        // Mark messages as read
        const unreadIds = data
          .filter(m => m.sender_id !== user?.id && !m.read_at)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('viewing_messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`viewing_chat_${viewingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'viewing_messages',
          filter: `viewing_id=eq.${viewingId}`,
        },
        (payload) => {
          const newMsg = payload.new as ViewingMessage;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if from other user
          if (newMsg.sender_id !== user?.id) {
            supabase
              .from('viewing_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewingId, isLocked, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || sending) return;

    // Check for blocked content
    if (containsBlockedContent(newMessage)) {
      toast.error(getBlockedContentMessage());
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('viewing_messages')
        .insert({
          viewing_id: viewingId,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast.error(isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'HH:mm');
    } catch {
      return '';
    }
  };

  if (isLocked) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            {isRTL ? 'المحادثة مغلقة' : 'Chat Locked'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {lockReason || (isRTL 
              ? 'ستفتح المحادثة بعد تأكيد موعد المعاينة'
              : 'Chat will unlock after viewing time is confirmed'
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-[400px]">
      <CardHeader className="pb-3 bg-primary/5 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {otherUserName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{otherUserName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'محادثة الموعد' : 'Viewing Chat'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <MessageCircle className="w-3 h-3 mr-1" />
            {isRTL ? 'مفتوحة' : 'Active'}
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">
              {isRTL 
                ? 'ابدأ المحادثة لتنسيق موعد المعاينة'
                : 'Start chatting to coordinate your viewing'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isMine ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2',
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      isMine ? 'justify-end' : 'justify-start'
                    )}>
                      <span className={cn(
                        'text-[10px]',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {formatTime(msg.created_at)}
                      </span>
                      {isMine && (
                        msg.read_at ? (
                          <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="w-3 h-3 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type a message...'}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          {isRTL 
            ? 'لا يُسمح بمشاركة أرقام الهاتف أو البريد الإلكتروني'
            : 'Phone numbers and emails are not allowed'
          }
        </p>
      </div>
    </Card>
  );
};

export default ViewingChat;
