import React from 'react';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageCircle, CheckCircle, Home } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { data: conversations, isLoading, error } = useConversations();

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <p>{t('messages.failedToLoad')}</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-center">{t('messages.noConversations')}</p>
        <p className="text-sm text-center mt-1">
          {t('messages.startChatting')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id;
          const isUnread = conversation.unread_count && conversation.unread_count > 0;
          const lastMessageIsOwn = conversation.last_message?.sender_id === user?.id;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                isRTL && 'text-right',
                isSelected && 'bg-muted',
                isUnread && !isSelected && 'bg-primary/5'
              )}
            >
              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.other_participant?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(conversation.other_participant?.full_name || '')}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.other_participant?.verification_status === 'verified' && (
                    <div className={`absolute -bottom-1 ${isRTL ? '-left-1' : '-right-1'} bg-background rounded-full p-0.5`}>
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h4 className={cn(
                      'font-medium truncate',
                      isUnread && 'font-semibold'
                    )}>
                      {conversation.other_participant?.full_name || t('messages.unknownUser')}
                    </h4>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {conversation.last_message_at && 
                        formatDistanceToNow(new Date(conversation.last_message_at), { 
                          addSuffix: true,
                          locale: language === 'ar' ? ar : enUS
                        })}
                    </span>
                  </div>

                  {conversation.room && (
                    <p className={`text-xs text-muted-foreground flex items-center gap-1 mt-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Home className="w-3 h-3" />
                      <span className="truncate">{conversation.room.title}</span>
                    </p>
                  )}

                  <div className={`flex items-center justify-between gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <p className={cn(
                      'text-sm truncate',
                      isUnread ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {lastMessageIsOwn && <span className="text-muted-foreground">{t('messages.you')}: </span>}
                      {truncateMessage(conversation.last_message?.content || t('messages.noMessagesYet'))}
                    </p>
                    {isUnread && (
                      <Badge className="bg-primary text-primary-foreground text-xs px-2">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
