import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportChat } from '@/hooks/useSupportChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Headphones, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SupportChatWindowProps {
  onBack: () => void;
}

const SupportChatWindow: React.FC<SupportChatWindowProps> = ({ onBack }) => {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { conversation, messages, loading, getOrCreateConversation, sendMessage } = useSupportChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrCreateConversation();
  }, [getOrCreateConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput('');
    await sendMessage(trimmed);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Headphones className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'يرجى تسجيل الدخول أولاً للتحدث مع خدمة العملاء' : 'Please log in first to chat with customer support'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Headphones className="w-5 h-5" />
        <div>
          <p className="font-semibold text-sm">
            {language === 'ar' ? 'خدمة العملاء' : 'Customer Support'}
          </p>
          <p className="text-[11px] opacity-80">
            {language === 'ar' ? 'فريق سكنك' : 'Sakanak Team'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Welcome message */}
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-muted text-foreground">
                {language === 'ar'
                  ? 'مرحبًا! 👋 فريق دعم سكنك هنا لمساعدتك. اكتب رسالتك وهنرد عليك في أقرب وقت.'
                  : "Hello! 👋 Sakanak support team is here to help. Send your message and we'll reply as soon as possible."}
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn('flex gap-2', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
                        isMe
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      {msg.content}
                    </div>
                    <p className={cn('text-[10px] text-muted-foreground mt-0.5', isMe ? 'text-right' : 'text-left')}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
            disabled={sending || loading}
            className="flex-1 text-sm"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-10 w-10 flex-shrink-0 bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChatWindow;
