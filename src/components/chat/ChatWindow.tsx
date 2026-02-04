import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessages, useSendMessage, useConversation, Message } from '@/hooks/useConversations';
import { containsBlockedContent, getBlockedContentMessage } from '@/lib/messageFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Shield,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onBack }) => {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { data: conversation, isLoading: convLoading } = useConversation(conversationId);
  const { data: messages, isLoading: msgLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  
  const [inputValue, setInputValue] = useState('');
  const [filterWarning, setFilterWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Check for blocked content as user types
    if (containsBlockedContent(value)) {
      setFilterWarning(getBlockedContentMessage());
    } else {
      setFilterWarning(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) return;
    
    // Final check for blocked content
    if (containsBlockedContent(trimmedMessage)) {
      toast.error(getBlockedContentMessage());
      return;
    }
    
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: trimmedMessage,
      });
      setInputValue('');
      setFilterWarning(null);
    } catch (error) {
      toast.error(t('messages.failedToSend'));
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? ar : enUS;
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale });
    } else if (isYesterday(date)) {
      return `${t('messages.yesterday')} ${format(date, 'HH:mm', { locale })}`;
    }
    return format(date, 'MMM d, HH:mm', { locale });
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  if (convLoading || msgLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>{t('messages.conversationNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b bg-card ${isRTL ? 'flex-row-reverse' : ''}`}>
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        )}
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.other_participant?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {getInitials(conversation.other_participant?.full_name || '')}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <h3 className="font-semibold truncate">
              {conversation.other_participant?.full_name || t('messages.unknownUser')}
            </h3>
            {conversation.other_participant?.verification_status === 'verified' && (
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          {conversation.room && (
            <p className={`text-xs text-muted-foreground flex items-center gap-1 truncate ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Home className="w-3 h-3" />
              {conversation.room.title}
            </p>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="px-4 py-2 bg-primary/5 border-b">
        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Shield className="w-3 h-3 text-primary" />
          <span>{t('messages.protectedNotice')}</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>{t('messages.noMessagesStart')}</p>
            </div>
          )}
          
          {messages?.map((message: Message) => {
            const isOwn = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isOwn ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')
                )}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2',
                    isOwn
                      ? `bg-primary text-primary-foreground ${isRTL ? 'rounded-bl-md' : 'rounded-br-md'}`
                      : `bg-muted ${isRTL ? 'rounded-br-md' : 'rounded-bl-md'}`
                  )}
                >
                  {message.is_filtered && (
                    <Badge variant="destructive" className={`mb-1 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <AlertTriangle className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('messages.contentFiltered')}
                    </Badge>
                  )}
                  <p className={`break-words ${isRTL ? 'text-right' : ''}`}>{message.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      isRTL ? 'text-left' : 'text-right',
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {formatMessageTime(message.created_at)}
                    {isOwn && message.read_at && (
                      <span className={isRTL ? 'mr-1' : 'ml-1'}>✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Filter Warning */}
      {filterWarning && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className={`flex items-start gap-2 text-sm text-destructive ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{filterWarning}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-card">
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={t('messages.typeMessage')}
            className={`flex-1 ${isRTL ? 'text-right' : ''}`}
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || sendMessage.isPending || !!filterWarning}
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
